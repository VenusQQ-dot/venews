// ---------------------------------------------------------------------------
// Deck content — edit text here; the renderers in slides.tsx stay untouched.
// All on-screen copy for「我與 AI 合作的圖片生成指南」. Full narration: SCRIPT.md
// ---------------------------------------------------------------------------

export type Slide =
  | {
      type: "cover";
      title: string;
      subtitle: string;
      presenter: string;
    }
  | {
      type: "agenda";
      title: string;
      items: { n: string; label: string }[];
    }
  | {
      // Big statement slide — a kicker label + a large line, optional support points.
      type: "statement";
      kicker?: string;
      title: string;
      accent?: string; // a substring of title to highlight in orange
      points?: string[];
    }
  | {
      // Title + a list of bullet points (optional lead-in bold per point).
      type: "bullets";
      kicker?: string;
      title: string;
      points: { lead?: string; text: string }[];
    }
  | {
      // Two columns compared side by side.
      type: "split";
      title: string;
      left: { label: string; tone: "orange" | "blue" | "green" | "dark"; points: string[] };
      right: { label: string; tone: "orange" | "blue" | "green" | "dark"; points: string[] };
      footer?: string;
    }
  | {
      // A grid of labelled cards (six fields, five checks, three methods…).
      type: "cards";
      kicker?: string;
      title: string;
      columns: number;
      items: { k: string; v: string }[];
    }
  | {
      // A horizontal numbered flow.
      type: "steps";
      title: string;
      steps: string[];
      note?: string;
    }
  | {
      // Closing — a few punch lines + sign-off.
      type: "closing";
      title: string;
      lines: { lead: string; text: string }[];
      signoff: string;
    };

export const SLIDES: (Slide & { dur?: number })[] = [
  {
    type: "cover",
    title: "我與 AI 合作的\n圖片生成指南",
    subtitle: "從「第一版失敗」到真正能用的工作成果",
    presenter: "慈靜",
    dur: 140,
  },
  {
    type: "agenda",
    title: "今天會分享什麼",
    items: [
      { n: "01", label: "第一版失敗：為什麼漂亮卻不能用" },
      { n: "02", label: "六欄位：把模糊需求整理成 Prompt" },
      { n: "03", label: "AI 復述：先確認理解一致" },
      { n: "04", label: "檢查與 Revision：逐步修到能用" },
      { n: "05", label: "案例與延伸：海報、流程、數據、Agent" },
    ],
    dur: 150,
  },
  {
    type: "bullets",
    kicker: "為什麼開始",
    title: "我不是為了玩生圖",
    points: [
      { text: "工作上常找不到真正符合需求的素材" },
      { text: "純文字說明，觀眾看到第三行就開始放空" },
      { text: "沒時間為每張圖重找素材、調配色、對齊風格" },
      { lead: "我要的", text: "不是「很有 AI 感」，而是能完成工作的圖" },
    ],
    dur: 130,
  },
  {
    type: "statement",
    kicker: "一開始的誤會",
    title: "我原本以為：寫清楚就會成功",
    accent: "寫清楚",
    points: [
      "以為是一條直線：需求 → Prompt → 完美成果",
      "第一版不對，還以為是 Prompt 不夠長",
      "其實我們腦中的「清楚」，對 AI 仍有很多空白",
    ],
    dur: 130,
  },
  {
    type: "bullets",
    kicker: "第一版",
    title: "問題不是美不美，而是能不能用",
    points: [
      { text: "第一眼很吸睛：AI、圖表、數據、發光效果全都有" },
      { text: "但主體太置中，左邊沒有標題空間" },
      { text: "AI 元素太亮，搶走真正焦點，像產品廣告" },
      { lead: "轉變", text: "不問「漂不漂亮」，而問「能不能被拿來用」" },
    ],
    dur: 135,
  },
  {
    type: "split",
    title: "人與 AI，各自負責什麼？",
    left: {
      label: "人負責",
      tone: "dark",
      points: ["定義目的", "判斷問題", "提出回饋", "驗證內容", "承擔結果"],
    },
    right: {
      label: "AI 負責",
      tone: "orange",
      points: ["提供版本", "嘗試變化", "快速執行", "重複修改", "整理資訊"],
    },
    footer: "AI 負責加速，人負責判斷",
    dur: 140,
  },
  {
    type: "steps",
    title: "我的 AI 協作流程",
    steps: ["六欄位需求", "AI 復述", "人確認", "AI 生成", "五項檢查", "Revision"],
    note: "上方三個方向（專業／活潑／資訊層級）是選配，方向明確時可直接跳過",
    dur: 140,
  },
  {
    type: "cards",
    kicker: "生成前",
    title: "我的生圖 Prompt 六個欄位",
    columns: 3,
    items: [
      { k: "用途", v: "圖片用在哪、給誰看" },
      { k: "主體", v: "畫面主要出現誰／什麼" },
      { k: "訊息", v: "希望觀眾看完理解什麼" },
      { k: "構圖", v: "位置、比例、文字留白" },
      { k: "風格", v: "專業穩重或活潑親切" },
      { k: "限制", v: "哪些元素不要出現" },
    ],
    dur: 150,
  },
  {
    type: "bullets",
    kicker: "組成 Prompt",
    title: "把六個欄位組成可複製模板",
    points: [
      { lead: "固定句型保留", text: "黃色中括號依每次需求替換" },
      { text: "例：企業內部教育訓練、16:9、人物放右側、左側留 40% 文字空間" },
      { text: "模板讓第一版不偏太遠，先落在能討論的範圍" },
      { lead: "提醒", text: "相同 Prompt 也不保證完全相同，它控制方向不是複製" },
    ],
    dur: 140,
  },
  {
    type: "statement",
    kicker: "生成前 30 秒",
    title: "先請 AI 復述，再開始生成",
    accent: "復述",
    points: [
      "「先不要生成，請用自己的話復述用途、主體、訊息、構圖、風格、限制」",
      "30 秒確認：我們理解的是不是同一件事",
      "現在改一句話；等生成後才發現，就要全部重來",
    ],
    dur: 135,
  },
  {
    type: "cards",
    kicker: "生成後",
    title: "我固定檢查五件事",
    columns: 5,
    items: [
      { k: "主題", v: "有沒有回答工作需求" },
      { k: "構圖", v: "能不能放進使用場景" },
      { k: "風格", v: "和同系列是否一致" },
      { k: "重點", v: "五秒能否抓到重點" },
      { k: "可靠性", v: "文字數字流程是否正確" },
    ],
    dur: 145,
  },
  {
    type: "split",
    title: "不要說「不好看」，要說哪裡有問題",
    left: {
      label: "只是感受",
      tone: "dark",
      points: ["「不好看，請重做」", "AI 不知道你指的是哪裡", "人物？顏色？構圖？風格？"],
    },
    right: {
      label: "可執行的條件",
      tone: "green",
      points: [
        "「人物太置中，左側無法放標題」",
        "「請移到右側」",
        "「左側保留約 40% 乾淨空間」",
      ],
    },
    footer: "把感受翻譯成：問題是什麼、希望怎麼調整",
    dur: 140,
  },
  {
    type: "cards",
    kicker: "合作方法",
    title: "Revision Prompt 五段骨架",
    columns: 5,
    items: [
      { k: "Keep", v: "哪些部分保留" },
      { k: "Problem", v: "目前的問題是什麼" },
      { k: "Change", v: "應該怎麼改" },
      { k: "Do not", v: "不要動到正確的地方" },
      { k: "Output", v: "比例與輸出要求" },
    ],
    dur: 145,
  },
  {
    type: "bullets",
    kicker: "案例一 · 海報",
    title: "Finance 尾牙海報：先定義資訊層級",
    points: [
      { text: "4:5 直式海報，圖片本身就是最後成果" },
      { lead: "層級", text: "活動名稱最大 → 中文標題 → 日期時間地點 → Dress Code" },
      { text: "配色暖白／深青綠／少量金；禁賭場感與多餘文字" },
      { text: "第一眼先知道是什麼活動，再快速找到時間地點" },
    ],
    dur: 140,
  },
  {
    type: "split",
    title: "尾牙海報：第一版與 Revision",
    left: {
      label: "第一版",
      tone: "dark",
      points: ["有氣氛但主標不夠明顯", "日期資訊比較擠", "裝飾元素太多"],
    },
    right: {
      label: "Revision 後",
      tone: "orange",
      points: ["放大主標、資訊集中", "裝飾減少約 40%", "不得修改活動文字資訊"],
    },
    footer: "海報不是把資料全放上去，而是決定大家先看到什麼",
    dur: 140,
  },
  {
    type: "split",
    title: "不是所有圖表都適合直接生圖",
    left: {
      label: "資訊結構圖",
      tone: "blue",
      points: ["流程 / SOP / 架構 / 權責", "AI 整理內容、提出版型", "人要確認邏輯與角色權責"],
    },
    right: {
      label: "數據圖表",
      tone: "green",
      points: ["AI 建議圖型、協助解讀", "正式數字回 Excel／PPT／BI", "最重視的是正確"],
    },
    footer: "AI 可以整理、提案、協助呈現，正式流程與數字仍需人確認",
    dur: 140,
  },
  {
    type: "steps",
    title: "案例二 · 先把報銷邏輯說清楚",
    steps: ["員工申請 + 憑證", "主管審核用途預算", "會計審核單據科目", "出納付款", "歸檔"],
    note: "退件規則：主管或會計退件，都要回到員工補件。人的第一份工作是先把邏輯寫對",
    dur: 145,
  },
  {
    type: "bullets",
    kicker: "第一次生成",
    title: "視覺完成，邏輯卻錯了",
    points: [
      { text: "視覺很完整：角色、箭頭、節點都很正式" },
      { text: "但主管會計責任混、退件路徑消失、箭頭交叉" },
      { text: "AI 還自行多加了一位財務主管，歸檔位置也錯" },
      { lead: "小心", text: "AI 會把錯誤內容包裝得非常像完成品" },
    ],
    dur: 140,
  },
  {
    type: "bullets",
    kicker: "Revision",
    title: "先修邏輯，再修視覺",
    points: [
      { text: "保留五節點與風格，但主管／會計／出納分開" },
      { text: "退件都回員工補件；不新增任何角色或步驟" },
      { text: "指定使用泳道，讓角色責任更好辨認" },
      { lead: "順序", text: "漂亮可以慢慢調，流程錯了就不能交付" },
    ],
    dur: 140,
  },
  {
    type: "bullets",
    kicker: "案例三 · 數據",
    title: "預算執行率：先決定管理問題",
    points: [
      { lead: "一句話", text: "哪些部門的執行率超過 100%？" },
      { text: "一張橫向長條 + 100% 基準線就夠了" },
      { text: "行政 82、人資 91；資訊與業務超標用警示色" },
      { text: "正式數字、公式、來源仍回可驗證的工具確認" },
    ],
    dur: 140,
  },
  {
    type: "cards",
    kicker: "能力延伸",
    title: "從一張圖到可編輯簡報的三種方式",
    columns: 3,
    items: [
      { k: "直接生成整張圖", v: "最快，但文字圖表通常不能逐項編輯" },
      { k: "AI + VBA", v: "產生程式建立可編輯 PPT，仍需人除錯校對" },
      { k: "Agentic AI", v: "讀素材、建簡報，輸出可交付的 PPTX" },
    ],
    dur: 145,
  },
  {
    type: "bullets",
    kicker: "行動建議",
    title: "今天先從一張圖開始",
    points: [
      { text: "別一開始就挑戰整份簡報" },
      { text: "先找一張真正需要的圖：海報、流程圖、財務圖" },
      { lead: "小循環", text: "六欄位 → 復述 → 生成 → 找問題 → 一次 Revision" },
      { text: "練熟後，單圖、VBA、Agent 都更好控制成果" },
    ],
    dur: 140,
  },
  {
    type: "closing",
    title: "Final Takeaway",
    lines: [
      { lead: "AI 負責生成，", text: "人負責定義" },
      { lead: "AI 負責加速，", text: "人負責判斷" },
      { lead: "Agent 完成工作流，", text: "人必須承擔結果" },
    ],
    signoff: "謝謝大家 · 慈靜",
    dur: 160,
  },
];
