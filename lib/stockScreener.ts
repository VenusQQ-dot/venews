/**
 * 「主力暗中吃貨」籌碼選股演算法(純函式,無 IO,可單元測試)。
 *
 * 對應大戶思路:找「低基期橫盤 + 三大法人默默大買 + 營收有底氣 + 尚未噴出」的股票——
 * 也就是還沒有利多新聞、但籌碼異常集中的潛在轉骨股。
 *
 * 訊號需要歷史,故靠 stock_snapshots 逐日累積;歷史不足 lookback 天時該檔略過。
 */

/** 從 Supabase stock_snapshots 讀出的單日快照(欄位對齊 stock_schema.sql)。 */
export type Snap = {
  trade_date: string;
  code: string;
  name: string;
  close: number | null;
  high: number | null;
  low: number | null;
  change: number | null;
  volume: number;
  foreign_net: number;
  trust_net: number;
  dealer_net: number;
  insti_net: number;
  rev_yoy: number | null;
  rev_mom: number | null;
};

export type ScreenConfig = {
  lookback: number; // 計算低基期的天數(近 N 日高低)
  maxRangePct: number; // 近 N 日高低價差上限(%),越小越「橫盤」
  instiWindow: number; // 籌碼集中度的計算天數
  minInstiRatioPct: number; // 近 M 日法人買超佔成交量比率下限(%)
  minRevYoy: number; // 月營收年增率下限(%);null 視為未知(不加分也不淘汰)
  maxTodayChangePct: number; // 當日漲幅上限(%),避開已噴出的追高
  topN: number; // 最多回傳幾檔
};

export const DEFAULT_CONFIG: ScreenConfig = {
  lookback: 20,
  maxRangePct: 20,
  instiWindow: 5,
  minInstiRatioPct: 15,
  minRevYoy: 10,
  maxTodayChangePct: 5,
  topN: 15,
};

export type Candidate = {
  code: string;
  name: string;
  close: number | null;
  changePct: number | null; // 當日漲跌幅(%)
  rangePct: number; // 近 lookback 日高低價差(%)
  instiNet5d: number; // 近 instiWindow 日三大法人合計買超(張)
  concentrationPct: number; // 買超佔成交量比率(%)
  instiStreak: number; // 由今日往回連續買超天數
  revYoy: number | null; // 月營收年增率(%)
  score: number; // 綜合分數(越高越值得關注)
  flags: string[]; // 命中訊號說明(給人看的白話)
};

export type ScreenResult = {
  candidates: Candidate[];
  scanned: number; // 有足夠歷史被實際評估的檔數
  matched: number; // 通過全部硬性條件的檔數
  insufficientHistory: boolean; // 全市場歷史都不足時為 true
};

const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

/**
 * 對整個市場評分。history:code → 該檔快照(依日期升冪,最後一筆為今日)。
 */
export function screenStocks(
  history: Map<string, Snap[]>,
  config: ScreenConfig = DEFAULT_CONFIG,
): ScreenResult {
  const { lookback, maxRangePct, instiWindow, minInstiRatioPct, minRevYoy, maxTodayChangePct, topN } =
    config;

  const candidates: Candidate[] = [];
  let scanned = 0;
  let matched = 0;
  let anyWithEnoughHistory = false;

  for (const snaps of history.values()) {
    if (snaps.length < lookback) continue; // 歷史不足,略過
    anyWithEnoughHistory = true;
    scanned++;

    const today = snaps[snaps.length - 1];
    if (today.close == null) continue;

    const windowN = snaps.slice(-lookback);
    const highs = windowN.map(s => s.high).filter((x): x is number => x != null);
    const lows = windowN.map(s => s.low).filter((x): x is number => x != null);
    if (highs.length === 0 || lows.length === 0) continue;

    const maxHigh = Math.max(...highs);
    const minLow = Math.min(...lows);
    if (minLow <= 0) continue;
    const rangePct = ((maxHigh - minLow) / minLow) * 100;

    // 籌碼集中度:近 instiWindow 日法人買超佔累計成交量比率
    const instiW = snaps.slice(-instiWindow);
    const instiSumShares = sum(instiW.map(s => s.insti_net));
    const volSum = sum(instiW.map(s => s.volume));
    const concentrationPct = volSum > 0 ? (instiSumShares / volSum) * 100 : 0;

    // 連續買超天數(由今日往回)
    let instiStreak = 0;
    for (let i = snaps.length - 1; i >= 0; i--) {
      if (snaps[i].insti_net > 0) instiStreak++;
      else break;
    }

    // 當日漲跌幅(用 漲跌價差 還原前一日收盤)
    let changePct: number | null = null;
    if (today.change != null) {
      const prevClose = today.close - today.change;
      if (prevClose > 0) changePct = (today.change / prevClose) * 100;
    }

    // 硬性條件
    const lowBase = rangePct < maxRangePct;
    const instiConc = instiSumShares > 0 && concentrationPct >= minInstiRatioPct;
    const notOverheated = changePct == null || changePct <= maxTodayChangePct;
    const revUnknown = today.rev_yoy == null;
    const revOk = revUnknown || today.rev_yoy! >= minRevYoy;

    if (!(lowBase && instiConc && notOverheated && revOk)) continue;
    matched++;

    const flags: string[] = [];
    flags.push(`低基期橫盤(近${lookback}日高低差 ${round(rangePct, 1)}%)`);
    flags.push(`法人買超佔量 ${round(concentrationPct, 1)}%`);
    if (instiStreak >= 3) flags.push(`連續買超 ${instiStreak} 天`);
    if (revUnknown) flags.push('月營收未更新(僅籌碼訊號)');
    else flags.push(`月營收年增 ${round(today.rev_yoy!, 1)}%`);
    if (changePct != null) flags.push(`當日 ${changePct >= 0 ? '+' : ''}${round(changePct, 2)}%`);

    // 綜合分數:集中度為主,連續買超與營收動能加分,價差越窄越好
    const score =
      concentrationPct * 1.0 +
      Math.min(instiStreak, 10) * 3 +
      (revUnknown ? 0 : Math.max(0, Math.min(today.rev_yoy!, 100)) * 0.3) +
      Math.max(0, maxRangePct - rangePct) * 0.5;

    candidates.push({
      code: today.code,
      name: today.name,
      close: today.close,
      changePct: changePct == null ? null : round(changePct, 2),
      rangePct: round(rangePct, 2),
      instiNet5d: Math.round(instiSumShares / 1000), // 股 → 張
      concentrationPct: round(concentrationPct, 2),
      instiStreak,
      revYoy: today.rev_yoy == null ? null : round(today.rev_yoy, 2),
      score: round(score, 2),
      flags,
    });
  }

  candidates.sort((a, b) => b.score - a.score);

  return {
    candidates: candidates.slice(0, topN),
    scanned,
    matched,
    insufficientHistory: !anyWithEnoughHistory,
  };
}
