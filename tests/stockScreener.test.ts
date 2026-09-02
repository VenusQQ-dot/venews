import { describe, expect, it } from 'vitest';
import { screenStocks, DEFAULT_CONFIG, type Snap } from '../lib/stockScreener';

/** 建立一檔股票的歷史快照。overrides 可覆蓋「今日(最後一筆)」的欄位。 */
function makeHistory(
  code: string,
  opts: {
    days?: number;
    close?: number;
    high?: number;
    low?: number;
    volume?: number;
    instiNet?: number;
    revYoy?: number | null;
  } = {},
  todayOverride: Partial<Snap> = {},
): Snap[] {
  const days = opts.days ?? DEFAULT_CONFIG.lookback;
  const snaps: Snap[] = [];
  for (let i = 0; i < days; i++) {
    snaps.push({
      trade_date: `2026-08-${String(i + 1).padStart(2, '0')}`,
      code,
      name: `股${code}`,
      close: opts.close ?? 100,
      high: opts.high ?? 101,
      low: opts.low ?? 99,
      change: 0,
      volume: opts.volume ?? 10000,
      foreign_net: 0,
      trust_net: 0,
      dealer_net: 0,
      insti_net: opts.instiNet ?? 2000, // 佔量 20%
      rev_yoy: opts.revYoy === undefined ? 15 : opts.revYoy,
      rev_mom: null,
    });
  }
  Object.assign(snaps[snaps.length - 1], todayOverride);
  return snaps;
}

describe('screenStocks', () => {
  it('歷史不足 lookback 天:標記 insufficientHistory 且無候選', () => {
    const history = new Map([['1111', makeHistory('1111', { days: 5 })]]);
    const r = screenStocks(history);
    expect(r.insufficientHistory).toBe(true);
    expect(r.candidates).toHaveLength(0);
    expect(r.scanned).toBe(0);
  });

  it('符合全部條件的股票會成為候選', () => {
    const history = new Map([['2330', makeHistory('2330')]]);
    const r = screenStocks(history);
    expect(r.insufficientHistory).toBe(false);
    expect(r.scanned).toBe(1);
    expect(r.matched).toBe(1);
    expect(r.candidates).toHaveLength(1);
    const c = r.candidates[0];
    expect(c.code).toBe('2330');
    expect(c.concentrationPct).toBeCloseTo(20, 1);
    expect(c.instiStreak).toBe(DEFAULT_CONFIG.lookback);
    expect(c.rangePct).toBeLessThan(DEFAULT_CONFIG.maxRangePct);
    expect(c.flags.some(f => f.includes('連續買超'))).toBe(true);
  });

  it('當日已噴出(漲幅超過上限)會被排除', () => {
    // prevClose=100,change=8 → +8% > 5%
    const history = new Map([
      ['3234', makeHistory('3234', {}, { close: 108, change: 8 })],
    ]);
    const r = screenStocks(history);
    expect(r.matched).toBe(0);
    expect(r.candidates).toHaveLength(0);
  });

  it('高低價差過大(非低基期)會被排除', () => {
    const snaps = makeHistory('4444');
    snaps[3].low = 40; // 製造大波動 → range 遠超 20%
    const r = screenStocks(new Map([['4444', snaps]]));
    expect(r.matched).toBe(0);
  });

  it('法人買超佔量不足會被排除', () => {
    const history = new Map([
      ['5555', makeHistory('5555', { instiNet: 500 })], // 佔量 5% < 15%
    ]);
    const r = screenStocks(history);
    expect(r.matched).toBe(0);
  });

  it('營收年增率低於門檻會被排除', () => {
    const history = new Map([['6666', makeHistory('6666', { revYoy: 3 })]]);
    expect(screenStocks(history).matched).toBe(0);
  });

  it('月營收未更新(null)仍可入選,並標註僅籌碼訊號', () => {
    const history = new Map([['7777', makeHistory('7777', { revYoy: null })]]);
    const r = screenStocks(history);
    expect(r.matched).toBe(1);
    expect(r.candidates[0].revYoy).toBeNull();
    expect(r.candidates[0].flags.some(f => f.includes('僅籌碼訊號'))).toBe(true);
  });

  it('依綜合分數排序:集中度較高者在前', () => {
    const history = new Map([
      ['1001', makeHistory('1001', { instiNet: 2000 })], // 20%
      ['1002', makeHistory('1002', { instiNet: 4000 })], // 40%
    ]);
    const r = screenStocks(history);
    expect(r.candidates[0].code).toBe('1002');
    expect(r.candidates[1].code).toBe('1001');
  });

  it('連續買超天數在中途轉賣時正確中斷', () => {
    const snaps = makeHistory('8888');
    snaps[snaps.length - 3].insti_net = -500; // 倒數第 3 天賣超
    const r = screenStocks(new Map([['8888', snaps]]));
    expect(r.candidates[0].instiStreak).toBe(2); // 只剩最後兩天連續
  });

  it('topN 限制回傳數量', () => {
    const history = new Map<string, Snap[]>();
    for (let i = 0; i < 20; i++) history.set(`90${i}`, makeHistory(`90${i}`));
    const r = screenStocks(history, { ...DEFAULT_CONFIG, topN: 5 });
    expect(r.candidates).toHaveLength(5);
    expect(r.matched).toBe(20);
  });
});
