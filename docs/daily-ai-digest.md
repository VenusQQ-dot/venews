# 每日 AI 新知摘要（Daily AI Digest）

每天早上 **07:30（台北時間，UTC+8）**，GitHub Actions 會自動執行 `scripts/daily-ai-digest.mjs`：

1. 抓取多個 AI 新聞與研究 RSS 來源（OpenAI、Google AI、Hugging Face、TechCrunch、VentureBeat、The Verge、MIT Technology Review、arXiv cs.AI）。
2. 篩選出過去 24 小時內的新內容。
3. 透過 Claude API（`claude-opus-4-8`）彙整成繁體中文電子報：今日焦點、重要新聞、趨勢觀察、新研究與新發現。
4. 以 Gmail SMTP 寄到你的信箱。

## 啟用前必須完成的設定

### 1. 建立 Gmail 應用程式密碼

1. 前往 [Google 帳戶 → 安全性](https://myaccount.google.com/security)，確認已啟用「兩步驟驗證」。
2. 前往 [應用程式密碼](https://myaccount.google.com/apppasswords)，建立一組新的應用程式密碼（16 碼）。
3. 記下這組密碼，下一步會用到。

### 2. 在 GitHub repo 設定 Secrets

到 **repo → Settings → Secrets and variables → Actions → New repository secret**，新增：

| 名稱 | 必要 | 說明 |
|---|---|---|
| `GMAIL_USER` | ✅ | 寄件用的 Gmail 帳號（例如 `your-account@gmail.com`） |
| `GMAIL_APP_PASSWORD` | ✅ | 上一步建立的 16 碼應用程式密碼 |
| `ANTHROPIC_API_KEY` | 建議 | Claude API 金鑰（[platform.claude.com](https://platform.claude.com) 取得）。未設定時仍會寄信，但只有原始新聞清單、沒有中文摘要 |

選用（**Variables** 分頁，非 Secrets）：

| 名稱 | 說明 |
|---|---|
| `DIGEST_TO` | 收件人信箱，未設定時寄給 `GMAIL_USER` 自己 |

### 3. 合併到 main 分支

GitHub Actions 的 `schedule` 排程**只會在預設分支（main）上生效**，所以這個工作流程必須合併進 main 才會每天自動執行。

## 手動測試

合併到 main 並設定好 Secrets 後，可先手動跑一次確認：

**repo → Actions → Daily AI Digest → Run workflow**

## 調整

- **寄送時間**：修改 `.github/workflows/daily-ai-digest.yml` 中的 cron。目前為 `30 23 * * *`（UTC），即台北 07:30。例如想改成台北 08:00 → `0 0 * * *`。
- **新聞來源**：修改 `scripts/daily-ai-digest.mjs` 開頭的 `FEEDS` 陣列。
- **摘要風格／篇幅**：修改同檔案中 `summarizeWithClaude()` 的 prompt。
