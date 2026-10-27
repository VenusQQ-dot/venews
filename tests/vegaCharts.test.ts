import { describe, expect, it } from 'vitest';
import { MAX_SPEC_BYTES, parseVegaLiteSpec } from '../lib/vegaSpec';
import { splitContent } from '../lib/markdown';
import { buildDashboardSpec, toDashboardRows } from '../lib/dashboardSpec';
import { articles, categories } from '../app/data/news';

const bar = JSON.stringify({
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  data: { values: [{ a: 'A', b: 1 }] },
  mark: 'bar',
  encoding: { x: { field: 'a' }, y: { field: 'b' } },
});

describe('parseVegaLiteSpec', () => {
  it('接受 Altair to_json() 形式的規格', () => {
    const r = parseVegaLiteSpec(bar);
    expect(r.ok).toBe(true);
  });

  it('接受 vconcat 等複合圖表', () => {
    expect(parseVegaLiteSpec('{"vconcat":[{"mark":"bar"}]}').ok).toBe(true);
  });

  it('拒絕 JSON 格式錯誤', () => {
    const r = parseVegaLiteSpec('{mark: bar}');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('JSON');
  });

  it('拒絕陣列與非圖表物件', () => {
    expect(parseVegaLiteSpec('[1,2]').ok).toBe(false);
    expect(parseVegaLiteSpec('{"foo":1}').ok).toBe(false);
  });

  it('拒絕非 Vega-Lite 的 $schema(例如完整 Vega)', () => {
    const r = parseVegaLiteSpec('{"$schema":"https://vega.github.io/schema/vega/v5.json","mark":"bar"}');
    expect(r.ok).toBe(false);
  });

  it('拒絕外部網址資料,含巢狀位置', () => {
    expect(parseVegaLiteSpec('{"data":{"url":"https://evil.example/x.csv"},"mark":"bar"}').ok).toBe(false);
    expect(
      parseVegaLiteSpec('{"layer":[{"data":{"url":"//cdn.example/x.json"},"mark":"bar"},{"mark":"line","data":{"url":"HTTP://a.b/c"}}]}').ok
    ).toBe(false);
  });

  it('允許站內相對路徑與 data: URI', () => {
    expect(parseVegaLiteSpec('{"data":{"url":"/data/x.json"},"mark":"bar"}').ok).toBe(true);
    expect(parseVegaLiteSpec('{"data":{"url":"data:text/csv,a%0A1"},"mark":"bar"}').ok).toBe(true);
  });

  it('拒絕超過大小上限', () => {
    const big = JSON.stringify({ mark: 'bar', data: { values: [{ s: 'x'.repeat(MAX_SPEC_BYTES) }] } });
    expect(parseVegaLiteSpec(big).ok).toBe(false);
  });
});

describe('splitContent', () => {
  it('把 ```altair 區塊拆成圖表片段,前後文字保留', () => {
    const segs = splitContent(`前言\n\n\`\`\`altair\n${bar}\n\`\`\`\n結語`);
    expect(segs.map(s => s.type)).toEqual(['html', 'chart', 'html']);
    expect(segs[0].type === 'html' && segs[0].html).toContain('前言');
    expect(segs[2].type === 'html' && segs[2].html).toContain('結語');
  });

  it('```vega-lite 與 ```VegaLite(大小寫)也視為圖表', () => {
    expect(splitContent(`\`\`\`vega-lite\n${bar}\n\`\`\``)[0].type).toBe('chart');
    expect(splitContent(`\`\`\`VegaLite\n${bar}\n\`\`\``)[0].type).toBe('chart');
  });

  it('規格錯誤時回傳 chart-error 並保留原文', () => {
    const segs = splitContent('```altair\n{bad}\n```');
    expect(segs[0].type).toBe('chart-error');
    if (segs[0].type === 'chart-error') expect(segs[0].source).toBe('{bad}');
  });

  it('一般程式碼區塊照舊跳脫', () => {
    const segs = splitContent('```js\n<script>alert(1)</script>\n```');
    expect(segs[0].type === 'html' && segs[0].html).toContain('&lt;script&gt;');
  });

  it('未關閉的區塊不吞掉內容', () => {
    const segs = splitContent('文字\n```altair\n{"mark":"bar"}');
    const html = segs.map(s => (s.type === 'html' ? s.html : '')).join('');
    expect(html).toContain('{&quot;mark&quot;:&quot;bar&quot;}');
  });

  it('擋掉 javascript: 連結', () => {
    const segs = splitContent('[點我](javascript:alert(1))');
    expect(segs[0].type === 'html' && segs[0].html).toContain('href="#"');
  });
});

describe('dashboard spec', () => {
  it('每篇文章一列,分類轉中文名稱,且通過規格驗證', () => {
    const rows = toDashboardRows(articles, categories);
    expect(rows).toHaveLength(articles.length);
    expect(rows.every(r => categories.some(c => c.name === r.分類))).toBe(true);
    const spec = buildDashboardSpec(rows, categories.map(c => c.name));
    expect(parseVegaLiteSpec(JSON.stringify(spec)).ok).toBe(true);
  });

  it('示意文章內嵌的圖表可正確解析', () => {
    const withChart = articles.find(a => a.content?.includes('```altair'));
    expect(withChart).toBeDefined();
    expect(splitContent(withChart!.content!).some(s => s.type === 'chart')).toBe(true);
  });
});

describe('dashboard 時間', () => {
  it('發布時間轉為台北牆上時間,不帶時區', () => {
    const rows = toDashboardRows(
      [{ slug: 's', title: 't', summary: '', category: 'tech', author: 'a', publishedAt: '2026-06-11T08:30:00Z', readMins: 3 }],
      categories
    );
    expect(rows[0].發布時間).toBe('2026-06-11T16:30:00');
  });
});
