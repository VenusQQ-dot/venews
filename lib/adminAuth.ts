/**
 * 極簡後台登入:單一密碼(ADMIN_PASSWORD 環境變數)。
 * 登入成功後發「到期時間.HMAC簽章」格式的 cookie,middleware 與 server action 都可驗證。
 * token 綁定到期時間,外洩後最多存活 SESSION_TTL_MS;改密碼可立即使全部失效。
 * 適合個人站;多人協作時再升級成 Supabase Auth。
 */
export const ADMIN_COOKIE = 'venews_admin';

const TOKEN_MESSAGE = 'venews-admin-session-v2';
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 七天

async function hmacHex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/** 常數時間字串比較,避免時序洩漏。 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** 常數時間密碼驗證:比較雙方 HMAC 而非原文,長度差異也不洩漏。 */
export async function verifyPassword(input: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const key = 'venews-password-check';
  const [a, b] = await Promise.all([hmacHex(key, input), hmacHex(key, expected)]);
  return timingSafeEqual(a, b);
}

/** 簽發帶到期時間的 session token,格式:`<到期毫秒>.<HMAC>`。 */
export async function sessionToken(): Promise<string | null> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  const expiry = Date.now() + SESSION_TTL_MS;
  const sig = await hmacHex(password, `${TOKEN_MESSAGE}.${expiry}`);
  return `${expiry}.${sig}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;

  const dot = token.indexOf('.');
  if (dot === -1) return false;
  const expiryStr = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry) || expiry < Date.now()) return false;

  const expectedSig = await hmacHex(password, `${TOKEN_MESSAGE}.${expiry}`);
  return timingSafeEqual(sig, expectedSig);
}
