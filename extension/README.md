# Wortschatz — 德文學習瀏覽器外掛

在任何網頁選取德文文字,立即取得 AI 根據上下文生成的繁體中文解釋
(原形、IPA 音標、詞性、性別冠詞、複數、動詞變化、文法說明、例句),
附 🔊 朗讀按鈕(瀏覽器內建 TTS,不另計費),並可一鍵存入個人單字表。

支援 Chrome / Edge(Manifest V3)。

## 安裝(載入未封裝項目)

1. 打開 `chrome://extensions`(Edge:`edge://extensions`)。
2. 開啟右上角「開發人員模式」。
3. 點「載入未封裝項目」,選擇這個 `extension/` 資料夾。

## 設定

1. 在外掛圖示上按右鍵 →「選項」(或第一次使用時點解釋卡片上的「開啟設定」)。
2. 填入你的 Claude API key(可至 [platform.claude.com](https://platform.claude.com/) 取得)。
   金鑰只儲存在本機瀏覽器(`chrome.storage.local`),只會用來直接呼叫 Anthropic API。
3. 選擇模型:預設 Claude Opus 4.8(品質最佳);也可改用 Sonnet 4.6 或 Haiku 4.5 以降低費用。

## 使用方式

1. 在網頁上選取一段德文(單字、片語或句子,最長 300 字元)。
2. 點選取處下方出現的「✨ 解釋德文」按鈕。
3. 卡片會顯示 AI 解釋;點 🔊 可朗讀單字或例句(使用系統的德語語音),點「⭐ 存入單字表」即可儲存。
4. 點工具列的外掛圖示打開單字表:可搜尋、刪除、匯出 CSV(UTF-8 含 BOM,Excel 可直接開啟)。
5. 點單字表的「📚 複習」開啟間隔重複複習(類 Anki):
   - 正面顯示德文單字(自動朗讀);按空白鍵或「顯示答案」翻面。
   - 依記憶程度按「再一次 / 困難 / 良好 / 簡單」(鍵盤 1–4),
     採 SM-2 演算法排程,下次到期時間顯示在按鈕上。
   - 「再一次」的卡片會在本次複習內重複出現,直到答對為止。
   - 複習排程只存在本機;新存的單字自動成為新卡。

每次解釋都會呼叫一次 Anthropic API,依所選模型計費;只有在你主動點按鈕時才會送出請求。

## 檔案結構

```
extension/
├── manifest.json   # MV3 設定
├── background.js   # Service worker:呼叫 Anthropic Messages API(結構化 JSON 輸出)
├── content.js      # 選取偵測、觸發按鈕、解釋卡片(Shadow DOM)
├── options.html/js # 設定頁:API key、模型
├── popup.html/js   # 單字表:瀏覽 / 搜尋 / 刪除 / 匯出 CSV / 複習入口
├── srs.js          # SM-2 間隔重複演算法(popup 與 review 共用)
├── review.html/js  # 全頁複習介面(類 Anki 四鍵評分)
└── icons/          # 圖示
```

## 隱私

- API key 與單字表只存在本機瀏覽器,不會上傳到任何伺服器。
- 只有在你點「解釋德文」時,選取文字與其周圍段落才會傳送給 Anthropic API。
