# 新聞轉短片:VeNews × Lemo-Opuscar

把 VeNews 的新聞交給 [Lemo-Opuscar](https://github.com/lemomo-ai/lemo-opuscar) 做成純程式碼算繪的短片
(Canvas/WebGL 逐格算繪 + TTS 旁白 + ffmpeg,不用影片生成模型)。

VeNews 只負責產生「製片需求 prompt」(`lib/filmBrief.ts`),實際製片在你本機的 Claude Code 執行。

## 1. 前置需求(本機)

- Node 20+、ffmpeg、Python 3.11+(或 uv)
- Claude Code(風格針對 Claude Opus 5.5 調校)

## 2. 安裝 plugin(只裝官方來源)

```sh
claude plugin marketplace add lemomo-ai/lemo-opuscar
claude plugin install lemo-opuscar@lemolab
```

第一次使用會把風格庫下載到 `~/lemo-opuscar`。GitHub 上有大量同名 fork,請只用 `lemomo-ai/lemo-opuscar`。

## 3. 分類 → 風格對照

| VeNews 分類 | 風格 | slug |
|---|---|---|
| 要聞 headline | Broadcast News Package | `news-package` |
| 國際 world | Satellite Briefing | `satellite-briefing` |
| 科技 tech | Isometric Infographic | `iso-infographic` |
| 財經 finance | Data Storytelling | `dataviz` |
| 文化 culture | Watercolor Brush | `watercolor` |
| 體育 sports | Sports Telestrator | `telestrator` |

未知分類一律用 `news-package`。片長依閱讀時間推估(每分鐘約 10 秒,限制 30–90 秒)。

## 4. 產生 prompt

```ts
import { buildFilmBrief } from '@/lib/filmBrief';

const { prompt } = buildFilmBrief(article, { seconds: 45, narrator: '溫暖的女聲旁白' });
```

把 `prompt` 貼進 Claude Code。它會先問一輪問題、出分鏡,確認後才算繪,成片放在你啟動 Claude Code 的資料夾裡。

## 5. 注意事項

- prompt 要求「只用摘要中的事實」,片尾附上作者和日期;發布前仍要人工核對。
- TTS 聲音、音色庫有各自的授權;商用前先確認。
- 算繪很吃 CPU,建議在本機跑,不要放在 Vercel。
