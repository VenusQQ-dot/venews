# VeNews 鳴新聞

Next.js 新聞網站,分三階段開發:

- ✅ **Phase 1** — 靜態新聞首頁(報紙風設計、分類篩選、深色模式)
- ✅ **Phase 2** — Supabase 資料庫 + `/admin` 後台發布文章
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
