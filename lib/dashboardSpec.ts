// /data 頁的互動圖表規格。寫法對應 Python Altair:
//   brush = alt.selection_interval(encodings=['x'])
//   pick  = alt.selection_point(fields=['分類'])
//   (points.add_params(brush) & bars.add_params(pick).transform_filter(brush))
// 上圖拖曳框選時間區間 → 下圖只統計框選範圍;點下圖分類 → 上圖高亮該分類。

import type { Article, Category } from '../app/data/news';
import type { VegaLiteSpec } from './vegaSpec';

export type DashboardRow = {
  標題: string;
  分類: string;
  發布時間: string;
  閱讀分鐘: number;
};

// 轉成「台北牆上時間」且不帶時區的字串,瀏覽器會當作本地時間解析,
// 讓任何時區的讀者看到的都是台北發布時間
function toTaipeiWallClock(iso: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? '00';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`;
}

export function toDashboardRows(articles: Article[], categories: Category[]): DashboardRow[] {
  const nameOf = (id: string) => categories.find(c => c.id === id)?.name ?? id;
  return articles.map(a => ({
    標題: a.title,
    分類: nameOf(a.category),
    發布時間: toTaipeiWallClock(a.publishedAt),
    閱讀分鐘: a.readMins,
  }));
}

export function buildDashboardSpec(rows: DashboardRow[], categoryOrder: string[]): VegaLiteSpec {
  const color = {
    field: '分類',
    type: 'nominal',
    scale: { domain: categoryOrder },
    legend: { orient: 'top', title: null },
  };

  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: '已發布新聞的時間分布與分類統計,可框選時間區間、點選分類互動篩選',
    data: { values: rows },
    params: [
      { name: 'brush', select: { type: 'interval', encodings: ['x'] }, views: ['timeline'] },
      { name: 'pick', select: { type: 'point', fields: ['分類'] }, bind: 'legend', views: ['bars'] },
    ],
    vconcat: [
      {
        name: 'timeline',
        title: { text: '發布時間 × 閱讀長度', subtitle: '拖曳框選時間區間,下方統計會跟著更新' },
        width: 560,
        height: 220,
        mark: { type: 'circle', size: 110, opacity: 0.85 },
        encoding: {
          x: { field: '發布時間', type: 'temporal', title: null, axis: { format: '%m/%d %H時', labelOverlap: true } },
          y: { field: '閱讀分鐘', type: 'quantitative', title: '閱讀分鐘' },
          color: { condition: { param: 'pick', ...color }, value: '#c9c6bf' },
          tooltip: [
            { field: '標題' },
            { field: '分類' },
            { field: '發布時間', type: 'temporal', format: '%m/%d %H:%M' },
            { field: '閱讀分鐘' },
          ],
        },
      },
      {
        name: 'bars',
        title: { text: '各分類篇數', subtitle: '點選長條(或圖例)高亮上方對應新聞' },
        width: 560,
        height: 180,
        transform: [{ filter: { param: 'brush' } }],
        mark: { type: 'bar', cornerRadiusEnd: 3 },
        encoding: {
          y: { field: '分類', type: 'nominal', sort: categoryOrder, title: null },
          x: { aggregate: 'count', type: 'quantitative', title: '篇數', axis: { tickMinStep: 1, format: 'd' } },
          color: { ...color, legend: null },
          opacity: { condition: { param: 'pick', value: 1 }, value: 0.35 },
          tooltip: [{ field: '分類' }, { aggregate: 'count', type: 'quantitative', title: '篇數' }],
        },
      },
    ],
  };
}
