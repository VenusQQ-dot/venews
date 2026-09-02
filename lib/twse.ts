/**
 * 台股官方免費資料層(證交所 OpenAPI)。
 *
 * 全部是公開、免金鑰的 GET JSON 端點,回傳「物件陣列」。部署在 Vercel / GitHub
 * Actions / 本機都可直連;唯獨部分沙箱環境的 egress 政策會封鎖 twse.com.tw。
 *
 * 欄位名稱風險:證交所偶爾微調 JSON key。為了不因單一 key 改名就整個壞掉,
 * 這裡用「候選 key + 關鍵字模糊比對」的容錯取值(pickNum/pickStr),取不到時
 * 記錄診斷而非丟例外。第一次上線請跑 scripts/twse-probe.mjs 確認實際 key。
 */

const BASE = 'https://openapi.twse.com.tw/v1';

export type RawRecord = Record<string, unknown>;

/** 合併後的個股當日資料(價量 + 三大法人 + 最新月營收)。 */
export type StockDaily = {
  code: string;
  name: string;
  market: 'TWSE';
  close: number | null;
  high: number | null;
  low: number | null;
  change: number | null;
  volume: number; // 成交股數
  foreignNet: number; // 外資買賣超(股)
  trustNet: number; // 投信買賣超(股)
  dealerNet: number; // 自營商買賣超(股)
  instiNet: number; // 三大法人合計買賣超(股)
  revYoy: number | null; // 月營收年增率(%)
  revMom: number | null; // 月營收月增率(%)
};

export type FetchDiag = {
  ok: boolean;
  counts: { stockDay: number; insti: number; revenue: number; merged: number };
  warnings: string[];
};

/** 抓一個 OpenAPI 端點,固定 30 秒逾時,回傳物件陣列(失敗丟帶端點名的錯誤)。 */
async function fetchJson(path: string): Promise<RawRecord[]> {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    // Next.js:這類盤後資料每天才更新,交給呼叫端決定時機,不做 ISR 快取
    cache: 'no-store',
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`TWSE ${path} 回應 ${res.status}`);
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) throw new Error(`TWSE ${path} 非陣列格式`);
  return data as RawRecord[];
}

/** 把證交所常見的「1,234」「--」「NaN」轉成數字;無法解析回 null。 */
export function parseNum(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v !== 'string') return null;
  const cleaned = v.replace(/,/g, '').replace(/\s/g, '').trim();
  if (cleaned === '' || cleaned === '--' || cleaned === 'NaN') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/**
 * 容錯取數字:先試候選 key(精準),再用關鍵字(每段都要出現在 key 內)模糊比對。
 * 都找不到時把該 key 記入 misses(供診斷),回傳 0。
 */
function pickNum(
  rec: RawRecord,
  candidates: string[],
  keywords: string[][],
  missLabel: string,
  misses: Set<string>,
): number {
  for (const key of candidates) {
    if (key in rec) {
      const n = parseNum(rec[key]);
      if (n !== null) return n;
    }
  }
  const keys = Object.keys(rec);
  for (const group of keywords) {
    const hit = keys.find(k => group.every(frag => k.includes(frag)));
    if (hit) {
      const n = parseNum(rec[hit]);
      if (n !== null) return n;
    }
  }
  misses.add(missLabel);
  return 0;
}

function pickStr(rec: RawRecord, candidates: string[]): string {
  for (const key of candidates) {
    const v = rec[key];
    if (typeof v === 'string' && v.trim() !== '') return v.trim();
  }
  return '';
}

/** 上市個股日成交:收盤/最高/最低/漲跌/成交股數。 */
async function fetchStockDay(misses: Set<string>): Promise<Map<string, StockDaily>> {
  const rows = await fetchJson('/exchangeReport/STOCK_DAY_ALL');
  const map = new Map<string, StockDaily>();
  for (const r of rows) {
    const code = pickStr(r, ['Code', '證券代號', '股票代號']);
    if (!/^\d{4}$/.test(code)) continue; // 只留 4 碼普通股,排除 ETF/權證等
    map.set(code, {
      code,
      name: pickStr(r, ['Name', '證券名稱', '股票名稱']),
      market: 'TWSE',
      close: parseNum(r['ClosingPrice'] ?? r['收盤價']),
      high: parseNum(r['HighestPrice'] ?? r['最高價']),
      low: parseNum(r['LowestPrice'] ?? r['最低價']),
      change: parseNum(r['Change'] ?? r['漲跌價差']),
      volume: pickNum(r, ['TradeVolume', '成交股數'], [['成交', '股']], 'stockDay.volume', misses),
      foreignNet: 0,
      trustNet: 0,
      dealerNet: 0,
      instiNet: 0,
      revYoy: null,
      revMom: null,
    });
  }
  return map;
}

/** 三大法人買賣超日報 T86:外資 / 投信 / 自營 / 合計(單位:股)。 */
async function mergeInsti(map: Map<string, StockDaily>, misses: Set<string>): Promise<number> {
  const rows = await fetchJson('/fund/T86');
  let n = 0;
  for (const r of rows) {
    const code = pickStr(r, ['Code', '證券代號']);
    const s = map.get(code);
    if (!s) continue;
    s.foreignNet = pickNum(
      r,
      ['ForeignInvestorsExcludingForeignDealers', '外陸資買賣超股數(不含外資自營商)', '外資買賣超股數'],
      [['外', '買賣超']],
      'insti.foreign',
      misses,
    );
    s.trustNet = pickNum(
      r,
      ['InvestmentTrust', '投信買賣超股數'],
      [['投信', '買賣超']],
      'insti.trust',
      misses,
    );
    s.dealerNet = pickNum(
      r,
      ['Dealer', 'DealerNet', '自營商買賣超股數'],
      [['自營', '買賣超']],
      'insti.dealer',
      misses,
    );
    const total = pickNum(
      r,
      ['TotalBuyAndSell', '三大法人買賣超股數'],
      [['三大法人', '買賣超']],
      'insti.total',
      misses,
    );
    // 有合計欄用合計;沒有就用三者相加(容錯)
    s.instiNet = total !== 0 ? total : s.foreignNet + s.trustNet + s.dealerNet;
    n++;
  }
  return n;
}

/** 上市每月營收 t187ap05_L:最新月營收的 YoY / MoM(%)。 */
async function mergeRevenue(map: Map<string, StockDaily>): Promise<number> {
  const rows = await fetchJson('/opendata/t187ap05_L');
  let n = 0;
  for (const r of rows) {
    const code = pickStr(r, ['公司代號', 'Code', '統一編號']);
    const s = map.get(code);
    if (!s) continue;
    s.revYoy = nullableNum(r, ['營業收入-去年同月增減(%)', '去年同月增減(%)'], [['去年同月增減']]);
    s.revMom = nullableNum(r, ['營業收入-上月比較增減(%)', '上月比較增減(%)'], [['上月比較增減']]);
    n++;
  }
  return n;

  function nullableNum(rec: RawRecord, cand: string[], kw: string[][]): number | null {
    for (const k of cand) if (k in rec) { const v = parseNum(rec[k]); if (v !== null) return v; }
    const keys = Object.keys(rec);
    for (const g of kw) { const hit = keys.find(k => g.every(f => k.includes(f))); if (hit) return parseNum(rec[hit]); }
    return null;
  }
}

/**
 * 抓齊當日全市場合併資料(上市)。任一子來源失敗會記入 warnings 但不中斷:
 * 價量是核心(缺了直接失敗),法人/營收是加分項(缺了照樣可跑,只是訊號變弱)。
 */
export async function fetchMarketDaily(): Promise<{ data: StockDaily[]; diag: FetchDiag }> {
  const misses = new Set<string>();
  const warnings: string[] = [];

  const map = await fetchStockDay(misses); // 失敗即 throw:沒有價量無法分析
  const stockDay = map.size;

  let insti = 0;
  try {
    insti = await mergeInsti(map, misses);
  } catch (e) {
    warnings.push(`三大法人資料抓取失敗(略過籌碼訊號):${(e as Error).message}`);
  }

  let revenue = 0;
  try {
    revenue = await mergeRevenue(map);
  } catch (e) {
    warnings.push(`月營收資料抓取失敗(略過營收訊號):${(e as Error).message}`);
  }

  if (misses.size > 0) {
    warnings.push(
      `以下欄位無法對應,已當 0/null 處理(請跑 scripts/twse-probe.mjs 核對 key):${[...misses].join(', ')}`,
    );
  }

  const data = [...map.values()];
  return {
    data,
    diag: {
      ok: stockDay > 0,
      counts: { stockDay, insti, revenue, merged: data.length },
      warnings,
    },
  };
}
