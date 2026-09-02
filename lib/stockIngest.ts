import { fetchMarketDaily, type StockDaily } from './twse';
import { screenStocks, DEFAULT_CONFIG, type Snap, type Candidate } from './stockScreener';
import { runStockroom, stockroomConfigured } from './stockroom';
import { adminConfigured, getSupabaseAdmin } from './supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * 台股盤後情報 agent 的編排層:
 *   1. ETL:抓證交所免費資料 → 寫入 stock_snapshots(逐日累積歷史)。
 *   2. 選股:讀近 N 日快照 → 跑「主力暗中吃貨」演算法。
 *   3. 解讀:候選股交給 Claude 分析室(可略過,只做籌碼掃描)。
 *   4. 落地:寫 stock_briefs(情報庫)+ 一篇 finance 文章草稿(沿用既有前台/後台)。
 *
 * 由 /api/stock-brief 觸發(Vercel Cron 每日盤後,或手動)。
 */

/** 今日台北日期(YYYY-MM-DD),資料以此為交易日索引。 */
export function taipeiDate(d = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);
  const get = (t: string) => parts.find(p => p.type === t)!.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export type StockIngestSummary = {
  tradeDate: string;
  fetched: number;
  scanned: number;
  matched: number;
  candidates: Candidate[];
  analyzed: boolean;
  reviewed: boolean;
  insufficientHistory: boolean;
  draftInserted: boolean;
  notes: string[];
};

function toSnapshotRow(s: StockDaily, tradeDate: string) {
  return {
    trade_date: tradeDate,
    code: s.code,
    name: s.name,
    market: s.market,
    close: s.close,
    high: s.high,
    low: s.low,
    change: s.change,
    volume: s.volume,
    foreign_net: s.foreignNet,
    trust_net: s.trustNet,
    dealer_net: s.dealerNet,
    insti_net: s.instiNet,
    rev_yoy: s.revYoy,
    rev_mom: s.revMom,
  };
}

/** 分批 upsert,避免單次 payload 過大。 */
async function upsertSnapshots(
  supabase: SupabaseClient,
  rows: ReturnType<typeof toSnapshotRow>[],
): Promise<string[]> {
  const notes: string[] = [];
  const chunk = 500;
  for (let i = 0; i < rows.length; i += chunk) {
    const { error } = await supabase
      .from('stock_snapshots')
      .upsert(rows.slice(i, i + chunk), { onConflict: 'trade_date,code' });
    if (error) notes.push(`快照寫入失敗(第 ${i / chunk + 1} 批):${error.message}`);
  }
  return notes;
}

/** 讀近 windowDays 日全部快照(分頁繞過 1000 列上限),組成 code → 升冪快照陣列。 */
async function loadHistory(
  supabase: SupabaseClient,
  sinceDate: string,
): Promise<Map<string, Snap[]>> {
  const pageSize = 1000;
  const all: Snap[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('stock_snapshots')
      .select(
        'trade_date,code,name,close,high,low,change,volume,foreign_net,trust_net,dealer_net,insti_net,rev_yoy,rev_mom',
      )
      .gte('trade_date', sinceDate)
      .order('trade_date', { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`讀取歷史快照失敗:${error.message}`);
    const rows = (data ?? []) as Snap[];
    all.push(...rows);
    if (rows.length < pageSize) break;
  }

  const map = new Map<string, Snap[]>();
  for (const r of all) {
    const arr = map.get(r.code) ?? [];
    arr.push(r);
    map.set(r.code, arr);
  }
  // gte + order 已保證升冪,但保險起見再排一次
  for (const arr of map.values()) arr.sort((a, b) => a.trade_date.localeCompare(b.trade_date));
  return map;
}

/** 沒有 Claude 時的後備:直接把候選表列成 markdown。 */
function plainBrief(candidates: Candidate[], tradeDate: string): string {
  if (candidates.length === 0) {
    return `## ${tradeDate} 盤後籌碼掃描\n今日無符合「主力暗中吃貨」條件的個股。`;
  }
  const rows = candidates
    .map(
      c =>
        `- **${c.code} ${c.name}**｜收盤 ${c.close ?? '—'}｜法人5日買超 ${c.instiNet5d} 張(佔量 ${c.concentrationPct}%)｜連買 ${c.instiStreak} 天｜營收YoY ${c.revYoy == null ? '未更新' : `${c.revYoy}%`}`,
    )
    .join('\n');
  return (
    `## ${tradeDate} 盤後籌碼掃描(未啟用 AI 解讀)\n` +
    `以下為「低基期橫盤 + 三大法人集中買超 + 尚未噴出」的候選股:\n\n${rows}\n\n` +
    `> 本清單為程式自動籌碼掃描,僅供研究,不構成投資建議。`
  );
}

/**
 * 跑一次完整台股情報 agent。
 * analyze=true 時才呼叫 Claude 解讀(耗時/耗費);autoPublish=true 時文章直接發佈,否則存草稿。
 */
export async function ingestStockBrief(
  { analyze = true, autoPublish = false } = {},
): Promise<StockIngestSummary> {
  if (!adminConfigured()) throw new Error('尚未設定 Supabase');
  const tradeDate = taipeiDate();
  const notes: string[] = [];
  const supabase = getSupabaseAdmin();

  // 1) ETL
  const { data, diag } = await fetchMarketDaily();
  notes.push(
    `抓取:個股 ${diag.counts.stockDay}、法人 ${diag.counts.insti}、營收 ${diag.counts.revenue}`,
  );
  notes.push(...diag.warnings);
  notes.push(...(await upsertSnapshots(supabase, data.map(s => toSnapshotRow(s, tradeDate)))));

  // 2) 選股(讀近 ~45 日曆歷史,足夠 lookback 個交易日)
  const since = taipeiDate(new Date(Date.now() - 45 * 86400_000));
  const history = await loadHistory(supabase, since);
  const screen = screenStocks(history, DEFAULT_CONFIG);
  if (screen.insufficientHistory) {
    notes.push(`歷史不足(需累積約 ${DEFAULT_CONFIG.lookback} 個交易日),今日僅完成資料累積。`);
  }
  notes.push(`掃描 ${screen.scanned} 檔,${screen.matched} 檔符合籌碼條件。`);

  // 3) 解讀
  let briefMd: string;
  let analyzed = false;
  let reviewed = false;
  if (analyze && stockroomConfigured() && screen.candidates.length > 0) {
    try {
      const r = await runStockroom(screen.candidates, tradeDate);
      briefMd = r.briefMd;
      analyzed = true;
      reviewed = r.reviewed;
      if (!r.reviewed) notes.push(`AI 情報未過合規查證:${r.reason}`);
    } catch (e) {
      notes.push(`AI 解讀失敗,改用純籌碼清單:${(e as Error).message}`);
      briefMd = plainBrief(screen.candidates, tradeDate);
    }
  } else {
    briefMd = plainBrief(screen.candidates, tradeDate);
    if (analyze && !stockroomConfigured()) notes.push('未設定 ANTHROPIC_API_KEY,略過 AI 解讀。');
  }

  // 4a) 情報庫
  const { error: briefErr } = await supabase.from('stock_briefs').upsert(
    {
      trade_date: tradeDate,
      candidates: screen.candidates,
      brief_md: briefMd,
      scanned: screen.scanned,
      matched: screen.matched,
      notes,
    },
    { onConflict: 'trade_date' },
  );
  if (briefErr) notes.push(`情報庫寫入失敗:${briefErr.message}`);

  // 4b) finance 文章草稿(沿用既有前台/後台)
  let draftInserted = false;
  const slug = `stock-${tradeDate.replace(/-/g, '')}`;
  const summary =
    screen.candidates.length > 0
      ? `盤後掃描 ${screen.scanned} 檔,篩出 ${screen.matched} 檔主力籌碼異常集中的低基期個股。`
      : `盤後掃描 ${screen.scanned} 檔,今日無符合條件個股。`;
  const { error: artErr } = await supabase.from('articles').upsert(
    {
      slug,
      title: `台股盤後籌碼情報 ${tradeDate}`,
      summary,
      content: briefMd,
      category: 'finance',
      author: '籌碼情報 Agent',
      read_mins: Math.min(15, Math.max(2, Math.ceil(briefMd.length / 400))),
      status: autoPublish ? 'published' : 'draft',
      published_at: autoPublish ? new Date().toISOString() : null,
    },
    { onConflict: 'slug' },
  );
  if (artErr) notes.push(`文章寫入失敗:${artErr.message}`);
  else draftInserted = true;

  return {
    tradeDate,
    fetched: data.length,
    scanned: screen.scanned,
    matched: screen.matched,
    candidates: screen.candidates,
    analyzed,
    reviewed,
    insufficientHistory: screen.insufficientHistory,
    draftInserted,
    notes,
  };
}
