// 靜態示意新聞資料(Phase 1)。Phase 2 改由 Supabase 撈取。
export type Category = {
  id: string;
  name: string;
  char: string; // 分類章上的單一漢字
};

export type Article = {
  slug: string;
  title: string;
  summary: string;
  category: string; // Category id
  author: string;
  publishedAt: string; // ISO 字串
  readMins: number;
  featured?: boolean;
};

export const categories: Category[] = [
  { id: 'headline', name: '要聞', char: '要' },
  { id: 'world', name: '國際', char: '國' },
  { id: 'tech', name: '科技', char: '科' },
  { id: 'finance', name: '財經', char: '財' },
  { id: 'culture', name: '文化', char: '文' },
  { id: 'sports', name: '體育', char: '體' },
];

export const articles: Article[] = [
  {
    slug: 'offshore-wind-phase4',
    title: '離岸風電第四期競標結果出爐 三大團隊獲配總量逾二點四吉瓦',
    summary:
      '經濟部今日公布離岸風電區塊開發第四期競標結果,三組開發團隊合計獲配二點四吉瓦,預計二〇三一年前分批併網。本期首度納入浮動式風機示範條款,被視為深水區開發的前哨戰。',
    category: 'headline',
    author: '林子衡',
    publishedAt: '2026-06-11T08:10:00+08:00',
    readMins: 6,
    featured: true,
  },
  {
    slug: 'ai-act-asia-response',
    title: '歐盟AI法案全面生效 亞洲供應鏈急尋合規路徑',
    summary:
      '歐盟人工智慧法案高風險條款本月全面生效,出口歐洲的亞洲硬體與軟體業者面臨文件審查與透明度義務,顧問業者估計合規成本平均增加一成五。',
    category: 'world',
    author: '張薇',
    publishedAt: '2026-06-11T07:40:00+08:00',
    readMins: 5,
  },
  {
    slug: 'quantum-error-correction',
    title: '本土團隊量子糾錯實驗突破 邏輯量子位元壽命刷新亞洲紀錄',
    summary:
      '中研院與兩所大學合組的研究團隊,以表面碼架構將邏輯量子位元的相干時間推進至毫秒等級,論文已獲國際期刊接受,為容錯量子運算再添實證。',
    category: 'tech',
    author: '吳啟銘',
    publishedAt: '2026-06-11T06:55:00+08:00',
    readMins: 7,
  },
  {
    slug: 'central-bank-rate-hold',
    title: '央行理監事會議按兵不動 利率連四凍但下修通膨預估',
    summary:
      '央行今日召開第二季理監事會議,政策利率維持不變,並將全年消費者物價指數年增率預估自百分之一點九下修至一點七,市場解讀為偏鴿訊號。',
    category: 'finance',
    author: '陳映竹',
    publishedAt: '2026-06-11T16:30:00+08:00',
    readMins: 4,
  },
  {
    slug: 'palace-museum-digital-archive',
    title: '故宮開放十萬件文物高解析圖檔 採CC授權供自由運用',
    summary:
      '故宮博物院宣布第三波開放資料計畫,新增十萬件書畫與器物的高解析影像,全數採創用CC姓名標示授權,教育與商業利用皆毋須另行申請。',
    category: 'culture',
    author: '許文蔚',
    publishedAt: '2026-06-10T21:15:00+08:00',
    readMins: 5,
  },
  {
    slug: 'baseball-cpbl-attendance',
    title: '中職上半季觀眾破百萬創新高 新球場效應帶動周邊經濟',
    summary:
      '中華職棒上半季例行賽累計進場人數突破一百萬人次,寫下開打以來最快紀錄,聯盟歸功於新啟用的兩座球場與假日親子票策略。',
    category: 'sports',
    author: '蔡承翰',
    publishedAt: '2026-06-10T22:40:00+08:00',
    readMins: 3,
  },
  {
    slug: 'semiconductor-advanced-packaging',
    title: '先進封裝產能供不應求 設備商交期再度拉長至十四個月',
    summary:
      '受高效能運算晶片需求推升,CoWoS與面板級封裝產能持續吃緊,多家設備供應商證實交期已從十個月延長至十四個月,擴產競賽延燒至二〇二七年。',
    category: 'tech',
    author: '吳啟銘',
    publishedAt: '2026-06-10T19:20:00+08:00',
    readMins: 6,
  },
  {
    slug: 'un-ocean-treaty-ratification',
    title: '公海條約批准國跨過六十門檻 明年正式生效劃設保護區',
    summary:
      '聯合國公海生物多樣性條約獲第六十國批准,將於明年一月生效,首批公海保護區提案聚焦南太平洋與印度洋海脊,漁業大國態度成為觀察重點。',
    category: 'world',
    author: '張薇',
    publishedAt: '2026-06-10T18:05:00+08:00',
    readMins: 5,
  },
  {
    slug: 'esg-disclosure-smes',
    title: '永續揭露新制擴及中型企業 金管會給予兩年緩衝期',
    summary:
      '金管會公布永續資訊揭露第三階段時程,資本額二十億元以上上市櫃公司自後年起適用,並提供簡化版指標與兩年緩衝,以降低中型企業負擔。',
    category: 'finance',
    author: '陳映竹',
    publishedAt: '2026-06-10T15:50:00+08:00',
    readMins: 4,
  },
  {
    slug: 'indie-publishing-renaissance',
    title: '獨立書店辦展熱潮不退 小誌文化十年從邊緣走向主流',
    summary:
      '從地方書店的手工小誌展到國際書展的獨立出版專區,小誌創作者十年間成長逾三倍,出版界觀察,讀者對「慢內容」的需求正在回流。',
    category: 'culture',
    author: '許文蔚',
    publishedAt: '2026-06-10T11:30:00+08:00',
    readMins: 6,
  },
  {
    slug: 'marathon-heat-policy',
    title: '路跑賽事高溫應變新規上路 主辦單位須設置降溫站與熔斷機制',
    summary:
      '體育署公布大型路跑賽事高溫應變指引,要求賽事於濕球溫度超標時啟動熔斷,並依參賽人數比例設置降溫站,新規自下半年賽季起適用。',
    category: 'sports',
    author: '蔡承翰',
    publishedAt: '2026-06-10T09:10:00+08:00',
    readMins: 3,
  },
];

export function getCategory(id: string): Category | undefined {
  return categories.find(c => c.id === id);
}
