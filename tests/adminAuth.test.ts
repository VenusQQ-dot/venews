import { beforeEach, describe, expect, it } from 'vitest';
import { sessionToken, verifySessionToken, verifyPassword, SESSION_TTL_MS } from '../lib/adminAuth';

describe('adminAuth', () => {
  beforeEach(() => {
    process.env.ADMIN_PASSWORD = 'test-password-123';
  });

  it('簽發的 token 可通過驗證', async () => {
    const token = await sessionToken();
    expect(token).toBeTruthy();
    expect(await verifySessionToken(token!)).toBe(true);
  });

  it('token 帶到期時間,格式為「到期毫秒.簽章」', async () => {
    const token = await sessionToken();
    const [expiry, sig] = token!.split('.');
    expect(Number(expiry)).toBeGreaterThan(Date.now());
    expect(Number(expiry)).toBeLessThanOrEqual(Date.now() + SESSION_TTL_MS);
    expect(sig).toMatch(/^[0-9a-f]{64}$/);
  });

  it('過期 token 驗證失敗', async () => {
    const token = await sessionToken();
    const [, sig] = token!.split('.');
    const expired = `${Date.now() - 1000}.${sig}`;
    expect(await verifySessionToken(expired)).toBe(false);
  });

  it('竄改到期時間會使簽章失效', async () => {
    const token = await sessionToken();
    const [, sig] = token!.split('.');
    const tampered = `${Date.now() + 999999999}.${sig}`;
    expect(await verifySessionToken(tampered)).toBe(false);
  });

  it('拒絕格式錯誤或空 token', async () => {
    expect(await verifySessionToken(undefined)).toBe(false);
    expect(await verifySessionToken('')).toBe(false);
    expect(await verifySessionToken('not-a-token')).toBe(false);
    expect(await verifySessionToken('123.deadbeef')).toBe(false);
  });

  it('改密碼後舊 token 立即失效', async () => {
    const token = await sessionToken();
    process.env.ADMIN_PASSWORD = 'new-password';
    expect(await verifySessionToken(token!)).toBe(false);
  });

  it('未設定密碼時不簽發也不通過', async () => {
    delete process.env.ADMIN_PASSWORD;
    expect(await sessionToken()).toBeNull();
    expect(await verifySessionToken('123.abc')).toBe(false);
  });

  it('verifyPassword 僅正確密碼通過', async () => {
    expect(await verifyPassword('test-password-123')).toBe(true);
    expect(await verifyPassword('wrong')).toBe(false);
    expect(await verifyPassword('')).toBe(false);
    expect(await verifyPassword('test-password-1234')).toBe(false);
  });
});
