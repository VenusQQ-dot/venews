/**
 * 把每日 AI 摘要的新聞素材轉成 Lemo-Opuscar(github.com/lemomo-ai/lemo-opuscar)製片 prompt。
 * 只產生文字,貼進已安裝 lemo-opuscar plugin 的 Claude Code 即可開拍。
 */

const MAX_FILM_ITEMS = 5;

const escapeHtml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** items 依時間新到舊排序;每個來源只取最新一則,避免同一媒體洗版 */
export function pickFilmItems(items, max = MAX_FILM_ITEMS) {
  const seen = new Set();
  const picked = [];
  for (const it of items) {
    if (!it.title || seen.has(it.source)) continue;
    seen.add(it.source);
    picked.push(it);
    if (picked.length >= max) break;
  }
  return picked;
}

export function buildDigestFilmPrompt(items, dateLabel, seconds = 60) {
  const picked = pickFilmItems(items);
  if (picked.length === 0) return "";
  const lines = picked.map(
    (it, i) => `${i + 1}. [${it.source}] ${it.title}\n   ${it.snippet || ""}\n   來源:${it.link}`.trimEnd()
  );
  return [
    `Make a ${seconds}-second film in the **Broadcast News Package** style (\`news-package\`).`,
    "",
    `主題:AI 每日新知 — ${dateLabel}`,
    "",
    "今日新聞素材:",
    ...lines,
    "",
    "要求:",
    "- 旁白:沉穩的繁體中文女聲,字幕使用繁體中文(台灣用語)。",
    "- 每則新聞一段,只使用上面素材中的事實;沒有來源的數字不要出現在畫面上。",
    "- 片尾列出所有來源媒體名稱。",
    "- 先給我看分鏡(storyboard),確認後再算繪成片。",
  ].join("\n");
}

/** 信件用的 HTML 區塊;沒有素材時回傳空字串 */
export function digestFilmHtml(items, dateLabel) {
  const prompt = buildDigestFilmPrompt(items, dateLabel);
  if (!prompt) return "";
  return `
    <h2>🎬 今日短片 prompt</h2>
    <p style="color:#666;font-size:13px;">複製下方文字,貼進已安裝 <a href="https://github.com/lemomo-ai/lemo-opuscar">Lemo-Opuscar</a> 的 Claude Code,即可產生 60 秒新聞短片。</p>
    <pre style="white-space:pre-wrap;background:#f5f5f5;padding:12px;border-radius:6px;font-size:13px;">${escapeHtml(prompt)}</pre>`;
}
