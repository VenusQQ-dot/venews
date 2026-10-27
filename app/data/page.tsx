import type { Metadata } from 'next';
import VegaChart from '../components/VegaChart';
import { categories } from './news';
import { fetchPublishedArticles } from '../../lib/articles';
import { buildDashboardSpec, toDashboardRows } from '../../lib/dashboardSpec';

export const revalidate = 60;

export const metadata: Metadata = {
  title: '數據看板 — VeNews 鳴新聞',
  description: '以互動圖表檢視 VeNews 已發布新聞的時間分布與分類統計。',
};

export default async function DataPage() {
  const articles = await fetchPublishedArticles();
  const rows = toDashboardRows(articles, categories);
  const spec = buildDashboardSpec(rows, categories.map(c => c.name));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="font-serif-tc mb-2 text-2xl font-black text-[var(--ink)]">數據看板</h1>
        <p className="text-sm text-[var(--ink-soft)]">
          母體:目前已發布的 {rows.length} 篇新聞(最多取最新 60 篇)。圖表以 Vega-Lite 繪製,
          與 Python Altair 同一套規格,可從右上角選單下載 PNG / SVG。
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="py-16 text-center text-sm text-[var(--ink-faint)]">尚無已發布新聞,無法產生圖表。</p>
      ) : (
        // vconcat 圖表寬度固定,窄螢幕改為水平捲動,避免擠壓變形
        <div className="overflow-x-auto rounded-xl border border-[var(--hairline)] bg-[var(--card)] p-4">
          <VegaChart spec={spec} />
        </div>
      )}
    </div>
  );
}
