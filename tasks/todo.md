# 台股盤後籌碼情報 Agent — 已完成

## 交付物
- [x] supabase/stock_schema.sql — stock_snapshots + stock_briefs
- [x] lib/twse.ts — 官方 API 資料層(欄位容錯 + 診斷)
- [x] lib/stockScreener.ts — 純函式選股演算法
- [x] lib/stockroom.ts — Claude 分析師 + 主編 pipeline
- [x] lib/stockIngest.ts — ETL + 選股 + 寫入 Supabase
- [x] app/api/stock-brief/route.ts — Cron 端點(CRON_SECRET 保護)
- [x] scripts/twse-probe.mjs — 欄位診斷工具
- [x] vercel.json — 每交易日 20:00 台北 cron
- [x] tests/stockScreener.test.ts — 10 個演算法單元測試
- [x] .env.example / README — 啟用說明

## 驗證
- [x] npm run test 通過(31 tests)
- [x] npx tsc --noEmit 乾淨
- [x] npm run lint 乾淨(僅既有 layout warning)
- [x] npm run build 通過,/api/stock-brief 已註冊

## 沙箱限制(不影響部署)
- 本沙箱 egress 政策封鎖 openapi.twse.com.tw(403),無法實測即時資料。
- 部署到 Vercel / 本機可連;首次上線請跑 scripts/twse-probe.mjs 核對欄位 key。
