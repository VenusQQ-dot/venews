/**
 * Groq API 極簡 client(OpenAI 相容介面),跑 Moonshot Kimi K2。
 *
 * 為什麼不用 SDK:只需要 chat completions 一個端點,直接 fetch
 * 可以少一個依賴,也避免 SDK 版本與 Vercel Edge/Node runtime 的相容問題。
 *
 * 免費額度(2026-07 查證):moonshotai/kimi-k2-instruct-0905
 * 每日 1,000 次請求、每分鐘 10,000 tokens。詳見 console.groq.com/docs。
 */

export const GROQ_MODEL = process.env.GROQ_MODEL || 'moonshotai/kimi-k2-instruct-0905';

const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

export function groqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

type ChatOptions = {
  system: string;
  user: string;
  maxTokens?: number;
  /** true 時要求模型輸出合法 JSON(Groq json_object 模式) */
  json?: boolean;
};

/**
 * 呼叫一次 chat completion,回傳純文字。
 * 429(rate limit)時依 retry-after 等待重試一次;免費額度 TPM 較緊,這很常見。
 */
export async function groqChat(opts: ChatOptions): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY 尚未設定');

  const body = JSON.stringify({
    model: GROQ_MODEL,
    max_tokens: opts.maxTokens ?? 2000,
    temperature: 0.4,
    ...(opts.json ? { response_format: { type: 'json_object' } } : {}),
    messages: [
      { role: 'system', content: opts.system },
      { role: 'user', content: opts.user },
    ],
  });

  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body,
      cache: 'no-store',
    });

    if (res.status === 429 && attempt === 0) {
      const wait = Math.min(20, Number(res.headers.get('retry-after')) || 5);
      await new Promise(r => setTimeout(r, wait * 1000));
      continue;
    }
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 300);
      throw new Error(`Groq API ${res.status}:${detail}`);
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error('Groq 回覆為空');
    return text;
  }
  throw new Error('Groq API 重試後仍被限流(429)');
}
