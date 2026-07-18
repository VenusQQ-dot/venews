// SM-2 變體間隔重複演算法(類 Anki)。
// 由 review.js 與 popup.js 以 <script> 共用(非 module)。

const SRS = (() => {
  const DAY_MS = 24 * 60 * 60 * 1000;
  const MIN_EASE = 1.3;

  function newState() {
    return {
      reps: 0,        // 連續答對次數
      lapses: 0,      // 忘記次數
      ease: 2.5,      // 難易度係數
      interval: 0,    // 目前間隔(天;0 = 學習中,本次複習內重複)
      due: null,      // ISO 時間;null = 新卡,立即到期
    };
  }

  function isDue(entry, now = Date.now()) {
    const srs = entry.srs;
    if (!srs || !srs.due) return true; // 新卡
    return new Date(srs.due).getTime() <= now;
  }

  function dueCount(entries, now = Date.now()) {
    return entries.filter((e) => isDue(e, now)).length;
  }

  // rating: "again" | "hard" | "good" | "easy"
  // 回傳新的 srs 狀態(不修改原物件)
  function rate(srs, rating, now = Date.now()) {
    const s = { ...(srs || newState()) };

    if (rating === "again") {
      s.lapses += s.reps > 0 ? 1 : 0;
      s.reps = 0;
      s.ease = Math.max(MIN_EASE, s.ease - 0.2);
      s.interval = 0; // 本次複習內重出
      s.due = new Date(now).toISOString();
      return s;
    }

    if (s.reps === 0) {
      // 學習中 → 畢業
      s.interval = rating === "easy" ? 4 : rating === "hard" ? 1 : 1;
    } else if (rating === "hard") {
      s.ease = Math.max(MIN_EASE, s.ease - 0.15);
      s.interval = Math.max(1, Math.round(s.interval * 1.2));
    } else if (rating === "good") {
      s.interval = Math.max(1, Math.round(s.interval * s.ease));
    } else {
      // easy
      s.ease += 0.15;
      s.interval = Math.max(1, Math.round(s.interval * s.ease * 1.3));
    }
    s.reps += 1;
    s.due = new Date(now + s.interval * DAY_MS).toISOString();
    return s;
  }

  // 各評分對應的下次間隔預覽文字(顯示在按鈕上)
  function previewIntervals(srs, now = Date.now()) {
    const fmt = (s) =>
      s.interval === 0 ? "<10 分鐘" : s.interval === 1 ? "1 天" : `${s.interval} 天`;
    return {
      again: fmt(rate(srs, "again", now)),
      hard: fmt(rate(srs, "hard", now)),
      good: fmt(rate(srs, "good", now)),
      easy: fmt(rate(srs, "easy", now)),
    };
  }

  return { newState, isDue, dueCount, rate, previewIntervals };
})();
