# VeNews 鳴新聞

Next.js 新聞網站,分三階段開發:

- ✅ **Phase 1** — 靜態新聞首頁(報紙風設計、分類篩選、深色模式)
- ✅ **Phase 2** — Supabase 資料庫 + `/admin` 後台發布文章
- ✅ **自動 AI 新聞編輯部** — Claude 每日搜尋、改寫、查證 AI 新聞,存為草稿等你確認
- ⬜ **Phase 3** — Redis 語意搜尋(用自然語言找新聞)

## 本機開發

```bash
npm install
npm run dev
```

開 http://localhost:3000 。未設定 Supabase 時,首頁自動顯示內建示意新聞。

## 接上 Supabase(啟用後台)

1. 到 [supabase.com](https://supabase.com) 建立專案(免費方案即可)
2. 進專案的 **SQL Editor**,把 [`supabase/schema.sql`](supabase/schema.sql) 整份貼上執行
   (會建立 `articles` 資料表、RLS 政策,並塞入示意新聞)
3. 設定環境變數(本機放 `.env.local`,Vercel 放 Project → Settings → Environment Variables):

   | 變數 | 哪裡找 |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 同上 → anon public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | 同上 → service_role key(**保密,僅伺服器端**) |
   | `ADMIN_PASSWORD` | 自己取一組強密碼,後台登入用 |

4. 重新部署(或重啟 dev server),開 `/admin` 用密碼登入即可發布、編輯、下架、刪除文章

發布後首頁最慢一分鐘內更新(ISR revalidate 60 秒)。

## 自動 AI 新聞編輯部(選用)

讓系統每天自動產出新聞草稿:Claude 用網路搜尋找出當日 AI 新聞 → fetch 原文改寫成
繁中文章 → 主編 agent 查證是否有來源根據、是否編造、品質是否達標 → 只有通過的稿件
才以「草稿」存入,等你到 `/admin` 確認後再發布。

啟用步驟:

1. 到 [console.anthropic.com](https://console.anthropic.com) 申請 Claude API 金鑰
2. 加兩個環境變數:
   - `ANTHROPIC_API_KEY` — 你的 Claude API 金鑰(會產生 API 費用,一次約幾則新聞)
   - `CRON_SECRET` — 自己取一組隨機字串,保護排程端點(Vercel Cron 會自動帶上)
3. 到 `/admin` 會出現「🤖 自動抓一次 AI 新聞」按鈕,先手動跑一次看看品質
4. 滿意後就不用管了——`vercel.json` 已設定每天 00:00 UTC 自動觸發 `/api/ingest`

流水線程式:`lib/newsroom.ts`(偵察/撰稿/主編三個 agent)、`lib/ingest.ts`(寫入草稿)、
`app/api/ingest/route.ts`(排程端點)。所有產出**預設為草稿**,發布與否永遠由你決定。

## 從外部 Claude Routines 發佈文章(選用)

你的 Claude Routines 或其他外部系統可以直接 POST 文章到 `/api/publish` 端點,無須經過後台:

1. 加環境變數 `PUBLISH_TOKEN` — 自己取一組隨機字串,保護發佈端點
   ```bash
   openssl rand -base64 24  # 產生安全隨機字串
   ```

2. 從你的 Routine(或任何伺服器端程式)POST JSON 文章:
   ```bash
   curl -X POST https://venews.example.com/api/publish \
     -H "Authorization: Bearer YOUR_PUBLISH_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "文章標題",
       "summary": "摘要(選用)",
       "content": "文章內容(選用)",
       "category": "tech",
       "author": "作者名",
       "read_mins": 5,
       "status": "published"
     }'
   ```

3. 響應格式:
   ```json
   { "ok": true, "slug": "routine-1234567890", "status": "published" }
   ```

**欄位說明**:
- `title` ✅ 必填
- `category` — 有效值:`headline`、`world`、`tech`、`finance`、`culture`、`sports`(預設`headline`)
- `status` — `draft` 或 `published`(預設`published`,設 `draft` 時不發布)
- `slug` — 文章唯一識別碼(自動產生或自訂)
- 其他欄位皆選用,留空時使用預設值

## 部署到 Vercel

[vercel.com](https://vercel.com) → Import 此 repo → 加入上面四個環境變數 → Deploy。

## 專案結構

```
app/
  page.tsx              首頁(頭條 + 新聞卡片)
  components/           Header、NewsFeed、ThemeToggle
  data/news.ts          分類定義 + 靜態示意新聞(資料庫未設定時的後備)
  admin/                後台:列表、新增、編輯、登入
lib/
  supabase.ts           Supabase 客戶端(anon 讀 / service role 寫)
  articles.ts           首頁資料來源(DB 優先,失敗退回靜態)
  adminAuth.ts          後台密碼登入(HMAC cookie)
middleware.ts           /admin 路由保護
supabase/schema.sql     資料表 + RLS + 種子資料
```
