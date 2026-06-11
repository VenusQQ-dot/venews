/**
 * 極簡後台登入:單一密碼(ADMIN_PASSWORD 環境變數)。
 * 登入成功後發 HMAC cookie,middleware 與 server action 都可驗證。
 * 適合個人站;多人協作時再升級成 Supabase Auth。
 */
export const ADMIN_COOKIE = 'venews_admin';

const TOKEN_MESSAGE = 'venews-admin-session-v1';

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

export async function sessionToken(): Promise<string | null> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return hmacHex(password, TOKEN_MESSAGE);
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const expected = await sessionToken();
  if (!expected || token.length !== expected.length) return false;
  // 等長逐字比較,避免時序洩漏
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
