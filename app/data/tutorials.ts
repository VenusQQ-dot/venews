export interface Tutorial {
  slug: string;
  title: string;
  description: string;
  difficulty: '入門' | '進階' | '高級';
  readTime: string;
  tags?: string[];
  content?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  gradient: string;
  accentColor: string;
  tutorials: Tutorial[];
}

export const categories: Category[] = [
  {
    id: 'nanobanana',
    name: 'Nano Banana MCP',
    icon: '🍌',
    description: 'AI 生圖工具配置與實戰教程',
    gradient: 'from-yellow-400 to-orange-500',
    accentColor: '#f59e0b',
    tutorials: [
      {
        slug: 'nanobanana-mcp-setup',
        title: 'Nano Banana MCP 配置指南',
        description: '3 分鐘完成 AI 生圖配置，從安裝到出圖全流程手把手教學',
        difficulty: '入門',
        readTime: '8 分鐘',
        tags: ['MCP', 'AI 繪圖', '快速入門'],
        content: `
## Nano Banana MCP 配置指南

Nano Banana 是目前最容易上手的 AI 生圖 MCP 工具。只需 3 分鐘，你就能讓 Claude 直接幫你生成圖片，無需切換任何 APP。

### 前置準備

在開始之前，請確認以下條件：

- 已安裝 **Claude Desktop**（[下載頁面](https://claude.ai/download)）
- 已註冊 **Nano Banana 帳號**並取得 API 金鑰
- Node.js 18+ 環境（終端輸入 \`node -v\` 確認）

---

### 第一步：安裝 MCP 伺服器套件

打開終端，執行以下命令：

\`\`\`bash
npm install -g @nanobanana/mcp-server
\`\`\`

安裝完成後，確認可執行：

\`\`\`bash
nanobanana-mcp --version
\`\`\`

---

### 第二步：取得 API 金鑰

1. 登入 [Nano Banana 控制台](https://nanobanana.ai/dashboard)
2. 點選右上角帳號 → **API 金鑰**
3. 點 **建立新金鑰**，複製金鑰備用

> ⚠️ API 金鑰只會顯示一次，請立即儲存到安全的地方

---

### 第三步：設定 Claude Desktop

找到 Claude Desktop 的設定檔（依作業系統不同路徑如下）：

| 系統 | 路徑 |
|------|------|
| macOS | \`~/Library/Application Support/Claude/claude_desktop_config.json\` |
| Windows | \`%APPDATA%/Claude/claude_desktop_config.json\` |

用文字編輯器打開，加入以下設定：

\`\`\`json
{
  "mcpServers": {
    "nanobanana": {
      "command": "npx",
      "args": ["-y", "@nanobanana/mcp-server"],
      "env": {
        "NANO_API_KEY": "貼上你的API金鑰"
      }
    }
  }
}
\`\`\`

儲存後，**完全關閉並重新啟動** Claude Desktop。

---

### 第四步：驗證安裝成功

重啟後，在 Claude 對話框輸入：

> 請幫我生成一張賽博龐克風格的城市夜景圖

如果 Claude 開始生圖並回傳圖片，代表安裝成功 🎉

---

### 常見問題排解

**問：重啟後還是看不到生圖功能？**

確認 JSON 格式正確（可用 [jsonlint.com](https://jsonlint.com) 驗證），並確認 API 金鑰沒有多餘空格。

**問：生圖失敗，顯示 API 錯誤？**

檢查 Nano Banana 帳號是否還有額度，免費方案每月限 50 次生圖。

**問：Windows 環境出現路徑錯誤？**

嘗試將 \`command\` 改為 \`node\`，\`args\` 第一項改為完整的 node_modules 路徑。
`,
      },
      {
        slug: 'xiaohongshu-cover-tutorial',
        title: '小紅書爆款封面製作教程',
        description: '點擊率提升 200% 的秘密，用 AI 批量打造吸睛封面',
        difficulty: '進階',
        readTime: '12 分鐘',
        tags: ['小紅書', 'AI 繪圖', '內容創作'],
        content: `
## 小紅書爆款封面製作教程

封面是小紅書筆記成敗的關鍵。據官方數據，封面點擊率每提升 1%，推薦量平均提升 3%。本教程教你用 AI 批量生成高點擊率封面。

### 爆款封面的 5 大要素

1. **強烈色彩對比** — 主色與背景對比度 > 4.5:1
2. **清晰大字標題** — 字體 ≥ 36px，3 秒內能看完
3. **真實人物特寫** — 有臉的封面點擊率高 40%
4. **數字化標題** — 「7 個方法」比「很多方法」點擊率高 60%
5. **統一視覺風格** — 連續 3 張以上同色系，漲粉更快

---

### 提示詞公式

用 Nano Banana MCP，搭配以下公式生成封面：

\`\`\`
[風格] + [主體] + [顏色方案] + [文字內容] + [尺寸比例]
\`\`\`

**實際範例：**

\`\`\`
生成一張小紅書封面圖：
風格：韓系清新雜誌感
主體：25歲亞洲女生，微笑，穿白色針織毛衣
顏色方案：奶油白+莫蘭迪粉
標題文字：「顯瘦穿搭秘訣」（黑色粗體）
副標題：「3個技巧讓你瘦10斤」（灰色細體）
尺寸：1:1 正方形，1080×1080px
\`\`\`

---

### 不同品類的封面策略

#### 美食類
\`\`\`
俯拍視角，自然光，食物特寫，
背景為木質桌面，暖色調，
標題「XX 分鐘快手早餐」
\`\`\`

#### 穿搭類
\`\`\`
全身照，白色背景，乾淨極簡，
人物比例修長，自然姿態，
標題「OOTD｜上班穿這套」
\`\`\`

#### 知識乾貨類
\`\`\`
純色背景（建議珊瑚橘或天際藍），
大標題佔畫面 60%，
搭配簡單圖示，無人物
\`\`\`

---

### 批量生成工作流

用 Claude + Nano Banana MCP，一次生成多張備用封面：

> 我是一個美妝博主，幫我生成 5 張不同風格的小紅書封面：
> 1. 韓系清新風
> 2. 歐美大片風
> 3. 日系小清新
> 4. 國風復古感
> 5. 極簡設計風
>
> 主題都是「秋冬底妝教學」，尺寸 1:1，保持統一的文字排版。

每週花 30 分鐘批量生成，一個月的封面素材就準備好了。
`,
      },
    ],
  },
  {
    id: 'didimcp',
    name: '滴滴 MCP',
    icon: '🚖',
    description: '滴滴出行 Agent 集成與實戰案例',
    gradient: 'from-orange-400 to-red-500',
    accentColor: '#f97316',
    tutorials: [
      {
        slug: 'MCP配置指南',
        title: '滴滴 MCP 配置指南',
        description: '手把手接入滴滴 MCP，讓 AI 助手擁有叫車、查詢路線的能力',
        difficulty: '入門',
        readTime: '10 分鐘',
        tags: ['滴滴', 'MCP', '出行'],
        content: `
## 滴滴 MCP 配置指南

接入滴滴 MCP 後，你可以直接對 Claude 說「幫我叫一台車去機場」，AI 會自動查詢車況、預估費用、完成叫車，全程免手動操作。

### 能做什麼？

接入後 AI 可以：
- 🚗 查詢附近可用車輛與預估等待時間
- 💰 比較不同車型費用（快車/優享/拼車）
- 🗺️ 規劃最優路線，顯示預計到達時間
- 📍 記住常用地點（家、公司、健身房等）
- 👴 協助老年人完成完整叫車流程

---

### 前置準備

1. 已有滴滴出行帳號
2. 前往 [滴滴開放平台](https://open.didiglobal.com) 申請開發者資格
3. 建立應用，選擇「出行服務」類別

---

### 第一步：取得開發者憑證

在滴滴開放平台完成申請後：

1. 進入「我的應用」→ 選擇剛建立的應用
2. 點擊「查看憑證」
3. 記錄 **AppKey** 與 **AppSecret**

> 注意：AppSecret 需妥善保管，洩露會導致帳號費用被盜刷

---

### 第二步：安裝 MCP 套件

\`\`\`bash
npm install -g @didi/mcp-server
\`\`\`

---

### 第三步：設定 Claude Desktop

編輯 Claude Desktop 設定檔，新增：

\`\`\`json
{
  "mcpServers": {
    "didi": {
      "command": "npx",
      "args": ["-y", "@didi/mcp-server"],
      "env": {
        "DIDI_APP_KEY": "你的AppKey",
        "DIDI_APP_SECRET": "你的AppSecret",
        "DIDI_ENV": "production"
      }
    }
  }
}
\`\`\`

---

### 第四步：測試基本功能

重啟 Claude Desktop 後，試試以下指令：

> 現在附近有哪些滴滴快車可用？最快多久到？

> 我要從台北車站去松山機場，用滴滴叫車大概多少錢？

---

### 安全設定建議

- 設定每日消費上限（在滴滴 APP → 安全設定）
- 開啟行程分享功能，方便緊急聯絡
- 定期檢查 API 呼叫紀錄，防止異常消費
`,
      },
      {
        slug: 'Agent實戰教程',
        title: '滴滴 Agent 老人打車案例實戰',
        description: '為銀髮族設計的 AI 打車助手，大字體、語音輸入、一鍵確認',
        difficulty: '進階',
        readTime: '20 分鐘',
        tags: ['Agent', '無障礙設計', '案例實戰'],
        content: `
## 滴滴 Agent 老人打車案例實戰

### 背景與問題

中國 60 歲以上人口超過 2.9 億，但現有打車 APP 對老年人極不友善：
- 字體太小，視力不佳者難以閱讀
- 操作步驟多達 7-8 步
- 目的地輸入需要精確文字，容易出錯
- 支付流程複雜，容易操作失誤

**目標：** 讓老年人只需說一句話，AI 完成全部操作。

---

### 設計思路

\`\`\`
用戶說：「我要去看醫生」
         ↓
AI 識別：解析語義，確認常用醫院地址
         ↓
AI 查詢：呼叫滴滴 MCP 查詢附近車輛
         ↓
AI 展示：用大字體顯示費用、等待時間
         ↓
用戶確認：只需說「好的」或點一下
         ↓
AI 完成：自動叫車、發送位置給家人
\`\`\`

---

### 核心功能實作

#### 1. 地點語義解析

\`\`\`python
# 將模糊描述轉換為精確地址
COMMON_DESTINATIONS = {
    "醫院": ["附近最近的醫院", "家庭醫生診所"],
    "菜市場": ["早市農貿市場"],
    "公園": ["社區公園", "人民公園"],
}

async def resolve_destination(user_input: str, user_id: str) -> str:
    # 先查個人常用地點
    profile = await get_user_profile(user_id)
    for key, address in profile.favorite_places.items():
        if key in user_input:
            return address

    # 再查通用地點庫
    for keyword, candidates in COMMON_DESTINATIONS.items():
        if keyword in user_input:
            return await find_nearest(candidates, profile.home_location)

    # 最後用 AI 解析
    return await ai_parse_location(user_input)
\`\`\`

#### 2. 大字體確認介面

\`\`\`python
def format_confirmation_for_elderly(ride_info: dict) -> str:
    lines = [
        "🚗 叫車確認",
        "",
        "📍 出發：" + ride_info["origin"],
        "🏥 目的：" + ride_info["destination"],
        "",
        "💰 費用：約 " + str(ride_info["price"]) + " 元",
        "⏱️ 等待：約 " + str(ride_info["wait_time"]) + " 分鐘",
        "🚙 車牌：" + ride_info["plate_number"],
        "",
        "請說「確認叫車」或「取消」",
    ]
    return "\\n".join(lines)
\`\`\`

#### 3. 自動通知家人

\`\`\`python
async def notify_family(user_id: str, ride_info: dict):
    profile = await get_user_profile(user_id)
    message = (
        "【行程通知】" + profile.name + " 剛叫了一輛車，"
        "目的地：" + ride_info["destination"] + "，"
        "預計到達：" + ride_info["eta"]
    )
    for contact in profile.emergency_contacts:
        await send_sms(contact.phone, message)
\`\`\`

---

### 完整對話範例

\`\`\`
👴 用戶：我肚子不舒服，要去看醫生

🤖 AI：好的，我幫您查詢附近醫院的車。

    找到 2 台快車，最快 3 分鐘到：

    📍 出發：您現在的位置（河濱社區）
    🏥 目的：仁愛醫院急診
    💰 費用：約 18 元
    ⏱️ 等待：約 3 分鐘

    要叫這台車嗎？

👴 用戶：好

🤖 AI：車輛已叫好，司機正在趕來。
    已通知您兒子您的行程。
    請在大門口等候，車是銀色豐田凱美瑞。
\`\`\`

---

### 部署注意事項

- 語音輸入建議整合語音辨識 API
- 介面字體建議 ≥ 20px，按鈕 ≥ 48×48px
- 建議加入「我到了嗎」語音查詢行程狀態
- 定期同步家人緊急聯絡資料
`,
      },
    ],
  },
  {
    id: 'chrome-devtools-mcp',
    name: 'Chrome DevTools MCP',
    icon: '🔧',
    description: '讓 AI 直接控制瀏覽器，自動化任何網頁操作',
    gradient: 'from-blue-400 to-cyan-500',
    accentColor: '#3b82f6',
    tutorials: [
      {
        slug: 'chrome-devtools-mcp-配置指南',
        title: 'Chrome DevTools MCP 配置指南',
        description: '配置後讓 AI 能截圖、填表單、爬資料、自動化測試，樣樣都行',
        difficulty: '入門',
        readTime: '10 分鐘',
        tags: ['Chrome', 'DevTools', '瀏覽器自動化'],
        content: `
## Chrome DevTools MCP 配置指南

Chrome DevTools MCP 讓 Claude 獲得「眼睛」與「雙手」——它能看到你的瀏覽器畫面，也能點擊、輸入、捲動任何網頁元素。

### 能做什麼？

- 📸 截圖任意網頁，分析頁面內容
- 🖱️ 自動點擊按鈕、填寫表單
- 📋 批量擷取網頁資料（商品價格、聯絡資訊等）
- 🧪 自動化網頁測試，找出 UI 問題
- 🔍 分析網頁效能、偵測 JavaScript 錯誤

---

### 第一步：以除錯模式啟動 Chrome

Chrome 需要開啟遠端除錯端口才能被 MCP 連接。

**macOS：**
\`\`\`bash
/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug
\`\`\`

**Windows（命令提示字元）：**
\`\`\`cmd
"C:/Program Files/Google/Chrome/Application/chrome.exe" --remote-debugging-port=9222 --user-data-dir=C:/temp/chrome-debug
\`\`\`

**Linux：**
\`\`\`bash
google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug
\`\`\`

啟動後，打開 \`http://localhost:9222/json\` 確認回傳 JSON 代表成功。

---

### 第二步：安裝 MCP 套件

\`\`\`bash
npm install -g @chrome-devtools/mcp-server
\`\`\`

---

### 第三步：設定 Claude Desktop

\`\`\`json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "@chrome-devtools/mcp-server"],
      "env": {
        "CDP_URL": "http://localhost:9222",
        "SCREENSHOT_DIR": "/tmp/screenshots"
      }
    }
  }
}
\`\`\`

---

### 第四步：實際操作範例

**截圖分析：**
> 幫我截圖目前瀏覽器的頁面，告訴我有什麼問題

**自動填表：**
> 打開 Google 表單，自動填入以下資料：姓名王小明、電話0912345678、選擇「同意」選項後送出

**資料擷取：**
> 爬取目前頁面所有商品的名稱和價格，整理成表格

---

### 進階：建立自動化腳本

結合 Claude 的程式碼生成能力：

> 幫我寫一個腳本，每天早上 9 點自動：
> 1. 打開台灣氣象局網站
> 2. 截圖今日天氣預報
> 3. 傳到我的 LINE 群組

---

### 安全注意事項

- 除錯模式下的 Chrome **不要登入重要帳號**（銀行、電商等）
- \`--user-data-dir\` 建議指向獨立資料夾，與正常 Chrome 隔離
- 完成後關閉除錯 Chrome，避免長時間暴露 9222 端口
`,
      },
    ],
  },
  {
    id: 'playwright-mcp',
    name: 'Playwright MCP',
    icon: '🎭',
    description: '網頁自動化、PDF 分析、批量資料處理全攻略',
    gradient: 'from-green-400 to-teal-500',
    accentColor: '#10b981',
    tutorials: [
      {
        slug: 'playwright-mcp-config',
        title: 'Playwright MCP 安裝配置',
        description: '5 分鐘安裝完成，開啟 AI 驅動的網頁自動化能力',
        difficulty: '入門',
        readTime: '8 分鐘',
        tags: ['Playwright', '自動化', '安裝配置'],
        content: `
## Playwright MCP 安裝配置

Playwright MCP 是比 Chrome DevTools MCP 更強大的瀏覽器自動化工具，支援 Chromium、Firefox、WebKit 三種瀏覽器引擎，特別適合需要跨瀏覽器測試或處理複雜 SPA 頁面的場景。

### Playwright MCP vs Chrome DevTools MCP

| 功能 | Playwright MCP | Chrome DevTools MCP |
|------|:-:|:-:|
| 跨瀏覽器支援 | ✅ 3種 | ❌ 僅Chrome |
| 無頭模式 | ✅ | ✅ |
| 網路攔截 | ✅ | ⚠️ 有限 |
| PDF 轉換 | ✅ | ❌ |
| 行動裝置模擬 | ✅ | ⚠️ 有限 |
| 設定難度 | 中 | 低 |

---

### 第一步：安裝套件

\`\`\`bash
npm install -g @playwright/mcp-server
\`\`\`

安裝瀏覽器驅動（首次需要，約 200MB）：

\`\`\`bash
npx playwright install chromium
# 如需其他瀏覽器：
npx playwright install firefox
npx playwright install webkit
\`\`\`

---

### 第二步：設定 Claude Desktop

\`\`\`json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp-server"],
      "env": {
        "PLAYWRIGHT_BROWSER": "chromium",
        "PLAYWRIGHT_HEADLESS": "true",
        "PLAYWRIGHT_TIMEOUT": "30000"
      }
    }
  }
}
\`\`\`

---

### 第三步：驗證安裝

重啟 Claude Desktop 後，輸入：

> 用 Playwright 打開 https://example.com，截圖並告訴我頁面上有什麼內容

成功的話你會看到截圖和頁面描述。

---

### 常見錯誤排解

**錯誤：\`browserType.launch: Executable doesn't exist\`**

\`\`\`bash
# 重新安裝瀏覽器
npx playwright install --with-deps chromium
\`\`\`

**錯誤：Linux 環境缺少依賴**

\`\`\`bash
npx playwright install-deps chromium
\`\`\`

**錯誤：timeout exceeded**

在設定中增加 \`PLAYWRIGHT_TIMEOUT\` 值，例如 \`"60000"\`（60 秒）。
`,
      },
      {
        slug: 'Playwright-MCP內容分析案例',
        title: 'Playwright MCP 實戰：網頁抓取 × PDF 分析 × 自動化報告',
        description: '3 個真實案例，解鎖 AI 自動化的超強生產力',
        difficulty: '進階',
        readTime: '25 分鐘',
        tags: ['網頁抓取', 'PDF 分析', '自動化報告'],
        content: `
## Playwright MCP 實戰三部曲

### 案例一：競品價格監控系統

**需求：** 每天自動抓取競品網站的商品價格，偵測到降價時發送通知。

**實作步驟：**

1. 告訴 Claude 目標網站與商品清單
2. Claude 用 Playwright 抓取各商品價格
3. 與上次記錄比較，找出價格變動
4. 生成每日報告

**對 Claude 下指令：**

> 請用 Playwright 執行以下任務：
> 1. 打開 https://example-shop.com/products
> 2. 找出所有商品名稱和價格
> 3. 與上週的資料（我貼在下方）比較
> 4. 列出降價超過 10% 的商品
>
> 上週資料：
> - 無線耳機 A：NT$2,999
> - 藍牙喇叭 B：NT$1,499
> - 充電線 C：NT$299

---

### 案例二：批量 PDF 合約分析

**需求：** 公司有 50 份合約 PDF，需要快速找出每份合約的到期日和金額。

**工作流程：**

\`\`\`
本地 PDF 資料夾
    ↓
逐一開啟解析
    ↓
Claude 解析文字內容
    ↓
提取關鍵欄位：到期日、金額、乙方名稱
    ↓
輸出整理好的表格
\`\`\`

**對 Claude 下指令：**

> 請幫我分析「合約」資料夾中的所有 PDF 檔案
>
> 對每份合約，提取：
> - 合約編號
> - 乙方公司名稱
> - 合約金額（含幣別）
> - 合約到期日
> - 是否有自動續約條款（有/無）
>
> 最後整理成一個 Markdown 表格

---

### 案例三：每日新聞摘要自動化

**需求：** 每天早上自動整理科技新聞，生成 5 分鐘可讀完的摘要。

**對 Claude 下指令：**

> 請用 Playwright 執行以下任務，生成今日科技新聞摘要：
>
> 1. 打開 https://techcrunch.com，抓取今日前 5 篇文章標題和摘要
> 2. 打開 https://36kr.com，抓取今日前 5 篇
> 3. 打開 https://news.ycombinator.com，抓取今日 top 10 討論串標題
>
> 整合後，用繁體中文寫一份摘要，格式如下：
> - 重大新聞（3 則，每則 2 句話）
> - 值得關注的趨勢（1 段，100字以內）
> - 今日 HN 最熱討論（前 3 則）

---

### 進階技巧：處理動態網頁

遇到需要登入或有 JavaScript 渲染的網頁：

\`\`\`
請用 Playwright：
1. 打開登入頁面
2. 在 email 欄位輸入帳號
3. 在密碼欄位輸入密碼
4. 點擊登入按鈕
5. 等待頁面載入完成
6. 截圖目前畫面
7. 抓取頁面上的所有訂單資料
\`\`\`

> ⚠️ 請勿用於未授權的網站，確保遵守目標網站的使用條款與 robots.txt
`,
      },
    ],
  },
  {
    id: 'dingtalk-clawdbot',
    name: '釘釘 + Clawdbot',
    icon: '💬',
    description: '企業釘釘接入 AI 機器人，打造智能工作助手',
    gradient: 'from-indigo-400 to-purple-500',
    accentColor: '#6366f1',
    tutorials: [
      {
        slug: 'index',
        title: '釘釘接入 AI 機器人完整教程',
        description: '8 步設定完成，讓 AI 進駐企業釘釘群，自動回覆、整理會議記錄、處理審批',
        difficulty: '入門',
        readTime: '15 分鐘',
        tags: ['釘釘', '企業 AI', 'AI 機器人'],
        content: `
## 釘釘接入 AI 機器人完整教程

接入後你的釘釘群會多一個永遠線上的 AI 同事，能回答問題、整理文件、提醒待辦，比真人助理更快更準。

### 可以做什麼？

- 💬 **智能問答** — @機器人 提問，秒速回答公司制度、產品資訊
- 📝 **會議記錄** — 貼上會議逐字稿，自動生成結構化摘要
- 📋 **審批草稿** — 說明情況，自動生成請假單、報銷單內容
- 🔔 **智能提醒** — 每日早報、項目進度追蹤、截止日期提醒
- 📊 **數據分析** — 貼入數據，即時生成分析報告

---

### 第一步：申請釘釘開發者帳號

1. 前往 [釘釘開放平台](https://open.dingtalk.com)
2. 使用企業管理員帳號登入
3. 點選「應用開發」→「企業內部應用」→「建立應用」
4. 填寫應用名稱（如「AI助手」）和描述

---

### 第二步：啟用機器人功能

在應用設定頁面：

1. 左側選單點「能力」→「機器人」
2. 開啟「機器人」開關
3. 填寫機器人名稱：AI 工作助手
4. 上傳機器人頭像
5. **訊息接收地址**先填入你的伺服器地址（後續設定）

---

### 第三步：設定應用權限

在「許可權管理」頁面，開啟以下許可權：

\`\`\`
✅ 個人手機號資訊
✅ 成員詳情
✅ 群管理
✅ 訊息通知
\`\`\`

---

### 第四步：取得憑證

記錄以下資訊（後續設定需要）：

| 項目 | 在哪裡找 |
|------|----------|
| AppKey | 應用首頁 → 應用資訊 |
| AppSecret | 應用首頁 → 應用資訊 |
| Robot Code | 機器人設定頁面 |

---

### 第五步：部署後端服務

使用 Docker 快速部署：

\`\`\`bash
# 下載設定檔
curl -O https://raw.githubusercontent.com/clawdbot/dingtalk/main/docker-compose.yml

# 編輯環境變數（.env 檔）
# DINGTALK_APP_KEY=你的AppKey
# DINGTALK_APP_SECRET=你的AppSecret
# CLAUDE_API_KEY=你的Claude金鑰
# WEBHOOK_TOKEN=自訂一個隨機字串用於安全驗證

# 啟動服務
docker compose up -d
\`\`\`

---

### 第六步：設定 Webhook

服務啟動後，將訊息接收地址更新為：

\`\`\`
https://你的伺服器IP:3000/webhook/dingtalk
\`\`\`

回到釘釘開放平台，在機器人設定中更新此地址。

---

### 第七步：發布應用

1. 點「應用發布」→「確認發布」
2. 前往企業後台，找到剛發布的應用
3. 點「設定可用範圍」，選擇要使用的部門或人員

---

### 第八步：測試

在釘釘中搜尋「AI 工作助手」，發起單聊：

> @AI工作助手 你好，介紹一下你能做什麼

如果收到回覆，代表設定成功！

---

### 實際使用範例

**整理會議記錄：**
> 幫我整理以下會議內容，輸出：決議事項、負責人、截止時間
> [貼上逐字稿]

**生成週報：**
> 根據以下本週工作清單，幫我生成一份週報，格式為：本週完成、下週計畫、需要支援
> [貼上工作清單]
`,
      },
    ],
  },
  {
    id: 'best-minds',
    name: '最強大腦',
    icon: '🧠',
    description: '掌握 AI 提問技巧，讓回答品質翻倍',
    gradient: 'from-purple-400 to-pink-500',
    accentColor: '#a855f7',
    tutorials: [
      {
        slug: 'index',
        title: '最強大腦：5 個技巧讓 AI 回答品質翻倍',
        description: '90% 的人用 AI 的方式都錯了，掌握這些技巧立刻看到差異',
        difficulty: '入門',
        readTime: '10 分鐘',
        tags: ['提示詞', 'AI 技巧', 'Prompt Engineering'],
        content: `
## 最強大腦：5 個技巧讓 AI 回答品質翻倍

大多數人用 AI 就像用搜尋引擎——輸入幾個關鍵字，等待答案。但 AI 不是搜尋引擎，它是一個可以扮演任何角色的超級夥伴。學會這 5 個技巧，你的 AI 使用體驗會完全不同。

---

### 技巧一：角色設定（最重要）

**❌ 普通做法：**
> 幫我寫一篇關於咖啡的文章

**✅ 最強做法：**
> 你是一位在義大利米蘭工作了 15 年的咖啡師，同時也是知名的美食作家。請以你的專業視角，寫一篇關於手沖咖啡的文章，讓台灣的上班族理解為什麼值得花時間學手沖。文章語氣溫暖親切，約 800 字。

**為什麼有效？** 角色設定讓 AI 調用特定領域的知識和語氣，輸出品質差距非常大。

---

### 技巧二：給範例（Few-shot）

**❌ 普通做法：**
> 幫我起幾個產品名稱

**✅ 最強做法：**
> 我需要為一款有機茶飲料起產品名稱。
>
> 以下是我喜歡的命名風格（供參考，不要直接用）：
> - 「初綠」— 簡潔，有自然感
> - 「山間露」— 意境感強
> - 「一茶一世界」— 有哲學感
>
> 請幫我生成 10 個類似風格的名稱，並簡短說明每個名稱的意境。

---

### 技巧三：限制條件越具體越好

**❌ 普通做法：**
> 幫我改進這封 Email

**✅ 最強做法：**
> 請改進以下 Email，要求：
> - 語氣：專業但不失親切，避免過度正式
> - 長度：控制在 150 字以內
> - 必須保留：報價數字和交付時間
> - 需要加強：開頭要更吸引對方繼續讀
> - 結尾：一個明確的行動呼籲（CTA）
>
> [貼上原始 Email]

---

### 技巧四：要求 AI 先思考再回答

**❌ 普通做法：**
> 這個商業決策對不對？[描述情況]

**✅ 最強做法：**
> 我需要你幫我分析一個商業決策。請按以下步驟：
>
> **第一步：** 先列出這個決策的 3 個潛在優點
> **第二步：** 再列出 3 個潛在風險
> **第三步：** 告訴我還缺少哪些關鍵資訊才能做出判斷
> **最後：** 基於以上分析，給出你的建議
>
> 情況如下：[描述]

**為什麼有效？** 強迫 AI 分步驟思考，能大幅減少錯誤和遺漏。

---

### 技巧五：迭代優化，不要一次要完美

很多人期待一個指令就得到完美結果，這不現實。

**正確的工作流程：**

\`\`\`
第一輪：快速生成草稿
「幫我草擬一份企劃書大綱，5 分鐘能看完的版本」

第二輪：針對問題深化
「第三點說得不夠具體，補充 3 個實際案例」

第三輪：調整語氣格式
「整體語氣改得更有說服力，開頭換一個更強的 hook」

第四輪：最終潤色
「檢查有沒有邏輯矛盾或語病，輸出最終版本」
\`\`\`

---

### 萬用提示詞模板

把這個模板存起來，遇到任何任務都能套用：

\`\`\`
你是[具體角色]，有[經驗/專長]。

任務：[具體要做什麼]

目標讀者/使用場景：[誰會用到這個輸出]

格式要求：
- 長度：[字數或段落數]
- 語氣：[正式/親切/活潑/嚴肅]
- 結構：[列點/段落/表格/其他]

限制條件：
- 必須包含：[不可遺漏的元素]
- 避免：[不想要的內容或風格]

範例參考（可選）：
[如果有範例可以貼在這裡]
\`\`\`
`,
      },
    ],
  },
  {
    id: 'obsidian-picgo',
    name: 'Obsidian + PicGo',
    icon: '✍️',
    description: '打造個人 AI 寫作系統，從靈感到發布一條龍',
    gradient: 'from-violet-400 to-indigo-500',
    accentColor: '#7c3aed',
    tutorials: [
      {
        slug: 'ai-writing-system',
        title: '打造 AI 寫作系統：Obsidian + PicGo + Claude',
        description: '建立高效的個人知識管理與內容發布工作流，AI 全程輔助',
        difficulty: '進階',
        readTime: '30 分鐘',
        tags: ['Obsidian', 'PicGo', '知識管理', '寫作系統'],
        content: `
## 打造 AI 寫作系統：Obsidian + PicGo + Claude

這套系統能將文章生產效率提升 3-5 倍，從靈感捕捉到多平台發布一條龍。

### 系統架構

\`\`\`
靈感捕捉 (手機 Obsidian)
    ↓
知識整理 (桌面 Obsidian + AI 輔助)
    ↓
圖片處理 (PicGo 自動上傳 CDN)
    ↓
AI 寫作加速 (Claude MCP)
    ↓
一鍵多平台發布
(部落格 / 小紅書 / Medium / 公眾號)
\`\`\`

---

### 第一步：安裝 Obsidian

1. 從 [obsidian.md](https://obsidian.md) 下載安裝
2. 建立第一個 Vault（知識庫），路徑建議：\`~/Documents/MyKnowledge\`
3. 安裝以下社群插件（設定 → 第三方插件 → 搜尋安裝）：

| 插件名稱 | 用途 |
|----------|------|
| Templater | 快速套用文章模板 |
| Dataview | 智能查詢筆記資料庫 |
| Image Auto Upload | 截貼自動上傳圖床 |
| Advanced Tables | 輕鬆編輯 Markdown 表格 |

---

### 第二步：設定 PicGo 圖床

**安裝 PicGo：**

\`\`\`bash
# macOS
brew install picgo --cask

# 或直接下載：https://molunerfinn.com/PicGo/
\`\`\`

**推薦圖床選擇：**

| 圖床 | 優點 | 缺點 |
|------|------|------|
| GitHub + jsDelivr | 免費，速度快 | 上傳需網路穩定 |
| 阿里雲 OSS | 穩定，國內快 | 需付費 |
| Cloudflare R2 | 免費 10GB | 需要信用卡驗證 |
| Imgur | 超簡單 | 部分地區不穩 |

**GitHub 圖床設定（推薦新手）：**

1. 建立一個 GitHub 倉庫（名稱如 \`my-images\`）
2. 生成 Personal Access Token（Repo 權限）
3. 在 PicGo 填入倉庫名、Token、分支與自訂 CDN 網域

---

### 第三步：整合 Obsidian + PicGo

1. 在 Obsidian 安裝「Image Auto Upload Plugin」
2. 插件設定中指定 PicGo 接口：\`http://127.0.0.1:36677/upload\`
3. 開啟 PicGo Server 功能

設定完成後，**截圖直接貼入 Obsidian 就會自動上傳到圖床**，不需要手動操作。

---

### 第四步：Claude MCP 寫作加速

設定 Filesystem MCP，讓 Claude 能讀取你的知識庫：

\`\`\`json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem",
               "/Users/你的用戶名/Documents/MyKnowledge"]
    }
  }
}
\`\`\`

**實際使用範例：**

> 我的知識庫在 /Documents/MyKnowledge
> 找到所有關於「行銷策略」的筆記，幫我整理成一篇 1500 字的文章
> 語氣要適合在 LinkedIn 發布，目標讀者是中階行銷主管

---

### 文章生產工作流

\`\`\`markdown
## 每篇文章的標準流程（約 2 小時完成）

**Day 1（30 分鐘）：**
- [ ] 在手機捕捉靈感和素材
- [ ] 貼到 Obsidian Inbox 資料夾

**Day 2（30 分鐘）：**
- [ ] Claude 幫我整理素材，生成文章大綱
- [ ] 確認方向，補充關鍵觀點

**Day 3（60 分鐘）：**
- [ ] Claude 根據大綱生成初稿
- [ ] 人工修改（加入個人經驗和觀點）
- [ ] 截圖製作配圖（PicGo 自動上傳）
- [ ] 一鍵發布到各平台
\`\`\`
`,
      },
    ],
  },
  {
    id: 'file-management',
    name: 'AI 檔案管理',
    icon: '📂',
    description: '讓 AI 整理你的電腦，告別混亂下載資料夾',
    gradient: 'from-rose-400 to-orange-500',
    accentColor: '#f43f5e',
    tutorials: [
      {
        slug: 'ai-file-assistant',
        title: 'AI 檔案助手：電腦檔案管理全自動化',
        description: '設定一次，永久受益。AI 自動整理、重新命名、歸檔你的所有檔案',
        difficulty: '進階',
        readTime: '20 分鐘',
        tags: ['檔案管理', '自動化', '效率工具'],
        content: `
## AI 檔案助手：電腦檔案管理全自動化

### 你是否有這些痛點？

- 下載資料夾有 500+ 個檔案，不知道從哪開始整理
- 截圖命名像 \`截圖 2024-01-15 下午3.47.22.png\`，完全找不到
- 同一份文件存了 3 個版本，不知道哪個最新
- 重複檔案佔了幾 GB 空間

**這些問題，AI 都能在 10 分鐘內幫你解決。**

---

### 設定 Filesystem MCP

讓 Claude 取得讀寫你指定資料夾的能力：

\`\`\`json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/你的用戶名/Downloads",
        "/Users/你的用戶名/Desktop",
        "/Users/你的用戶名/Documents"
      ]
    }
  }
}
\`\`\`

> ⚠️ **安全提醒：** 只授權你願意讓 AI 存取的資料夾，不要把整個根目錄加進去

---

### 任務一：清理下載資料夾

直接複製以下指令給 Claude：

> 請幫我整理 /Downloads 資料夾，按照以下規則：
>
> 1. **圖片** (.jpg, .png, .gif, .webp) → 移到 /Downloads/圖片/
> 2. **文件** (.pdf, .docx, .xlsx, .pptx) → 移到 /Downloads/文件/
> 3. **壓縮檔** (.zip, .rar, .7z) → 移到 /Downloads/壓縮檔/
> 4. **安裝檔** (.dmg, .pkg, .exe, .msi) → 移到 /Downloads/安裝程式/
> 5. **程式碼** (.py, .js, .ts, .html) → 移到 /Downloads/程式碼/
> 6. **30 天內未開啟的檔案** → 移到 /Downloads/_待確認刪除/
>
> 操作前先列出計畫讓我確認，再執行。

---

### 任務二：智能重新命名截圖

> 請掃描 /Desktop 資料夾，找出所有截圖檔案（以「截圖」或「Screenshot」開頭）
>
> 打開每張截圖，根據圖片內容重新命名，格式為：
> YYYY-MM-DD_[內容描述].png
>
> 例如：
> - 截圖含有 Line 對話 → 2024-01-15_Line對話-工作群組.png
> - 截圖含有網頁 → 2024-01-15_網頁-Apple官網首頁.png
> - 截圖含有 Excel → 2024-01-15_Excel-2024年Q1報表.png
>
> 先列出前 10 個重新命名計畫讓我確認，再全部執行。

---

### 任務三：找出重複檔案

> 請掃描 /Documents 資料夾（包含所有子資料夾），找出：
>
> 1. **完全相同的檔案**（MD5 值相同）
> 2. **疑似相同的文件**（名稱相似，大小差不多）
>
> 對於每組重複，告訴我：
> - 檔案路徑
> - 建立時間
> - 最後修改時間
> - 建議保留哪個版本（保留較新的）
>
> 列出報告後等我確認，再刪除舊版本。

---

### 建立自動化規則（進階）

設定好後，每週讓 AI 自動執行一次維護：

\`\`\`markdown
每週五下午 5 點，請對我的電腦執行以下維護：

1. 清理 Downloads 超過 30 天的安裝檔
2. 將 Desktop 上的文件移到對應的 Documents 子資料夾
3. 清空系統垃圾桶
4. 生成一份「本週新增檔案」的摘要報告

完成後回報：釋放了多少空間、移動了幾個檔案
\`\`\`

---

### 最佳實踐

- **每次操作前**：請 Claude 先列出計畫，確認後再執行
- **重要資料**：操作前先備份，或確認有 Time Machine 等備份機制
- **逐步開放**：先從 Downloads 開始，確認效果後再開放 Documents
`,
      },
    ],
  },
];

export function getCategoryById(id: string): Category | undefined {
  return categories.find(c => c.id === id);
}

export function getTutorialBySlug(categoryId: string, slug: string): Tutorial | undefined {
  const category = getCategoryById(categoryId);
  return category?.tutorials.find(t => t.slug === slug);
}
