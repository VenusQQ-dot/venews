# LinkedIn 資訊圖品牌系統（6 步 SOP）

目的：讓 Claude Code 每次產出的資訊圖都「一看就知道是你的」，有你的名字、用你的顏色，而且自己先檢查過才交給你。

```
linkedin-infographic/
├── CLAUDE.md            # 4 條家規：先讀 REFERENCE、不發明、要問不要選、自我檢查
├── REFERENCE.md         # 品牌規範：色票、字體、字級、名字位置、5 個禁忌、正確範例
├── examples/            # 你認可的作品（起始 5 張，每次定稿再加 1 張）
├── drafts/              # 每次產出的 3 個版本 + PNG + 檢查報告
│   └── 2026-11-04-ai-newsroom/   v1/v2/v3 .html .png .check.json
└── tools/check.mjs      # 自動檢查：畫布、字體、最小字級、色票、強調色、識別、emoji、簡體字
```

remove-ai-design-slop skill 已放在 repo 根目錄 `.claude/skills/remove-ai-design-slop/`，在 repo 內開 Claude Code 就會自動載入。

---

## 前置需求

| 項目 | 指令 / 說明 |
|---|---|
| Claude Code | 必須在 **`linkedin-infographic/` 資料夾內** 啟動，否則讀不到這裡的 CLAUDE.md |
| Node.js 18+ | `node -v` |
| Playwright（給 check.mjs 用） | `cd linkedin-infographic && npm init -y && npm i -D playwright && npx playwright install chromium` |

```bash
cd venews/linkedin-infographic
claude
```

---

## 執行順序

| 步驟 | 做什麼 | 頻率 | 本 repo 狀態 |
|---|---|---|---|
| 0 | 空資料夾測試（看沒有品牌時的樣子） | 一次 | 自行在空資料夾跑 |
| 1 | CLAUDE.md 家規 | 一次 | ✅ 已完成 |
| 3 | 5 張範例放進 `examples/` | 一次，之後持續增加 | ⬜ 等你提供 |
| 2 | REFERENCE.md 品牌規範 | 一次 | 🟡 v0 草稿（取自網站 tokens），有 6 題待回答 |
| 4 | 安裝 design skill | 一次 | ✅ remove-ai-design-slop 已安裝 |
| 5 | 要 3 版、留 1 版、打磨 | 每張圖 | ✅ 首批 3 版已完成並通過檢查 |
| 6 | 定稿存回 `examples/` | 每張圖 | ⬜ 等你挑 |

> 順序注意：Step 2 會讀 `examples/`，所以**先放範例（Step 3）再跑 Step 2**。

---

## Step 0 · 空資料夾測試（看「之前」）

```bash
mkdir ~/empty-test && cd ~/empty-test && claude
```

```
Make a LinkedIn infographic that shows what an incredible graphic designer you are.
Go all out. Save it as one HTML file at 1080 x 1350.
```

檢查：上面有你的名字嗎？是你的顏色嗎？沒有 → 這就是本系統要修的問題。

## Step 1 · 家規（已完成）

已建立 `CLAUDE.md`。若要在別的資料夾重建，貼：

```
Add this to CLAUDE.md, and create the file if it does not exist: Before anything,
read REFERENCE.md in full. No inventing, every value comes from it. Ask, do not
choose, if it is not covered there. Check yourself. Fix what fails, then show me.
```

## Step 2 · 品牌規範（v0 → v1）

目前 `REFERENCE.md` 是從 VeNews 網站 `app/globals.css` 取樣的 v0。放好 5 張範例後貼：

```
我在 examples 資料夾放了五張我喜歡的設計。
請以現有 REFERENCE.md 為基礎更新它，讓任何 AI 在製作前都能讀。必須涵蓋：
1. 每個顏色的 hex 與用途（從範例圖實際取樣，不可憑記憶）
2. 字體、字級與元素間距
3. 我的名字與照片放哪裡
4. 品牌絕對不做的五件事
5. 一個完整描述的正確範例
REFERENCE.md 第 7 節的待確認問題，請逐題問我。
存檔前先給我看。
```

驗收：每個顏色都有 hex **和職責**；第 6 節 `brand-tokens` 與表格一致（check.mjs 讀的是 tokens）。

## Step 3 · 放 5 張範例

把 5 張你願意再發一次的作品（PNG/JPG/HTML 皆可）放進 `examples/`，並在 `examples/README.md` 登記。品質不好的圖會教壞它。

## Step 4 · Design skills

- `remove-ai-design-slop`：已放在 `.claude/skills/`。用法：「remove the AI slop from this」或「用 29 個 tells 檢查這張圖」。
- 全域安裝（其他專案也要用時）：
  ```bash
  git clone https://github.com/charlie947/remove-ai-design-slop.git
  cp -r remove-ai-design-slop/skills/* ~/.claude/skills/
  ```
- `infographic-lean` 是原作者付費課程內容，未安裝；Step 5 的 prompt 不依賴它。

## Step 5 · 要 3 版、留 1 版

```
針對【主題】做 3 個版本，只用我的品牌。存到 drafts/YYYY-MM-DD-主題/v1~v3.html，
每張跑 node tools/check.mjs，全部 PASS 再給我看。
```

三版太像時：

```
Build 3 genuinely different layouts of this graphic. Same words in every one. Show them side by side.
```

用自己的話說哪裡不對（例：「不夠高級」），讓它想修法。選定後：

```
打磨我選的這版：標題在手機上要讀得到，不能有小字、不能有大片空白。
修完跑 check.mjs，再用 remove-ai-design-slop 的 29 tells 逐條檢查後給我。
```

需要動畫（9 秒 GIF）時再追加：「再做成 9 秒 GIF」— 環境已有 ffmpeg，可用 Playwright 逐格截圖再合成。

**最後一關一定是你**：逐字核對數字、logo 只用真的、連結逐一點開。

## Step 6 · 定稿存回 examples

```
把【drafts/…/v2】存進 examples 資料夾並登記到 examples/README.md，下一張圖從它開始。
```

---

## 自我檢查工具 check.mjs

```bash
node tools/check.mjs drafts/2026-11-04-ai-newsroom/v1.html drafts/2026-11-04-ai-newsroom/v2.html
```

| 檢查 | 判定 |
|---|---|
| canvas | 沒有元素超出 1080×1350 |
| fonts | 只用 REFERENCE 的字體，且確實載入（防止默默 fallback） |
| min-font | 可見文字 ≥ 26px |
| colors | 所有文字、底色、框線、SVG 顏色都在色票內；漸層直接 FAIL |
| accent | 強調色文字最多 1 處 |
| identity | 有 `data-brand="identity"` 品牌識別區 |
| emoji / hans | 無 emoji、無常見簡體字 |
| bottom | 底部留白 > 140px 警告 |

**它抓不到的**：孤字（一行只剩「址。」）、版面好不好看。這兩項要看 PNG。本次 v1、v2 就是 check 全 PASS 但目測發現孤字，改文案後才定版。

---

## 疑難排解

| 現象 | 原因 | 解法 |
|---|---|---|
| 「REFERENCE.md doesn't exist」 | Step 1 後的正常狀態 | 跑 Step 2 |
| 圖完全沒套品牌 | Claude Code 開在別的資料夾，沒讀到 CLAUDE.md | 關掉，`cd linkedin-infographic` 後重開 |
| check 報色票外顏色 | 它發明了顏色 | 問：「這個顏色出自 REFERENCE.md 哪一行？」再補規則 |
| check 報 fonts 未載入 | 離線或 Google Fonts 被擋 | 確認網路；或改用本機字型並更新 REFERENCE |
| 三版長得一樣 | 只改細節沒改版型 | 用 Step 5 的 genuinely different layouts prompt |
| 手機上字太小 | 用全尺寸思考 | 跑 Step 5 打磨 prompt；min-font 會擋 < 26px |
| 看起來像 AI 做的 | 29 tells 有漏網 | 「remove the AI slop from this」 |

## 完成檢查清單

- [ ] REFERENCE.md 第 7 節 6 題已回答，狀態改為 v1
- [ ] `examples/` 有 5 張範例並已登記
- [ ] 每張圖 3 版、`check.mjs` 全 PASS、PNG 已目視（孤字、空白）
- [ ] 數字逐一對過來源
- [ ] 定稿已存回 `examples/`
