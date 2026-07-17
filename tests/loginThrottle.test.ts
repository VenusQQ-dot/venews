import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearFailures, isLocked, recordFailure } from '../lib/loginThrottle';

describe('loginThrottle', () => {
  const KEY = 'test-ip';

  beforeEach(() => {
    clearFailures(KEY);
    vi.useRealTimers();
  });

  it('未失敗時不鎖定', () => {
    expect(isLocked(KEY)).toBe(false);
  });

  it('連錯 5 次後鎖定', () => {
    for (let i = 0; i < 4; i++) recordFailure(KEY);
    expect(isLocked(KEY)).toBe(false);
    recordFailure(KEY);
    expect(isLocked(KEY)).toBe(true);
  });

  it('鎖定期過後自動解鎖', () => {
    vi.useFakeTimers();
    for (let i = 0; i < 5; i++) recordFailure(KEY);
    expect(isLocked(KEY)).toBe(true);
    vi.advanceTimersByTime(5 * 60 * 1000 + 1);
    expect(isLocked(KEY)).toBe(false);
  });

  it('clearFailures 重置計數', () => {
    for (let i = 0; i < 4; i++) recordFailure(KEY);
    clearFailures(KEY);
    recordFailure(KEY);
    expect(isLocked(KEY)).toBe(false);
  });

  it('不同 key 互不影響', () => {
    for (let i = 0; i < 5; i++) recordFailure(KEY);
    expect(isLocked(KEY)).toBe(true);
    expect(isLocked('other-ip')).toBe(false);
    clearFailures(KEY);
  });
});
