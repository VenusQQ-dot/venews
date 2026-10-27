# 在 VeNews 文章裡放 Altair 互動圖表

## 一句話說明

[Vega-Altair](https://altair-viz.github.io/) 是 Python 的圖表套件,它把圖表存成 **Vega-Lite JSON**。
VeNews 直接渲染 Vega-Lite,所以你在 Python 用 Altair 畫的圖貼進文章就會變成**可互動的圖表**:
滑鼠移上去看數值、可框選,也能下載 PNG/SVG。不用截圖。

## 功能一覽

| 功能 | 位置 | 說明 |
|---|---|---|
| 文章內嵌圖表 | `/news/[slug]`、教學頁 | 內容中的 ```` ```altair ```` / ```` ```vega-lite ```` 區塊會渲染成圖表 |
| 數據看板 | `/data` | 已發布新聞的時間 × 分類連動圖表(框選時間 → 分類統計跟著變) |
| Python 範例 | `scripts/altair_to_venews.py` | Altair 圖表 → 文章內容,可一鍵送到 `/api/publish` 存草稿 |
| 主題 | 自動 | 跟著網站紙墨配色與深淺色模式切換 |

## 快速上手(3 分鐘)

### 方法 A:手動貼進後台

1. 在 Python / Jupyter 畫好圖:
   ```python
   import altair as alt, pandas as pd
   df = pd.DataFrame({"月份": ["1月", "2月", "3月"], "營收": [182, 165, 201]})
   chart = alt.Chart(df).mark_bar().encode(x="月份:O", y="營收:Q", tooltip=["月份", "營收"])
   print(chart.to_json())
   ```
2. 複製印出的 JSON。
3. 到 `/admin` 編輯文章,在「內容」欄這樣貼:
   ````
   ## 營收走勢

   ```altair
   (貼上剛剛的 JSON)
   ```
   ````
4. 發布後到 `/news/文章slug` 查看,應該看到可互動的長條圖。

### 方法 B:用腳本直接送草稿

```bash
pip install altair pandas
python scripts/altair_to_venews.py                 # 只印出內容,先檢查
VENEWS_URL=https://你的網域 PUBLISH_TOKEN=xxxx \
  python scripts/altair_to_venews.py --send        # 送到 /api/publish,存成草稿
```

把 `build_chart()` 換成你自己的 DataFrame 和圖表就行。腳本固定存成**草稿**,要到 `/admin` 確認後才會發布。

## 限制與安全規則(為什麼會顯示「圖表規格有誤」)

| 規則 | 原因 | 解法 |
|---|---|---|
| 單一圖表 ≤ 200 KB | 避免文章塞入大量原始資料拖慢頁面 | 先在 pandas `groupby` 彙總再畫圖 |
| 不可用外部資料網址(`data.url` 為 `https://...`) | 防止追蹤讀者、載入不受控資料;CSP 也會擋 | 用 DataFrame,Altair 會轉成 inline values |
| 只接受 Vega-Lite(不接受完整 Vega 規格) | 縮小可執行範圍 | 使用 Altair / Vega-Lite 即可 |
| 運算式用 AST 直譯器執行 | 網站 CSP 不開 `unsafe-eval`,文章內容無法執行任意 JS | 一般 Altair 的 `transform_calculate`、`selection` 都可用 |

規格有錯時,文章會顯示錯誤原因和原始 JSON,不會整頁壞掉或內容消失。

## 驗證方式

1. `npm test` — 包含規格驗證、Markdown 拆分、看板規格的單元測試。
2. `npm run dev` 後開:
   - `/news/central-bank-rate-hold` — 內建示意文章,應看到 CPI 折線圖。
   - `/data` — 在上圖拖曳框選,下圖長條應跟著改變;點圖例會高亮該分類。
3. 切換深色模式,圖表文字與格線顏色應跟著改變。

## 常見錯誤

| 現象 | 原因 | 排除 |
|---|---|---|
| 顯示 JSON 原文,沒有圖 | 區塊語言標記不是 `altair` / `vega-lite` / `vegalite` | 檢查 ```` ``` ```` 後面的字 |
| 「JSON 格式錯誤」 | 複製時漏了括號或混入中文引號 | 重新 `print(chart.to_json())` 複製 |
| 「不允許載入外部網址資料」 | 用了 `alt.Chart("https://...csv")` | 先 `pd.read_csv` 再傳 DataFrame |
| 「超過 200 KB 上限」 | 原始明細太多 | 彙總後再畫,或用 `df.sample()` |
| 圖表區空白 | 瀏覽器擋了 JS 或網路錯誤 | 開 DevTools Console 看「圖表渲染失敗」訊息 |

## 相關檔案

- `lib/vegaSpec.ts` — 規格驗證(大小、外部網址、$schema)
- `lib/markdown.ts` — Markdown 轉 HTML,拆出圖表區塊
- `app/components/VegaChart.tsx` — 瀏覽器端渲染(動態載入 vega-embed,只有含圖表的頁面才下載)
- `app/components/RichContent.tsx` — 依序渲染文字與圖表
- `lib/dashboardSpec.ts` — `/data` 看板的圖表規格(附 Altair 對照寫法)
