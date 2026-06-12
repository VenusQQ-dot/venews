# 德文學習瀏覽器外掛(Wortschatz)設計文件

日期:2026-06-11
狀態:已由使用者確認

## 目標

一個 Chrome / Edge(Manifest V3)瀏覽器外掛,協助使用者學習德文單字與文法:

1. 在任何網頁選取德文文字後,選取處旁出現一個小按鈕。
2. 點按鈕後,外掛將選取文字與其周圍上下文送給 Claude API,顯示 AI 生成的繁體中文解釋(單字原形、詞性、性別冠詞、複數、動詞變化、在此上下文的意思、文法說明、例句)。
3. 解釋卡片上可一鍵「存入單字表」;單字表存於瀏覽器本機,可於工具列 popup 瀏覽、搜尋、刪除、匯出 CSV。

## 已確認的需求決定

| 決定 | 選擇 |
| --- | --- |
| 學習語言 | 德文 → 繁體中文解釋(單字 + 文法) |
| AI 來源 | 使用者自填 Claude API key,外掛直接呼叫 Anthropic Messages API |
| 單字表儲存 | `chrome.storage.local`(本機,可匯出 CSV) |
| 目標瀏覽器 | Chrome / Edge(Manifest V3) |
| 觸發方式 | 選取後出現小按鈕,點擊才呼叫 API(避免誤觸發浪費費用) |

## 架構

純 JavaScript、無打包工具的 MV3 外掛,位於 repo 的 `extension/` 資料夾,
以 Chrome「載入未封裝項目」直接安裝。與現有 Next.js 網站完全獨立。

```
extension/
├── manifest.json      # MV3 設定
├── background.js      # Service worker:呼叫 Anthropic Messages API
├── content.js         # 選取偵測、觸發按鈕、解釋卡片(Shadow DOM)
├── options.html/js    # 設定頁:API key、模型選擇
├── popup.html/js      # 工具列單字表:瀏覽/搜尋/刪除/匯出 CSV
├── icons/             # 外掛圖示
└── README.md          # 安裝與使用說明(繁中)
```

### 元件職責

1. **Content script(`content.js`)**
   - `mouseup` 偵測文字選取;選取 1–300 字元且含字母才顯示觸發按鈕。
   - 觸發按鈕與解釋卡片都掛在同一個 Shadow DOM host 下,樣式與網頁隔離。
   - 點按鈕 → 擷取選取文字 + 周圍上下文(往上找最近的區塊元素,取其文字約 600 字元)→ `chrome.runtime.sendMessage` 給 background → 卡片顯示 loading → 渲染結果。
   - 卡片含「⭐ 存入單字表」:直接寫入 `chrome.storage.local`。
   - Escape 或點擊卡片外關閉。

2. **Background service worker(`background.js`)**
   - 接收 `{type: "explain", text, context, url, title}` 訊息。
   - 從 `chrome.storage.local` 讀取 API key 與模型,以 `fetch` 呼叫
     `POST https://api.anthropic.com/v1/messages`(raw HTTP:無打包工具的
     瀏覽器外掛無法使用 npm SDK;`host_permissions` 涵蓋 `https://api.anthropic.com/*`)。
   - 使用 `output_config.format`(`json_schema`)取得結構化 JSON:
     `selection_type, lemma, part_of_speech, gender_article, plural, conjugation, meaning, grammar_notes, example_sentence, example_translation`(不適用的欄位回空字串)。
   - 預設模型 `claude-opus-4-8`;設定頁可改選 `claude-sonnet-4-6` / `claude-haiku-4-5`。

3. **設定頁(options)** — API key(僅存本機 `chrome.storage.local`,不離開瀏覽器)、模型選擇。

4. **單字表 popup** — 由新到舊列出已存單字,即時搜尋,單筆刪除,匯出 CSV(含 BOM,Excel 可直接開)。

### 資料格式(chrome.storage.local)

```js
settings: { apiKey: string, model: string }
vocab: [{
  id, word, lemma, partOfSpeech, genderArticle, plural, conjugation,
  meaning, grammarNotes, example, exampleTranslation,
  context, url, title, savedAt
}]
```

## 錯誤處理

- 未設定 API key → 卡片顯示提示與「開啟設定」按鈕。
- HTTP 401 → 「API key 無效」;429 → 「請求過於頻繁」;529/5xx → 「服務忙碌,請稍後再試」。
- 選取超過 300 字元 → 不顯示按鈕(控制費用)。
- 回應 `stop_reason === "refusal"` 或 JSON 解析失敗 → 顯示一般性錯誤訊息。

## 測試

手動測試:`chrome://extensions` 載入未封裝項目 → 在德文新聞網站(如 dw.com)
選取單字/句子驗證解釋卡片、儲存、popup 列表與 CSV 匯出。
無自動化測試(無建置系統,純靜態檔案)。

## 不做的事(YAGNI)

- 不做帳號系統 / 雲端同步(本機儲存已滿足需求)。
- 不做 Firefox 相容層。
- 不做發音/TTS、間隔重複複習 — 可作為日後迭代。
