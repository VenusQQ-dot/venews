-- VeNews articles schema(在 Supabase SQL Editor 整份貼上執行一次)

create table if not exists public.articles (
  id bigint generated always as identity primary key,
  slug text not null unique,
  title text not null,
  summary text not null default '',
  content text not null default '',
  category text not null default 'headline'
    check (category in ('headline', 'world', 'tech', 'finance', 'culture', 'sports')),
  author text not null default '',
  read_mins integer not null default 3 check (read_mins between 1 and 120),
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 首頁查詢固定篩選 status = 'published',用部分索引
create index if not exists articles_published_idx
  on public.articles (published_at desc)
  where status = 'published';

-- updated_at 自動更新
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

-- RLS:匿名訪客只能讀已發布文章;後台寫入走 service role(繞過 RLS)
alter table public.articles enable row level security;

drop policy if exists "Public can read published articles" on public.articles;
create policy "Public can read published articles"
  on public.articles for select
  to anon, authenticated
  using (status = 'published');

-- 種子資料:與 Phase 1 靜態首頁相同的示意新聞
insert into public.articles
  (slug, title, summary, category, author, read_mins, featured, status, published_at)
values
  ('offshore-wind-phase4', '離岸風電第四期競標結果出爐 三大團隊獲配總量逾二點四吉瓦', '經濟部今日公布離岸風電區塊開發第四期競標結果,三組開發團隊合計獲配二點四吉瓦,預計二〇三一年前分批併網。本期首度納入浮動式風機示範條款,被視為深水區開發的前哨戰。', 'headline', '林子衡', 6, true, 'published', '2026-06-11T08:10:00+08:00'),
  ('ai-act-asia-response', '歐盟AI法案全面生效 亞洲供應鏈急尋合規路徑', '歐盟人工智慧法案高風險條款本月全面生效,出口歐洲的亞洲硬體與軟體業者面臨文件審查與透明度義務,顧問業者估計合規成本平均增加一成五。', 'world', '張薇', 5, false, 'published', '2026-06-11T07:40:00+08:00'),
  ('quantum-error-correction', '本土團隊量子糾錯實驗突破 邏輯量子位元壽命刷新亞洲紀錄', '中研院與兩所大學合組的研究團隊,以表面碼架構將邏輯量子位元的相干時間推進至毫秒等級,論文已獲國際期刊接受,為容錯量子運算再添實證。', 'tech', '吳啟銘', 7, false, 'published', '2026-06-11T06:55:00+08:00'),
  ('central-bank-rate-hold', '央行理監事會議按兵不動 利率連四凍但下修通膨預估', '央行今日召開第二季理監事會議,政策利率維持不變,並將全年消費者物價指數年增率預估自百分之一點九下修至一點七,市場解讀為偏鴿訊號。', 'finance', '陳映竹', 4, false, 'published', '2026-06-11T16:30:00+08:00'),
  ('palace-museum-digital-archive', '故宮開放十萬件文物高解析圖檔 採CC授權供自由運用', '故宮博物院宣布第三波開放資料計畫,新增十萬件書畫與器物的高解析影像,全數採創用CC姓名標示授權,教育與商業利用皆毋須另行申請。', 'culture', '許文蔚', 5, false, 'published', '2026-06-10T21:15:00+08:00'),
  ('baseball-cpbl-attendance', '中職上半季觀眾破百萬創新高 新球場效應帶動周邊經濟', '中華職棒上半季例行賽累計進場人數突破一百萬人次,寫下開打以來最快紀錄,聯盟歸功於新啟用的兩座球場與假日親子票策略。', 'sports', '蔡承翰', 3, false, 'published', '2026-06-10T22:40:00+08:00'),
  ('semiconductor-advanced-packaging', '先進封裝產能供不應求 設備商交期再度拉長至十四個月', '受高效能運算晶片需求推升,CoWoS與面板級封裝產能持續吃緊,多家設備供應商證實交期已從十個月延長至十四個月,擴產競賽延燒至二〇二七年。', 'tech', '吳啟銘', 6, false, 'published', '2026-06-10T19:20:00+08:00'),
  ('un-ocean-treaty-ratification', '公海條約批准國跨過六十門檻 明年正式生效劃設保護區', '聯合國公海生物多樣性條約獲第六十國批准,將於明年一月生效,首批公海保護區提案聚焦南太平洋與印度洋海脊,漁業大國態度成為觀察重點。', 'world', '張薇', 5, false, 'published', '2026-06-10T18:05:00+08:00'),
  ('esg-disclosure-smes', '永續揭露新制擴及中型企業 金管會給予兩年緩衝期', '金管會公布永續資訊揭露第三階段時程,資本額二十億元以上上市櫃公司自後年起適用,並提供簡化版指標與兩年緩衝,以降低中型企業負擔。', 'finance', '陳映竹', 4, false, 'published', '2026-06-10T15:50:00+08:00'),
  ('indie-publishing-renaissance', '獨立書店辦展熱潮不退 小誌文化十年從邊緣走向主流', '從地方書店的手工小誌展到國際書展的獨立出版專區,小誌創作者十年間成長逾三倍,出版界觀察,讀者對「慢內容」的需求正在回流。', 'culture', '許文蔚', 6, false, 'published', '2026-06-10T11:30:00+08:00'),
  ('marathon-heat-policy', '路跑賽事高溫應變新規上路 主辦單位須設置降溫站與熔斷機制', '體育署公布大型路跑賽事高溫應變指引,要求賽事於濕球溫度超標時啟動熔斷,並依參賽人數比例設置降溫站,新規自下半年賽季起適用。', 'sports', '蔡承翰', 3, false, 'published', '2026-06-10T09:10:00+08:00')
on conflict (slug) do nothing;
