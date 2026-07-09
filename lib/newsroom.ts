import Anthropic from '@anthropic-ai/sdk';
import { categories } from '../app/data/news';

/**
 * 自動 AI 新聞編輯部(Phase 3 前置)。
 *
 * 流水線:偵察(web 搜尋找當日 AI 新聞)→ 撰稿(fetch 原文寫成繁中文章)
 *        → 主編(查證:是否有來源根據、是否編造、品質是否達標)。
 * 只有通過主編查證的文章才會進資料庫,且預設為「草稿」等人工確認。
 *
 * 由 /api/ingest 觸發(Vercel Cron 每日排程,或後台手動按一次)。
 * 需要 ANTHROPIC_API_KEY;未設定時整個功能停用。
 */

const MODEL = 'claude-opus-4-8';
const CATEGORY_IDS = categories.map(c => c.id);

export function newsroomConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export type ScoutItem = { headline: string; url: string; note: string };
export type DraftArticle = {
  title: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  read_mins: number;
  source_url: string;
};
export type IngestResult = {
  scouted: number;
  written: number;
  published: number;
  rejected: number;
  drafts: DraftArticle[];
  notes: string[];
};

/** 從模型回覆裡抽出第一個 JSON 區塊(容忍 ```json 圍欄與前後贅字)。 */
function extractJson<T>(text: string): T | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.search(/[[{]/);
  if (start === -1) return null;
  // 從第一個括號往後嘗試遞減截斷,找出可解析的 JSON
  for (let end = raw.length; end > start; end--) {
    const slice = raw.slice(start, end).trim();
    if (!/[\]}]$/.test(slice)) continue;
    try {
      return JSON.parse(slice) as T;
    } catch {
      /* 繼續縮短 */
    }
  }
  return null;
}

/** 收集回覆中的純文字(server tool 回合會夾雜工具區塊)。 */
function textOf(message: Anthropic.Message): string {
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('\n');
}

/**
 * 呼叫一次 Messages API,並自動處理 server tool 的 pause_turn
 * (web_search / web_fetch 逾內部迴圈時會暫停,需回傳同一輪續跑)。
 */
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
      max_tokens: 16000,
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

const WEB_TOOLS: Anthropic.ToolUnion[] = [
  { type: 'web_search_20260209', name: 'web_search', max_uses: 8 },
  { type: 'web_fetch_20260209', name: 'web_fetch', max_uses: 8 },
];

/** 偵察:搜尋當日 AI 新聞,回傳候選清單(含來源網址)。 */
async function scout(client: Anthropic, max: number): Promise<ScoutItem[]> {
  const text = await runWithServerTools(
    client,
    '你是新聞編輯部的偵察員,負責找出當日最重要的人工智慧(AI)新聞。只挑真實、有可靠來源的報導。',
    `用 web_search 找出過去 24 小時內最重要的 ${max} 則 AI 新聞(模型發布、產業動態、政策、研究突破等)。` +
      `為每一則附上原始報導的來源網址。最後只輸出一個 JSON 陣列,不要多餘文字,格式:\n` +
      `[{"headline":"標題","url":"來源網址","note":"一句話說明為何重要"}]`,
    [WEB_TOOLS[0]],
  );
  const items = extractJson<ScoutItem[]>(text) ?? [];
  return items.filter(i => i.url?.startsWith('http')).slice(0, max);
}

/** 撰稿:fetch 來源原文,改寫成繁中新聞文章。 */
async function write(client: Anthropic, item: ScoutItem): Promise<DraftArticle | null> {
  const text = await runWithServerTools(
    client,
    '你是新聞記者,根據來源原文改寫成繁體中文新聞。只根據來源事實撰寫,嚴禁虛構數字、人名或引述。文末不需列出來源(系統會另外附上)。',
    `用 web_fetch 讀取這則新聞的原文:${item.url}\n` +
      `讀完後改寫成一篇繁體中文新聞。分類必須是這些之一:${CATEGORY_IDS.join(', ')}(AI/科技類請用 tech)。\n` +
      `只輸出一個 JSON 物件,不要多餘文字,格式:\n` +
      `{"title":"標題","summary":"60-100字摘要","content":"完整內文(數段)","category":"分類id","author":"編譯","read_mins":閱讀分鐘數}`,
    [WEB_TOOLS[1]],
  );
  const draft = extractJson<Omit<DraftArticle, 'source_url'>>(text);
  if (!draft?.title || !draft.content) return null;
  const category = CATEGORY_IDS.includes(draft.category) ? draft.category : 'tech';
  return {
    title: draft.title.trim(),
    summary: (draft.summary ?? '').trim(),
    content: draft.content,
    category,
    author: draft.author?.trim() || '編譯',
    read_mins: Math.min(30, Math.max(1, Number(draft.read_mins) || 4)),
    source_url: item.url,
  };
}

/** 主編查證:是否有來源根據、是否可能編造、品質是否達標。 */
async function review(
  client: Anthropic,
  draft: DraftArticle,
  item: ScoutItem,
): Promise<{ pass: boolean; reason: string }> {
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: '你是嚴格的新聞主編,負責在發布前把關。寧可退稿,不可放行有問題的稿件。',
    output_config: {
      format: {
        type: 'json_schema',
        schema: {
          type: 'object',
          properties: {
            grounded: { type: 'boolean' },
            quality_ok: { type: 'boolean' },
            reason: { type: 'string' },
          },
          required: ['grounded', 'quality_ok', 'reason'],
          additionalProperties: false,
        },
      },
    },
    messages: [
      {
        role: 'user',
        content:
          `來源網址:${item.url}\n來源要點:${item.headline} — ${item.note}\n\n` +
          `待審文章標題:${draft.title}\n摘要:${draft.summary}\n內文:\n${draft.content}\n\n` +
          `請判斷:(1) grounded:內容是否確實根據該來源、沒有明顯虛構或誇大;` +
          `(2) quality_ok:是否語句通順、資訊完整、適合當作新聞發布;(3) reason:一句話理由。`,
      },
    ],
  });
  const verdict = extractJson<{ grounded: boolean; quality_ok: boolean; reason: string }>(
    textOf(res),
  );
  if (!verdict) return { pass: false, reason: '主編回覆無法解析' };
  return { pass: verdict.grounded && verdict.quality_ok, reason: verdict.reason };
}

/**
 * 跑完整條流水線,回傳通過查證的草稿(不負責寫入資料庫,由呼叫端處理)。
 */
export async function runNewsroom(maxStories = 5): Promise<IngestResult> {
  if (!newsroomConfigured()) throw new Error('ANTHROPIC_API_KEY 尚未設定');
  const client = new Anthropic();
  const notes: string[] = [];
  const drafts: DraftArticle[] = [];
  let written = 0;
  let rejected = 0;

  const items = await scout(client, maxStories);
  notes.push(`偵察到 ${items.length} 則候選`);

  for (const item of items) {
    let draft: DraftArticle | null = null;
    try {
      draft = await write(client, item);
    } catch (e) {
      notes.push(`撰稿失敗(${item.url}):${(e as Error).message}`);
      continue;
    }
    if (!draft) {
      notes.push(`撰稿無效輸出:${item.url}`);
      continue;
    }
    written++;

    const verdict = await review(client, draft, item);
    if (verdict.pass) {
      drafts.push(draft);
    } else {
      rejected++;
      notes.push(`退稿「${draft.title}」:${verdict.reason}`);
    }
  }

  return {
    scouted: items.length,
    written,
    published: drafts.length,
    rejected,
    drafts,
    notes,
  };
}
