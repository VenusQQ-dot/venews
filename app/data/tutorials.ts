export interface Tutorial {
  slug: string;
  title: string;
  description: string;
  difficulty: '入门' | '进阶' | '高级';
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
    description: 'AI生图工具配置与实战教程',
    gradient: 'from-yellow-400 to-orange-500',
    accentColor: '#f59e0b',
    tutorials: [
      {
        slug: 'nanobanana-mcp-setup',
        title: 'Nano Banana MCP 配置指南',
        description: '3分钟完成AI生图配置，从安装到出图全流程手把手教学',
        difficulty: '入门',
        readTime: '5 分钟',
        tags: ['MCP', 'AI绘图', '快速入门'],
        content: `
## Nano Banana MCP 配置指南

### 前置准备

在开始之前，请确保你已经：
- 安装了 Claude Desktop 或其他支持 MCP 的客户端
- 注册了 Nano Banana 账号

### 第一步：安装 Nano Banana MCP

打开终端，运行以下命令：

\`\`\`bash
npm install -g @nanobanana/mcp-server
\`\`\`

### 第二步：配置 MCP 服务器

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

### 第三步：测试生图

配置完成后，在 Claude 中输入：

> 帮我生成一张赛博朋克风格的城市夜景图

恭喜！3分钟内你已经配置好了 AI 生图能力 🎉
        `,
      },
      {
        slug: 'xiaohongshu-cover-tutorial',
        title: '小红书爆款封面制作教程',
        description: '点击率提升200%的秘密，用AI打造吸睛封面图片',
        difficulty: '进阶',
        readTime: '10 分钟',
        tags: ['小红书', 'AI绘图', '内容创作'],
        content: `
## 小红书爆款封面制作教程

### 为什么封面很重要？

小红书的算法中，封面点击率占权重约 40%。一张好的封面能让你的笔记曝光量提升 200%。

### 爆款封面的3个关键要素

1. **强烈的色彩对比** - 使用高饱和度颜色
2. **清晰的文字信息** - 字体大，信息明确
3. **人物或产品特写** - 增加真实感

### 使用 AI 生成封面

通过 Nano Banana MCP，输入以下提示词：

\`\`\`
生成一张小红书风格的封面图：
- 主色调：粉色+白色
- 文字：「显瘦穿搭秘诀」
- 风格：清新简约
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
    description: '滴滴出行 Agent 集成与实战案例',
    gradient: 'from-orange-400 to-red-500',
    accentColor: '#f97316',
    tutorials: [
      {
        slug: 'MCP配置指南',
        title: '滴滴 MCP 配置指南',
        description: '手把手教你接入滴滴MCP，完成出行场景AI集成配置',
        difficulty: '入门',
        readTime: '8 分钟',
        tags: ['滴滴', 'MCP', '出行'],
        content: `
## 滴滴 MCP 配置指南

### 什么是滴滴 MCP？

滴滴 MCP 让 AI 助手能够直接调用滴滴出行的 API，实现：
- 自动查询附近车辆
- 一键叫车
- 行程规划

### 获取 API 密钥

1. 访问滴滴开放平台
2. 创建应用并获取 AppKey 和 AppSecret

### 配置 MCP 服务器

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
        slug: 'Agent实战教程',
        title: '滴滴 Agent 老人打车案例实战',
        description: '为老年人设计的AI打车助手，大字体简单操作，无障碍出行体验',
        difficulty: '进阶',
        readTime: '15 分钟',
        tags: ['Agent', '无障碍', '案例实战'],
        content: `
## 滴滴 Agent 老人打车案例实战

### 需求背景

帮助老年用户通过简单的语音或文字描述完成打车，无需学习复杂的 APP 操作。

### 设计思路

1. **简化输入** - 用户只需说"我要去医院"
2. **智能识别** - AI 自动识别常用目的地
3. **确认流程** - 大字体展示行程信息
4. **一键叫车** - 确认后自动完成叫车

### 实现代码

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

    # 3. 选择最优车型
    best_vehicle = select_best_vehicle(vehicles)

    # 4. 确认并叫车
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
    description: '用 AI 控制浏览器，自动化网页操作',
    gradient: 'from-blue-400 to-cyan-500',
    accentColor: '#3b82f6',
    tutorials: [
      {
        slug: 'chrome-devtools-mcp-配置指南',
        title: 'Chrome DevTools MCP 配置指南',
        description: '配置 Chrome DevTools MCP，让 AI 助手获得控制浏览器的能力',
        difficulty: '入门',
        readTime: '8 分钟',
        tags: ['Chrome', 'DevTools', '浏览器自动化'],
        content: `
## Chrome DevTools MCP 配置指南

### 安装 Chrome DevTools MCP

\`\`\`bash
npm install -g @chrome-devtools/mcp-server
\`\`\`

### 启动调试模式

用调试模式启动 Chrome：

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
    description: '网页抓取、PDF分析、文件整理全自动化',
    gradient: 'from-green-400 to-teal-500',
    accentColor: '#10b981',
    tutorials: [
      {
        slug: 'playwright-mcp-config',
        title: 'Playwright MCP 安装配置',
        description: '快速安装配置 Playwright MCP，开启网页自动化之旅',
        difficulty: '入门',
        readTime: '6 分钟',
        tags: ['Playwright', '自动化', '安装配置'],
        content: `
## Playwright MCP 安装配置

### 安装依赖

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

### 验证安装

在 Claude 中测试：
> 打开 https://example.com 并截图
        `,
      },
      {
        slug: 'Playwright-MCP内容分析案例',
        title: 'Playwright MCP 内容分析案例',
        description: '网页抓取、PDF分析、文件整理实战，解锁 AI 自动化超能力',
        difficulty: '进阶',
        readTime: '20 分钟',
        tags: ['网页抓取', 'PDF分析', '文件整理'],
        content: `
## Playwright MCP 内容分析案例

### 案例1：网页内容抓取

自动抓取并整理网页内容：

\`\`\`
任务：抓取并整理 Hacker News 今日头条

步骤：
1. 打开 https://news.ycombinator.com
2. 提取所有文章标题、链接和评论数
3. 按热度排序
4. 输出为 Markdown 格式
\`\`\`

### 案例2：PDF 批量分析

\`\`\`
任务：分析本地 PDF 文件夹中的所有合同

步骤：
1. 扫描指定文件夹
2. 打开每个 PDF
3. 提取关键条款
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
    description: '企业钉钉接入 AI 机器人，打造智能工作助手',
    gradient: 'from-indigo-400 to-purple-500',
    accentColor: '#6366f1',
    tutorials: [
      {
        slug: 'index',
        title: '钉钉接入 Moltbot 机器人教程',
        description: '8步配置完成，让 AI 进驻你的企业钉钉群，自动回复、智能处理工作任务',
        difficulty: '入门',
        readTime: '12 分钟',
        tags: ['钉钉', '企业微信', 'AI机器人'],
        content: `
## 钉钉接入 Moltbot 机器人教程

### 第一步：创建钉钉应用

1. 登录[钉钉开放平台](https://open.dingtalk.com)
2. 创建企业内部应用
3. 获取 AppKey 和 AppSecret

### 第二步：配置机器人

1. 在应用中启用"机器人"功能
2. 设置机器人名称为"AI助手"
3. 配置消息接收地址

### 第三步：部署 Moltbot

\`\`\`bash
git clone https://github.com/moltbot/dingtalk-bot
cd dingtalk-bot
npm install
\`\`\`

配置环境变量：
\`\`\`env
DINGTALK_APP_KEY=你的AppKey
DINGTALK_APP_SECRET=你的AppSecret
CLAUDE_API_KEY=你的Claude密钥
\`\`\`

启动服务：
\`\`\`bash
npm start
\`\`\`

### 剩余步骤4-8

完成注册验证、设置权限、测试消息、发布上线等流程。
        `,
      },
    ],
  },
  {
    id: 'best-minds',
    name: '最强大脑',
    icon: '🧠',
    description: 'AI 提问技巧，让回答质量翻倍',
    gradient: 'from-purple-400 to-pink-500',
    accentColor: '#a855f7',
    tutorials: [
      {
        slug: 'index',
        title: '最强大脑：一个简单问法让AI回答质量翻倍',
        description: '掌握这个技巧，普通问题秒变高质量回答，让AI真正理解你的需求',
        difficulty: '入门',
        readTime: '7 分钟',
        tags: ['提示词', 'AI技巧', 'Prompt'],
        content: `
## 最强大脑：一个简单问法让AI回答质量翻倍

### 普通问法 vs 最强问法

**普通问法：**
> 帮我写一篇文章

**最强问法：**
> 你是一位专业的科技媒体编辑，有10年写作经验。请帮我写一篇关于"大模型如何改变普通人工作"的文章，目标读者是职场新人，字数1500字，要求：
> 1. 用真实案例说明
> 2. 语言通俗易懂
> 3. 结尾给出3个行动建议

### 为什么效果差这么多？

这个问法包含了5个关键要素：
1. **角色设定** - 告诉AI它是谁
2. **具体任务** - 明确要做什么
3. **目标受众** - 为谁写
4. **格式要求** - 怎么写
5. **评判标准** - 写到什么程度

### 万能模板

\`\`\`
你是[角色]，有[经验/专长]。
请帮我[具体任务]，
目标是[目标受众/使用场景]，
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
    description: 'AI 辅助写作系统，图文一键同步',
    gradient: 'from-violet-400 to-indigo-500',
    accentColor: '#7c3aed',
    tutorials: [
      {
        slug: 'ai-writing-system',
        title: 'Obsidian + PicGo 完整 AI 写作系统',
        description: '搭建高效的个人知识管理与写作发布系统，AI自动处理图片上传',
        difficulty: '进阶',
        readTime: '25 分钟',
        tags: ['Obsidian', 'PicGo', '知识管理'],
        content: `
## Obsidian + PicGo 完整 AI 写作系统

### 系统架构

\`\`\`
本地写作 (Obsidian)
    ↓
图片自动上传 (PicGo)
    ↓
CDN图床存储
    ↓
一键发布 (多平台)
\`\`\`

### 安装 Obsidian

从 [obsidian.md](https://obsidian.md) 下载安装。

### 配置 PicGo

1. 下载 PicGo
2. 配置图床（推荐阿里云 OSS 或 Github）
3. 在 Obsidian 中安装 Image Auto Upload 插件

### AI 写作加速

在 Obsidian 中集成 Claude MCP：
- 自动生成文章大纲
- 智能补全内容
- 一键优化表达
        `,
      },
    ],
  },
  {
    id: 'file-management',
    name: 'AI 文件管理',
    icon: '📂',
    description: '智能文件整理，告别混乱桌面',
    gradient: 'from-rose-400 to-orange-500',
    accentColor: '#f43f5e',
    tutorials: [
      {
        slug: 'ai-file-assistant',
        title: 'AI 文件助手：电脑文件管理自动化',
        description: '用AI自动整理下载文件夹、重命名文件、分类归档，彻底解放双手',
        difficulty: '进阶',
        readTime: '18 分钟',
        tags: ['文件管理', '自动化', '效率工具'],
        content: `
## AI 文件助手：电脑文件管理自动化

### 你是否有这些烦恼？

- 下载文件夹堆满了几百个文件
- 截图文件名乱七八糟
- 找不到上周保存的那个文档

### 解决方案

通过 AI + 文件系统 MCP，实现：

1. **自动分类** - 按类型、日期、项目自动归档
2. **智能重命名** - 根据文件内容生成有意义的名称
3. **重复文件检测** - 找出并删除重复文件

### 配置文件系统 MCP

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
