/**
 * Daily AI Digest
 *
 * 抓取多個 AI 新聞/研究 RSS 來源，整理過去 24 小時的新內容，
 * 透過 Claude API 彙整成繁體中文摘要，再以 Gmail SMTP 寄出。
 *
 * 必要環境變數：
 *   GMAIL_USER          寄件 Gmail 帳號
 *   GMAIL_APP_PASSWORD  Gmail 應用程式密碼（非登入密碼）
 * 選用環境變數：
 *   ANTHROPIC_API_KEY   有設定時會用 Claude 產生中文摘要；未設定則寄出純條列清單
 *   DIGEST_TO           收件人（預設與 GMAIL_USER 相同）
 */

import Parser from "rss-parser";
import nodemailer from "nodemailer";

const FEEDS = [
  { name: "OpenAI News", url: "https://openai.com/news/rss.xml" },
  { name: "Google AI Blog", url: "https://blog.google/technology/ai/rss/" },
  { name: "Hugging Face Blog", url: "https://huggingface.co/blog/feed.xml" },
  { name: "TechCrunch AI", url: "https://techcrunch.com/category/artificial-intelligence/feed/" },
  { name: "VentureBeat AI", url: "https://venturebeat.com/category/ai/feed/" },
  { name: "The Verge AI", url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml" },
  { name: "MIT Technology Review AI", url: "https://www.technologyreview.com/topic/artificial-intelligence/feed" },
  { name: "arXiv cs.AI", url: "https://export.arxiv.org/rss/cs.AI", maxItems: 8 },
];

const WINDOW_HOURS = 26; // 略大於 24 小時，避免排程時間漂移漏掉新聞
const MAX_TOTAL_ITEMS = 45;

function taipeiDateString(date = new Date()) {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

async function fetchAllFeeds() {
  // 部分新聞網站會擋掉非瀏覽器的 User-Agent
  const parser = new Parser({
    timeout: 20000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      Accept: "application/rss+xml, application/xml, text/xml, */*",
    },
  });
  const cutoff = Date.now() - WINDOW_HOURS * 3600 * 1000;
  const items = [];

  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const parsed = await parser.parseURL(feed.url);
      const fresh = (parsed.items || [])
        .filter((it) => {
          const t = it.isoDate ? Date.parse(it.isoDate) : it.pubDate ? Date.parse(it.pubDate) : NaN;
          return Number.isFinite(t) && t >= cutoff;
        })
        .slice(0, feed.maxItems ?? 10)
        .map((it) => ({
          source: feed.name,
          title: (it.title || "").trim(),
          link: it.link || "",
          date: it.isoDate || it.pubDate || "",
          snippet: (it.contentSnippet || "").replace(/\s+/g, " ").slice(0, 300),
        }));
      return fresh;
    })
  );

  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      console.log(`  ${FEEDS[i].name}: ${r.value.length} 則`);
      items.push(...r.value);
    } else {
      console.warn(`[warn] 抓取失敗：${FEEDS[i].name} — ${r.reason?.message ?? r.reason}`);
    }
  });

  // 依時間新到舊排序並限制總量，避免 prompt 過長
  items.sort((a, b) => Date.parse(b.date || 0) - Date.parse(a.date || 0));
  return items.slice(0, MAX_TOTAL_ITEMS);
}

async function summarizeWithClaude(items) {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic();

  const newsBlock = items
    .map((it, i) => `${i + 1}. [${it.source}] ${it.title}\n   連結：${it.link}\n   摘要：${it.snippet}`)
    .join("\n\n");

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system:
      "你是一位 AI 領域的資深編輯，為訂閱者撰寫每日 AI 新知電子報。" +
      "請以繁體中文（台灣用語）撰寫，內容務求準確，只根據提供的素材整理，不要捏造事實或連結。",
    messages: [
      {
        role: "user",
        content:
          `以下是過去 24 小時內各大 AI 媒體與研究來源的新內容，請彙整成一份每日電子報。\n\n` +
          `要求：\n` +
          `1. 只輸出 HTML 片段（不要 <html>/<head>/<body> 標籤，也不要 markdown 程式碼框）。\n` +
          `2. 結構依序為：\n` +
          `   <h2>今日焦點</h2>：2~4 句話總結今天最重要的事。\n` +
          `   <h2>重要新聞</h2>：挑選 5~10 則最有價值的新聞，每則用 <h3> 標題（繁中翻譯）加一段 2~3 句的說明，並附上原文連結 <a href="...">原文</a> 與來源名稱。\n` +
          `   <h2>趨勢觀察</h2>：從整體新聞中歸納 2~3 個值得注意的趨勢或產業動向。\n` +
          `   <h2>新研究與新發現</h2>：若素材中有研究論文或技術突破（如 arXiv、Hugging Face），挑 2~5 則簡述其貢獻；若沒有則省略此節。\n` +
          `3. 重複報導同一事件的多則新聞請合併成一則。\n` +
          `4. 內文使用 <p>、<ul>、<li>、<a>、<strong> 等基本標籤即可。\n\n` +
          `素材：\n\n${newsBlock}`,
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("Claude 拒絕了此請求（stop_reason: refusal）");
  }

  let html = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  // 防止模型仍輸出 ```html 框
  html = html.replace(/^```(?:html)?\s*/i, "").replace(/```\s*$/, "").trim();
  return html;
}

function plainListHtml(items) {
  const bySource = new Map();
  for (const it of items) {
    if (!bySource.has(it.source)) bySource.set(it.source, []);
    bySource.get(it.source).push(it);
  }
  let html = "<p>（未設定 ANTHROPIC_API_KEY，以下為原始新聞清單）</p>";
  for (const [source, list] of bySource) {
    html += `<h2>${source}</h2><ul>`;
    for (const it of list) {
      html += `<li><a href="${it.link}">${it.title}</a></li>`;
    }
    html += "</ul>";
  }
  return html;
}

async function sendEmail({ subject, bodyHtml }) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error("缺少 GMAIL_USER 或 GMAIL_APP_PASSWORD 環境變數");
  }
  const to = process.env.DIGEST_TO || user;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  const html = `
  <div style="max-width:680px;margin:0 auto;font-family:-apple-system,'Microsoft JhengHei','Noto Sans TC',sans-serif;line-height:1.7;color:#1a1a1a;">
    <h1 style="font-size:22px;border-bottom:3px solid #2563eb;padding-bottom:8px;">🤖 AI 每日新知摘要</h1>
    <p style="color:#666;font-size:13px;">${taipeiDateString()}（台北時間）・自動彙整過去 24 小時的 AI 新聞、趨勢與研究</p>
    ${bodyHtml}
    <hr style="border:none;border-top:1px solid #ddd;margin-top:32px;">
    <p style="color:#999;font-size:12px;">本郵件由 venews 倉庫的 GitHub Actions 自動產生並寄送。</p>
  </div>`;

  const info = await transporter.sendMail({
    from: `"AI Daily Digest" <${user}>`,
    to,
    subject,
    html,
  });
  transporter.close();
  console.log(`已寄出至 ${to}（SMTP 回應：${info.response}）`);
}

async function main() {
  console.log("抓取 RSS 來源中…");
  const items = await fetchAllFeeds();
  console.log(`過去 ${WINDOW_HOURS} 小時內共取得 ${items.length} 則新內容`);

  const subject = `🤖 AI 每日新知摘要 — ${taipeiDateString()}`;

  if (items.length === 0) {
    await sendEmail({
      subject,
      bodyHtml: "<p>過去 24 小時內未抓取到新的 AI 新聞（可能來源暫時無法連線）。</p>",
    });
    return;
  }

  let bodyHtml;
  if (process.env.ANTHROPIC_API_KEY) {
    console.log("呼叫 Claude 產生中文摘要…");
    try {
      bodyHtml = await summarizeWithClaude(items);
    } catch (err) {
      console.warn(`[warn] Claude 摘要失敗，改寄原始清單：${err.message}`);
      bodyHtml = plainListHtml(items);
    }
  } else {
    bodyHtml = plainListHtml(items);
  }

  await sendEmail({ subject, bodyHtml });
}

// 寄信完成後明確結束程序：nodemailer/keep-alive 的連線可能讓 event loop
// 不會自行清空，導致 job 掛到 timeout-minutes 被標記為 cancelled。
main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
