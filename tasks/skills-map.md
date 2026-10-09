# Skills 對照表（財務會計 × 資料 × 文件 × 前端）

來源：本環境已安裝 skill 的 frontmatter（`/root/.claude/plugins/synced/*`、`/mnt/skills/*`）。
範圍：與財務會計、報表、簡報、資料處理、前端相關者。其餘約 500 個（Twilio、CockroachDB、Carta、Wix、Bio 等）刻意略過。
限制：以下依 description 整理，尚未逐一讀完各 SKILL.md 全文；實際使用時 Skill 工具會載入完整指令。

## 一、選用原則（先看這張）

| 你要做的事 | 用這個 | 不要用 |
|---|---|---|
| 讀/寫/修 Excel、CSV | `anthropic-skills:xlsx`（公開版） | 手寫 openpyxl 而不看 skill |
| 無 Excel App、要產出 .xlsx 檔 | `*:xlsx-author`（headless） | 驅動 Excel 的 skill |
| 產出簡報 .pptx | `anthropic-skills:pptx` | `ppt-template-creator`（那是做「模板 skill」用） |
| Word 文件 | `anthropic-skills:docx` | — |
| PDF 讀取/合併/拆分/OCR/表單 | `anthropic-skills:pdf` | `pdf-viewer:*`（偏檢視/標註/簽名） |
| 做新 skill | `anthropic-skills:skill-creator` | 直接亂寫 SKILL.md |
| 單檔 HTML 工具/儀表板 | `data:build-dashboard`、`frontend-design` | 外部 CDN 過多 |
| 複雜 React 成品（artifact） | `anthropic-skills:web-artifacts-builder` | — |

## 二、會計 / 月結（最貼近你的工作）

| Skill | 觸發情境 | 輸入 | 輸出 |
|---|---|---|---|
| `finance:close-management` | 排月結日曆、追進度、找卡點 | 結帳任務清單 | 依 Day 排序的任務與依賴 |
| `finance:journal-entry` / `journal-entry-prep` | 應計、預付攤銷、折舊、薪資、收入認列 | 科目、金額、支持文件 | 借貸分錄 + 佐證 |
| `finance:reconciliation` | 銀行調節、GL vs 明細帳、關係人往來 | 兩邊餘額/明細 | 調節表 + 調節項分類 |
| `finance:financial-statements` | 月/季損益表、資產負債表、現金流量表 | 試算表 | 三表 + 期間比較 + 重大差異 |
| `finance:variance-analysis` | 預算 vs 實際、期間差異拆解 | 實際/預算資料 | 驅動因素 + waterfall |
| `finance:audit-support` / `sox-testing` | SOX 404 控制測試、抽樣、缺失分類 | 控制點清單 | 抽樣、底稿、缺失評級 |
| `month-end-closer:accrual-schedule` | 期末應計明細 | 合約/發票/GL | 每筆應計金額 + 依據 + **JE 草稿（待核准，非過帳）** |
| `month-end-closer:roll-forward` | 資產負債科目 rollforward | GL 期初/活動 | 期初+活動−迴轉=期末，逐項對 GL |
| `month-end-closer:variance-commentary` | 超過門檻科目的 flux 說明 | 本期/上期/預算 | 逐科目差異說明 |
| `gl-reconciler:gl-recon` | GL 對明細帳（日/月） | 兩邊部位或交易 | breaks + 成因分類 |
| `gl-reconciler:break-trace` | gl-recon 之後追單筆差異根因 | break 列 | 兩邊原始分錄與差異原因 |
| `fund-admin:*` / `statement-auditor:nav-tieout` | 基金 NAV、LP 對帳單 | NAV pack | 逐行 tie-out |
| `small-business:month-end-prep` / `close-month` / `cash-flow-snapshot` | 小型企業帳務對金流 | 分類帳 + 支付平台 | 對帳、30/60/90 日現金預測 |

注意：`user-invocable: false` 的 `finance:*` 子 skill（audit-support、close-management、journal-entry-prep）由其他 skill 內部呼叫，不能直接用 `/` 觸發。
注意：JE 一律是草稿，需人工核准，不自動過帳。

## 三、Excel 品質與資料清理

| Skill | 用途 | 對應你的規則 |
|---|---|---|
| `financial-analysis:audit-xls` | 查公式錯誤、BS 平衡、現金勾稽、邏輯錯誤 | 「提供 reconciliation / 核對方式」 |
| `financial-analysis:clean-data-xls` | 去空白、統一大小寫、文字數字轉數值、日期標準化、去重、標記混型欄位 | 「檢查重複值、空值、日期/金額格式」 |
| `data:validate-data` | 交付前 QA：方法、計算、偏誤 | 「執行後驗證，不要假設正確」 |
| `data:explore-data` | 新資料表 profiling：null 率、分佈、品質 | 「先確認欄位定義與主鍵」 |
| `data:sql-queries` / `write-query` | 多方言 SQL 撰寫/優化 | SQL Server 需手動確認 T-SQL 語法 |
| `data:statistical-analysis` | 描述統計、離群值、假設檢定 | 異常偵測 |
| `data:create-viz` / `data-visualization` / `dataviz` | 圖表 | 「Before/After、母體、排除條件」要自己補 |

缺口（skill 不會替你做）：
- 「不可 mapping 資料輸出獨立 exception log、不靜默刪除」是你的規則，上述 skill 沒有內建。
- 建議做成自訂 skill：`recon-exception-log`（見第六節）。

## 四、簡報 / 文件 / PDF

| Skill | 重點 |
|---|---|
| `anthropic-skills:pptx` | 任何涉及 .pptx 的輸入或輸出 |
| `financial-analysis:deck-refresh` | 既有簡報換新數字（季更、comp roll） |
| `financial-analysis:ib-check-deck` | 簡報數字一致性、敘事與資料對齊、用語檢查 |
| `anthropic-skills:docx` | Word 建立/編輯/讀取 |
| `anthropic-skills:pdf` | 文字/表格擷取、合併、拆分、旋轉、浮水印、OCR |
| `pdf-viewer:annotate/fill-form/sign` | PDF 標註、填表、簽名 |
| `anthropic-skills:deep-research` | 多來源研究報告 |
| `anthropic-skills:doc-coauthoring` | 與使用者共同撰寫文件 |

## 五、前端 / 工具開發

| Skill | 用途 |
|---|---|
| `frontend-design` | 版面、字體、美學方向，避免模板感 |
| `anthropic-skills:web-artifacts-builder` | React + Tailwind + shadcn 的複雜 artifact |
| `vercel-react-best-practices` | React/Next 效能規則 |
| `web-design-guidelines`、`fixing-accessibility`、`fixing-motion-performance` | UI 審查、無障礙、動畫效能（含 `prefers-reduced-motion`） |
| `data:build-dashboard` | 自包含 HTML 儀表板（KPI 卡、篩選、表格） |
| `engineering:code-review` / `testing-strategy` / `debug` | 開發品質 |

## 六、建議自建的 skill（把你的偏好固化）

| 名稱 | 內容 | 價值 |
|---|---|---|
| `recon-exception-log` | 標準化 mapping 流程：原始值/轉換值/錯誤原因/狀態、筆數平衡、exception log | 把你的資料規則變成每次都執行 |
| `accounting-ops-sop` | 依你 SOP 範本（情境→目標→前置→步驟→驗證→常見錯誤）產出教學文件 | 內訓、同仁教學 |
| `claude-code-brief` | 產出給 Claude Code 的完整指令（先讀檔、不破壞功能、驗證命令、完成定義） | 避免 AI 直接重寫全部程式 |

建立方式：呼叫 `anthropic-skills:skill-creator`，提供上表的規則作為需求。

## 七、驗證紀錄

- 已確認：以上 skill 名稱與 description 皆取自本環境實際檔案。
- 未做：逐一執行 skill 驗證輸出品質；skill 全文未全部閱讀。
- 無法使用：`skillry.dev` 頁面（網域無法解析），其內容未納入。
