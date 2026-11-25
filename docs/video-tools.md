# Claude Code 影片製作工具(5 選)

一行安裝:`bash install-video-tools.sh`(重開 Claude Code 後生效)

## 選哪一個

| # | 工具 | 適合做什麼 | 輸出 | 外部依賴 | 授權 | 是否進 repo |
|---|---|---|---|---|---|---|
| 1 | **HyperFrames** (`/hyperframes`) | 通用首選:新聞快訊片、圖表、字幕、直式短影音、title card | HTML → MP4/WebM/MOV | Node、ffmpeg | Apache-2.0 ✅ 可商用 | ✅ |
| 2 | **onetake** (`/onetake`) | 10–30 秒產品發表/功能演示動效(UI 從截圖重建) | 單一 HTML → 4K60 | Node、ffmpeg | PolyForm **非商用** ⚠ | ❌(114MB) |
| 3 | **vox-director** (`/vox-director`) | 一個主題 → Vox 紙拼貼解說片(腳本/配圖/配音/字幕全自動) | MP4 | **Atlas Cloud API 金鑰**、ffmpeg | MIT ✅ | ❌(31MB) |
| 4 | **ClaudeAnimationBase** | p5.js 手繪角色動畫(Clawd 角色、筆刷質感) | MP4 | Node、Chrome、ffmpeg | MIT ✅ | ❌(在 `~/ClaudeAnimationBase`) |
| 5 | **Lemo-Opuscar** (`/lemo-opuscar`) | 指定畫風的程式短片:浮世繪、油畫、水彩、衛星簡報、產品拆解 | MP4 | Node、ffmpeg、Python(部分風格需生圖工具) | 程式 MIT / 文件與風格 **CC BY-NC** ⚠ | ✅(啟動時才抓 library 到 `~/lemo-opuscar`) |

**VeNews 建議**:每日新聞短影音用 **HyperFrames**(可商用、最穩);onetake 與 Lemo-Opuscar 的風格只用於非商用用途,若網站有廣告/營收,需先取得商用授權。

## 快速開始(Prompt 範本)

在專案根目錄開 Claude Code 後直接說:

```text
/hyperframes 把今天首頁頭條做成 30 秒 9:16 直式新聞快訊影片:標題卡 → 3 個重點 → 來源字幕,繁體中文,輸出 MP4
```

```text
/lemo-opuscar 用浮世繪風格做一支 20 秒短片,主題是「AI 新聞編輯部的一天」
```

```text
/vox-director 以「Claude Code 如何改變新聞工作流」為題,做 45 秒 Vox 紙拼貼解說片
```

```text
/onetake 用 VeNews 首頁截圖做一支 15 秒產品發表動效片(不錄屏,重建 UI)
```

ClaudeAnimationBase 是獨立專案,要在它的資料夾開 Claude Code:

```bash
cd ~/ClaudeAnimationBase && npm install
# 然後對 Claude Code 說:
# Read ANIMATION_GUIDE.md, then make a 15-second video of Clawd reading the morning news.
```

## 驗證

```bash
ls .claude/skills | grep -E 'hyperframes|onetake|vox-director|lemo-opuscar'   # 應列出 5 個
cd ~/ClaudeAnimationBase && node render.mjs --sheet=1,3,5,8 --cols=4 --w=320 --out=out/check/a.jpg
# 無 GPU 加 --soft-gl;成功會印出 "out/check/a.jpg (4 frames)"
```

## 常見問題

| 症狀 | 原因 / 解法 |
|---|---|
| `/onetake` 找不到 | 新 clone 的 repo 不含大型 skill → 重跑 `bash install-video-tools.sh` |
| 渲染很慢(每格數秒) | 無 GPU;ClaudeAnimationBase 請 Claude 避免水彩填色,或加 `--soft-gl` |
| vox-director 401/403 | 尚未設定 Atlas Cloud API 金鑰(依其 README 設定環境變數) |
| HyperFrames 首次執行詢問 usage note | 該 skill 會回傳使用紀錄給 HeyGen,不想送可直接回答 no |
| 只想裝輕量的 | `bash install-video-tools.sh --skip-heavy --skip-cab` |
