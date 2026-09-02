-- 台股盤後籌碼情報 Agent schema
-- 在 Supabase SQL Editor 整份貼上執行一次(可與 schema.sql 分開跑)。
--
-- stock_snapshots:每個交易日、每檔股票的盤後快照(價、量、三大法人籌碼)。
--   演算法(近 20 日高低、連續買超)靠這張表逐日累積出歷史,故需連跑數週才有完整訊號。
-- stock_briefs:每日跑完 agent 後的結構化情報(候選清單 JSON + 解讀全文),當作「情報庫」。

create table if not exists public.stock_snapshots (
  trade_date date not null,
  code text not null,
  name text not null default '',
  market text not null default 'TWSE',          -- TWSE(上市)/ TPEX(上櫃)
  close numeric,                                -- 收盤價
  high numeric,                                 -- 當日最高
  low numeric,                                  -- 當日最低
  change numeric,                               -- 漲跌
  volume bigint,                                -- 成交股數
  foreign_net bigint default 0,                 -- 外資買賣超(股)
  trust_net bigint default 0,                   -- 投信買賣超(股)
  dealer_net bigint default 0,                  -- 自營商買賣超(股)
  insti_net bigint default 0,                   -- 三大法人合計買賣超(股)
  rev_yoy numeric,                              -- 最新月營收年增率(%)
  rev_mom numeric,                              -- 最新月營收月增率(%)
  created_at timestamptz not null default now(),
  primary key (trade_date, code)
);

-- 讀某檔近 N 日歷史(演算法用),與讀某日全市場(ETL 用)
create index if not exists stock_snapshots_code_date_idx
  on public.stock_snapshots (code, trade_date desc);

create table if not exists public.stock_briefs (
  id bigint generated always as identity primary key,
  trade_date date not null unique,
  candidates jsonb not null default '[]'::jsonb, -- 選股結果(含分數與訊號旗標)
  brief_md text not null default '',             -- Claude 解讀全文(markdown)
  scanned integer not null default 0,            -- 當日掃描檔數
  matched integer not null default 0,            -- 通過籌碼篩選檔數
  notes jsonb not null default '[]'::jsonb,       -- 執行過程備註/診斷
  created_at timestamptz not null default now()
);

create index if not exists stock_briefs_date_idx
  on public.stock_briefs (trade_date desc);

-- RLS:兩張表都僅供後台 service role 讀寫(不對匿名前台開放)。
-- 前台若要顯示情報,是透過 agent 另外寫入 articles(finance 分類草稿),沿用既有前台。
alter table public.stock_snapshots enable row level security;
alter table public.stock_briefs enable row level security;
-- 不建立 anon 讀取政策 = 匿名一律讀不到(RLS 預設拒絕);service role 繞過 RLS。
