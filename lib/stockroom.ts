import Anthropic from '@anthropic-ai/sdk';
import { extractJson } from './newsroom';
import type { Candidate } from './stockScreener';

/**
 * 台股情報「分析室」——把籌碼演算法選出的候選股,交給 Claude 做兩段式處理:
 *   1. 分析師:用 web_search 查每檔近期題材/法說會/是否已滿街利多,寫成繁中盤後情報。
 *   2. 主編:把關語氣,禁止「保證獲利/報明牌」式表述,確保有風險與免責聲明。
 *
 * 只做「解讀已篩出的客觀數據」,不叫模型自己憑空選股,避免幻覺個股。
 * 需要 ANTHROPIC_API_KEY;未設定時 stockroomConfigured() 回 false,呼叫端會略過解讀。
 */

const MODEL = 'claude-opus-4-8';

export function stockroomConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const WEB_TOOLS: Anthropic.ToolUnion[] = [
  { type: 'web_search_20260209', name: 'web_search', max_uses: 10 },
];

function textOf(message: Anthropic.Message): string {
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('\n');
}

/** 呼叫 Messages API 並處理 server tool 的 pause_turn(同 newsroom)。 */
async function runWithServerTools(
  client: Anthropic,
  system: string,
  userText: string,
  tools: Anthropic.ToolUnion[],
): Promise<string> {
  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: userText }];
  for (let i = 0; i < 6; i++) {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system,
      tools,
      messages,
    });
    if (res.stop_reason === 'pause_turn') {
      messages.push({ role: 'assistant', content: res.content });
      continue;
    }
    return textOf(res);
  }
  throw new Error('server tool 迴圈超過上限');
}

/** 把候選股整理成給模型看的表格文字。 */
function candidatesTable(candidates: Candidate[]): string {
  return candidates
    .map(
      (c, i) =>
        `${i + 1}. ${c.code} ${c.name}｜收盤 ${c.close ?? '—'}｜當日 ${
          c.changePct == null ? '—' : `${c.changePct}%`
        }｜近期高低差 ${c.rangePct}%｜法人5日買超 ${c.instiNet5d} 張(佔量 ${c.concentrationPct}%)｜連買 ${
          c.instiStreak
        } 天｜營收YoY ${c.revYoy == null ? '未更新' : `${c.revYoy}%`}`,
    )
    .join('\n');
}

const DISCLAIMER =
  '本情報由程式依公開籌碼與價量資料自動彙整,僅為技術面/籌碼面觀察,不構成任何投資建議或買賣邀約。' +
  '資料可能延遲或有誤,投資決策與風險請自行判斷。';

/** 分析師:解讀候選股,輸出繁中 markdown 盤後情報。 */
async function analyze(
  client: Anthropic,
  candidates: Candidate[],
  tradeDate: string,
): Promise<string> {
  const system =
    '你是台股資深籌碼分析師,替專業投資人寫盤後情報。你只解讀「已由程式篩出的客觀數據」,' +
    '可用 web_search 查證每檔近期是否有題材、法說會或新聞,判斷主力是「默默吃貨(還沒新聞)」還是「利多已滿街」。' +
    '嚴禁報明牌、喊目標價、保證獲利,也不得虛構不存在的個股或消息。用台灣用語、繁體中文。';

  const user =
    `日期:${tradeDate}(台北)。以下是今日「主力暗中吃貨」籌碼演算法篩出的候選股(已符合:低基期橫盤 + 三大法人集中買超 + 營收有底氣 + 尚未噴出):\n\n` +
    `${candidatesTable(candidates)}\n\n` +
    `請針對前 5~8 檔,各用 web_search 快速查一下近期狀況,然後輸出一份繁體中文盤後情報(markdown),結構:\n` +
    `## 今日盤後籌碼焦點\n2~4 句總結今天籌碼面的整體觀察。\n` +
    `## 主力默默吃貨觀察名單\n每檔用 ### 代號 名稱,說明:籌碼訊號(法人買超/連買/佔量)、目前是否已有新聞題材(有=較晚、無=較早期)、可能的觀察題材、以及要注意的風險。\n` +
    `## 追蹤建議\n提醒接下來要對照的功課(月營收開牌、法說會簡報關鍵字)。\n` +
    `最後務必附上一段免責聲明:「${DISCLAIMER}」\n` +
    `只輸出 markdown 內文,不要 code fence,不要多餘前後語。`;

  const md = await runWithServerTools(client, system, user, WEB_TOOLS);
  return md.replace(/^```(?:markdown)?\s*/i, '').replace(/```\s*$/, '').trim();
}

/** 主編查證:語氣是否越界、是否有明牌/保證獲利、免責是否齊全。 */
async function review(client: Anthropic, brief: string): Promise<{ pass: boolean; reason: string }> {
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: '你是嚴格的財經內容合規主編,寧可退稿也不放行違規內容。',
    output_config: {
      format: {
        type: 'json_schema',
        schema: {
          type: 'object',
          properties: {
            compliant: { type: 'boolean' }, // 無報明牌/保證獲利/喊單語氣
            has_disclaimer: { type: 'boolean' }, // 具備免責聲明
            reason: { type: 'string' },
          },
          required: ['compliant', 'has_disclaimer', 'reason'],
          additionalProperties: false,
        },
      },
    },
    messages: [
      {
        role: 'user',
        content:
          `審查以下台股盤後情報:\n\n${brief}\n\n` +
          `判斷:(1) compliant:是否「沒有」保證獲利、喊進喊出、報明牌、目標價等越界表述;` +
          `(2) has_disclaimer:是否含免責聲明;(3) reason:一句話理由。`,
      },
    ],
  });
  const v = extractJson<{ compliant: boolean; has_disclaimer: boolean; reason: string }>(textOf(res));
  if (!v) return { pass: false, reason: '主編回覆無法解析' };
  return { pass: v.compliant && v.has_disclaimer, reason: v.reason };
}

export type BriefResult = { briefMd: string; reviewed: boolean; reason: string };

/**
 * 產生盤後情報:分析師撰寫 → 主編查證。未過審時附上原因並補免責,仍回傳(標記 reviewed=false)。
 */
export async function runStockroom(candidates: Candidate[], tradeDate: string): Promise<BriefResult> {
  if (!stockroomConfigured()) throw new Error('ANTHROPIC_API_KEY 尚未設定');
  if (candidates.length === 0) {
    return {
      briefMd: `## 今日盤後籌碼焦點\n今日無符合「主力暗中吃貨」條件的個股。\n\n> ${DISCLAIMER}`,
      reviewed: true,
      reason: '無候選',
    };
  }
  const client = new Anthropic();
  const briefMd = await analyze(client, candidates, tradeDate);
  const verdict = await review(client, briefMd);
  if (verdict.pass) return { briefMd, reviewed: true, reason: verdict.reason };
  // 未過審:保留內容但明確標註,並確保免責存在
  const withNote =
    `> ⚠️ 本篇未通過合規查證(${verdict.reason}),請謹慎參考。\n\n${briefMd}\n\n> ${DISCLAIMER}`;
  return { briefMd: withNote, reviewed: false, reason: verdict.reason };
}
