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
    description: 'AI生圖工具配置与實戰教程',
    gradient: 'from-yellow-400 to-orange-500',
    accentColor: '#f59e0b',
    tutorials: [
      {
        slug: 'nanobanana-mcp-setup',
        title: 'Nano Banana MCP 配置指南',
        description: '3分钟完成AI生圖配置，從安裝到出图全流程手把手教学',
        difficulty: '入門',
        readTime: '5 分钟',
        tags: ['MCP', 'AI繪圖', '快速入門'],
        content: `
## Nano Banana MCP 配置指南

### 前置准备

在開始之前，請確保你已经：
- 安裝了 Claude Desktop 或其他支持 MCP 的客户端
- 注册了 Nano Banana 账號

### 第一步：安裝 Nano Banana MCP

打開終端，執行以下命令：

\`\`\`bash
npm install -g @nanobanana/mcp-server
\`\`\`

### 第二步：配置 MCP 服務器

在 Claude Desktop 配置文件中添加：

\`\`\`json
{
  "mcpServers": {
    "nanobanana": {
      "command": "npx",
      "args": ["@nanobanana/mcp-server"],
      "env": {
        "NANO_API_KEY": "你的API密钥"
      }
    }
  }
}
\`\`\`

### 第三步：測試生圖

配置完成后，在 Claude 中輸入：

> 帮我生成一张赛博朋克风格的城市夜景图

恭喜！3分钟内你已经配置好了 AI 生圖能力 🎉
        `,
      },
      {
        slug: 'xiaohongshu-cover-tutorial',
        title: '小红書爆款封面制作教程',
        description: '点击率提升200%的秘密，用AI打造吸睛封面圖片',
        difficulty: '進階',
        readTime: '10 分钟',
        tags: ['小红書', 'AI繪圖', '內容創作'],
        content: `
## 小红書爆款封面制作教程

### 為什么封面很重要？

小红書的算法中，封面点击率占权重约 40%。一张好的封面能讓你的笔记曝光量提升 200%。

### 爆款封面的3個關鍵要素

1. **强烈的色彩對比** - 使用高饱和度颜色
2. **清晰的文字信息** - 字体大，信息明確
3. **人物或产品特寫** - 增加真實感

### 使用 AI 生成封面

通過 Nano Banana MCP，輸入以下提示詞：

\`\`\`
生成一张小红書风格的封面图：
- 主色调：粉色+白色
- 文字：「显瘦穿搭秘诀」
- 风格：清新簡約
- 比例：3:4
\`\`\`
        `,
      },
    ],
  },
  {
    id: 'didimcp',
    name: '滴滴 MCP',
    icon: '🚖',
    description: '滴滴出行 Agent 集成与實戰案例',
    gradient: 'from-orange-400 to-red-500',
    accentColor: '#f97316',
    tutorials: [
      {
        slug: 'MCP配置指南',
        title: '滴滴 MCP 配置指南',
        description: '手把手教你接入滴滴MCP，完成出行場景AI集成配置',
        difficulty: '入門',
        readTime: '8 分钟',
        tags: ['滴滴', 'MCP', '出行'],
        content: `
## 滴滴 MCP 配置指南

### 什么是滴滴 MCP？

滴滴 MCP 讓 AI 助手能够直接调用滴滴出行的 API，實現：
- 自動查询附近车辆
- 一鍵叫车
- 行程規劃

### 獲取 API 密钥

1. 訪問滴滴開放平台
2. 建立應用并獲取 AppKey 和 AppSecret

### 配置 MCP 服務器

\`\`\`json
{
  "mcpServers": {
    "didi": {
      "command": "npx",
      "args": ["@didi/mcp-server"],
      "env": {
        "DIDI_APP_KEY": "你的AppKey",
        "DIDI_APP_SECRET": "你的AppSecret"
      }
    }
  }
}
\`\`\`
        `,
      },
      {
        slug: 'Agent實戰教程',
        title: '滴滴 Agent 老人打车案例實戰',
        description: '為老年人設計的AI打车助手，大字体簡單操作，無障碍出行体驗',
        difficulty: '進階',
        readTime: '15 分钟',
        tags: ['Agent', '無障碍', '案例實戰'],
        content: `
## 滴滴 Agent 老人打车案例實戰

### 需求背景

幫助老年用户通過簡單的語音或文字描述完成打车，無需學習复杂的 APP 操作。

### 設計思路

1. **簡化輸入** - 用户只需說"我要去医院"
2. **智能识别** - AI 自動识别常用目的地
3. **確認流程** - 大字体展示行程信息
4. **一鍵叫车** - 確認后自動完成叫车

### 實現代碼

\`\`\`python
# Agent 核心逻辑
async def book_ride_for_elderly(destination: str, user_location: str):
    # 1. 解析目的地
    resolved_dest = await resolve_location(destination)

    # 2. 查询车辆
    vehicles = await didi_mcp.search_vehicles(
        origin=user_location,
        destination=resolved_dest
    )

    # 3. 選擇最优车型
    best_vehicle = select_best_vehicle(vehicles)

    # 4. 確認并叫车
    return await didi_mcp.book_ride(best_vehicle)
\`\`\`
        `,
      },
    ],
  },
  {
    id: 'chrome-devtools-mcp',
    name: 'Chrome DevTools MCP',
    icon: '🔧',
    description: '用 AI 控制浏覽器，自動化網頁操作',
    gradient: 'from-blue-400 to-cyan-500',
    accentColor: '#3b82f6',
    tutorials: [
      {
        slug: 'chrome-devtools-mcp-配置指南',
        title: 'Chrome DevTools MCP 配置指南',
        description: '配置 Chrome DevTools MCP，讓 AI 助手獲得控制浏覽器的能力',
        difficulty: '入門',
        readTime: '8 分钟',
        tags: ['Chrome', 'DevTools', '浏覽器自動化'],
        content: `
## Chrome DevTools MCP 配置指南

### 安裝 Chrome DevTools MCP

\`\`\`bash
npm install -g @chrome-devtools/mcp-server
\`\`\`

### 启動调试模式

用调试模式启動 Chrome：

\`\`\`bash
# macOS
/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222

# Windows
chrome.exe --remote-debugging-port=9222
\`\`\`

### 配置 MCP

\`\`\`json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["@chrome-devtools/mcp-server", "--port", "9222"]
    }
  }
}
\`\`\`
        `,
      },
    ],
  },
  {
    id: 'playwright-mcp',
    name: 'Playwright MCP',
    icon: '🎭',
    description: '網頁抓取、PDF分析、文件整理全自動化',
    gradient: 'from-green-400 to-teal-500',
    accentColor: '#10b981',
    tutorials: [
      {
        slug: 'playwright-mcp-config',
        title: 'Playwright MCP 安裝配置',
        description: '快速安裝配置 Playwright MCP，開啟網頁自動化之旅',
        difficulty: '入門',
        readTime: '6 分钟',
        tags: ['Playwright', '自動化', '安裝配置'],
        content: `
## Playwright MCP 安裝配置

### 安裝依赖

\`\`\`bash
npm install -g @playwright/mcp-server
npx playwright install chromium
\`\`\`

### MCP 配置

\`\`\`json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp-server"]
    }
  }
}
\`\`\`

### 驗證安裝

在 Claude 中測試：
> 打開 https://example.com 并截图
        `,
      },
      {
        slug: 'Playwright-MCP內容分析案例',
        title: 'Playwright MCP 內容分析案例',
        description: '網頁抓取、PDF分析、文件整理實戰，解鎖 AI 自動化超能力',
        difficulty: '進階',
        readTime: '20 分钟',
        tags: ['網頁抓取', 'PDF分析', '文件整理'],
        content: `
## Playwright MCP 內容分析案例

### 案例1：網頁內容抓取

自動抓取并整理網頁內容：

\`\`\`
任務：抓取并整理 Hacker News 今日头条

步骤：
1. 打開 https://news.ycombinator.com
2. 提取所有文章標題、链接和评论數
3. 按熱度排序
4. 輸出為 Markdown 格式
\`\`\`

### 案例2：PDF 批量分析

\`\`\`
任務：分析本地 PDF 文件夹中的所有合同

步骤：
1. 扫描指定文件夹
2. 打開每個 PDF
3. 提取關鍵条款
4. 生成摘要报告
\`\`\`
        `,
      },
    ],
  },
  {
    id: 'dingtalk-clawdbot',
    name: '钉钉 + Clawdbot',
    icon: '💬',
    description: '企業钉钉接入 AI 機器人，打造智能工作助手',
    gradient: 'from-indigo-400 to-purple-500',
    accentColor: '#6366f1',
    tutorials: [
      {
        slug: 'index',
        title: '钉钉接入 Moltbot 機器人教程',
        description: '8步配置完成，讓 AI 进驻你的企業钉钉群，自動回复、智能處理工作任務',
        difficulty: '入門',
        readTime: '12 分钟',
        tags: ['钉钉', '企業微信', 'AI機器人'],
        content: `
## 钉钉接入 Moltbot 機器人教程

### 第一步：建立钉钉應用

1. 登錄[钉钉開放平台](https://open.dingtalk.com)
2. 建立企業内部應用
3. 獲取 AppKey 和 AppSecret

### 第二步：配置機器人

1. 在應用中启用"機器人"功能
2. 設置機器人名称為"AI助手"
3. 配置消息接收地址

### 第三步：部署 Moltbot

\`\`\`bash
git clone https://github.com/moltbot/dingtalk-bot
cd dingtalk-bot
npm install
\`\`\`

配置環境變數：
\`\`\`env
DINGTALK_APP_KEY=你的AppKey
DINGTALK_APP_SECRET=你的AppSecret
CLAUDE_API_KEY=你的Claude密钥
\`\`\`

启動服務：
\`\`\`bash
npm start
\`\`\`

### 剩余步骤4-8

完成注册驗證、設置权限、測試消息、發佈上线等流程。
        `,
      },
    ],
  },
  {
    id: 'best-minds',
    name: '最强大脑',
    icon: '🧠',
    description: 'AI 提問技巧，讓回答質量翻倍',
    gradient: 'from-purple-400 to-pink-500',
    accentColor: '#a855f7',
    tutorials: [
      {
        slug: 'index',
        title: '最强大脑：一個簡單問法讓AI回答質量翻倍',
        description: '掌握這個技巧，普通問題秒變高質量回答，讓AI真正理解你的需求',
        difficulty: '入門',
        readTime: '7 分钟',
        tags: ['提示詞', 'AI技巧', 'Prompt'],
        content: `
## 最强大脑：一個簡單問法讓AI回答質量翻倍

### 普通問法 vs 最强問法

**普通問法：**
> 帮我寫一篇文章

**最强問法：**
> 你是一位专業的科技媒体編輯，有10年寫作经驗。請帮我寫一篇關於"大模型如何改變普通人工作"的文章，目標讀者是职場新人，字數1500字，要求：
> 1. 用真實案例說明
> 2. 語言通俗易懂
> 3. 结尾給出3個行動建议

### 為什么效果差這么多？

這個問法包含了5個關鍵要素：
1. **角色设定** - 告诉AI它是谁
2. **具体任務** - 明確要做什么
3. **目標受众** - 為谁寫
4. **格式要求** - 怎么寫
5. **评判標准** - 寫到什么程度

### 万能模板

\`\`\`
你是[角色]，有[经驗/专長]。
請帮我[具体任務]，
目標是[目標受众/使用場景]，
要求：
1. [要求1]
2. [要求2]
3. [要求3]
\`\`\`
        `,
      },
    ],
  },
  {
    id: 'obsidian-picgo',
    name: 'Obsidian + PicGo',
    icon: '✍️',
    description: 'AI 辅助寫作系統，图文一鍵同步',
    gradient: 'from-violet-400 to-indigo-500',
    accentColor: '#7c3aed',
    tutorials: [
      {
        slug: 'ai-writing-system',
        title: 'Obsidian + PicGo 完整 AI 寫作系統',
        description: '搭建高效的個人知识管理与寫作發佈系統，AI自動處理圖片上傳',
        difficulty: '進階',
        readTime: '25 分钟',
        tags: ['Obsidian', 'PicGo', '知识管理'],
        content: `
## Obsidian + PicGo 完整 AI 寫作系統

### 系統架构

\`\`\`
本地寫作 (Obsidian)
    ↓
圖片自動上傳 (PicGo)
    ↓
CDN图床存储
    ↓
一鍵發佈 (多平台)
\`\`\`

### 安裝 Obsidian

從 [obsidian.md](https://obsidian.md) 下載安裝。

### 配置 PicGo

1. 下載 PicGo
2. 配置图床（推荐阿里云 OSS 或 Github）
3. 在 Obsidian 中安裝 Image Auto Upload 插件

### AI 寫作加速

在 Obsidian 中集成 Claude MCP：
- 自動生成文章大纲
- 智能补全內容
- 一鍵優化表达
        `,
      },
    ],
  },
  {
    id: 'file-management',
    name: 'AI 文件管理',
    icon: '📂',
    description: '智能文件整理，告別混乱桌面',
    gradient: 'from-rose-400 to-orange-500',
    accentColor: '#f43f5e',
    tutorials: [
      {
        slug: 'ai-file-assistant',
        title: 'AI 文件助手：电脑文件管理自動化',
        description: '用AI自動整理下載文件夹、重命名文件、分類归档，彻底解放双手',
        difficulty: '進階',
        readTime: '18 分钟',
        tags: ['文件管理', '自動化', '效率工具'],
        content: `
## AI 文件助手：电脑文件管理自動化

### 你是否有這些烦恼？

- 下載文件夹堆滿了几百個文件
- 截图文件名乱七八糟
- 找不到上周保存的那個文档

### 解决方案

通過 AI + 文件系統 MCP，實現：

1. **自動分類** - 按類型、日期、项目自動归档
2. **智能重命名** - 根據文件內容生成有意义的名称
3. **重复文件检測** - 找出并刪除重复文件

### 配置文件系統 MCP

\`\`\`json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/你的用户名/Downloads"]
    }
  }
}
\`\`\`
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
