# 我與 AI 合作的圖片生成指南 — Anthropic 風格動畫簡報

用 [Remotion](https://remotion.dev) 製作、模仿 Anthropic「Getting started with Claude」
說明影片風格的動畫簡報。內容為 22 頁課程（另有一頁 Agenda），可即時預覽，也能輸出 mp4。

## 風格

- **官方品牌色**：暖白 `#faf9f5`、墨黑 `#141413`、主色橘 `#d97757`、藍 `#6a9bcc`、綠 `#788c5d`
- **字體**：標題 Lora + Noto Serif TC（襯線），內文 Poppins + Noto Sans TC（無襯線）
- **動態語言**：柔和的指數緩動 `cubic-bezier(0.16, 1, 0.3, 1)`，元素淡入＋上移，場景交叉淡出

## 常用指令

```bash
npm install            # 安裝依賴
npm run dev            # 開啟 Remotion Studio 預覽
npx remotion render AnthropicDeck out/deck.mp4   # 輸出影片
```

> 在無法連到 fonts.gstatic.com 的沙箱環境，Chromium 需指定 headless-shell：
> `npx remotion render AnthropicDeck out/deck.mp4 --browser-executable=/path/to/headless_shell`

## 改內容

所有投影片文字都在 **`src/deck/data.ts`**（一個 `SLIDES` 陣列）。改文字不需要動到動畫。
每種版型（`cover`／`agenda`／`statement`／`bullets`／`split`／`cards`／`steps`／`closing`）
的渲染都在 `src/deck/slides.tsx`。完整口說講稿在 `SCRIPT.md`。

## 字體

字體自帶在 `public/fonts/`（Noto TC 已依課程用字做子集化，檔案很小）。
若改了 `data.ts` 用到新字，重新產生子集：

```bash
node scripts/subset-fonts.mjs
```

## 檔案結構

```
src/
  theme.ts             品牌色、字體載入、緩動
  components/anim.tsx   動畫原件：Slide / RiseIn / WordsIn / DrawUnderline / AnthropicMark
  deck/
    data.ts            ← 所有投影片內容（改這裡）
    slides.tsx         各版型的渲染
  AnthropicDeck.tsx     把投影片依序組成影片（含頁碼）
  Root.tsx              註冊 composition（1920×1080, 30fps）
```
