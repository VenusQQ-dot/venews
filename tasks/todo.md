# Altair(Vega-Lite)圖表功能

- [x] `lib/vegaSpec.ts` 規格驗證(大小、外部 URL、$schema、需有 mark/layer/concat)
- [x] `lib/markdown.ts` 抽出共用 Markdown 渲染,拆出 ```altair / ```vega-lite 區塊
- [x] `VegaChart` 元件:動態載入、CSP 相容(AST 直譯器)、站內主題、深色模式
- [x] `/news/[slug]` 新聞詳情頁(首頁卡片與頭條連過去)
- [x] `/data` 數據看板:框選時間 × 點選分類連動
- [x] `scripts/altair_to_venews.py` Python → 文章 / 草稿
- [x] 單元測試、tsc、lint、build、Playwright 實測(淺色/深色、框選互動)
- [ ] 後續:後台編輯時即時預覽圖表
- [ ] 後續:AI 新聞編輯部依新聞數據自動產生圖表
