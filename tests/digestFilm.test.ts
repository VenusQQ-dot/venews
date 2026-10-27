import { describe, expect, it } from 'vitest';
import { buildDigestFilmPrompt, digestFilmHtml, pickFilmItems } from '../scripts/digestFilm.mjs';

const item = (source: string, title: string) => ({
  source,
  title,
  link: `https://example.com/${encodeURIComponent(title)}`,
  date: '2026-10-27T00:00:00Z',
  snippet: `${title} 摘要`,
});

describe('pickFilmItems', () => {
  it('每個來源只取第一則,最多 5 則', () => {
    const items = [
      item('A', 'a1'), item('A', 'a2'), item('B', 'b1'), item('C', 'c1'),
      item('D', 'd1'), item('E', 'e1'), item('F', 'f1'),
    ];
    expect(pickFilmItems(items).map((i: { title: string }) => i.title)).toEqual(['a1', 'b1', 'c1', 'd1', 'e1']);
  });

  it('略過沒有標題的項目', () => {
    expect(pickFilmItems([item('A', ''), item('B', 'b1')])).toHaveLength(1);
  });
});

describe('buildDigestFilmPrompt', () => {
  it('帶入風格、日期、素材與來源連結', () => {
    const prompt = buildDigestFilmPrompt([item('OpenAI News', '新模型發布')], '2026/10/27');
    expect(prompt).toMatch(/^Make a 60-second film/);
    expect(prompt).toContain('`news-package`');
    expect(prompt).toContain('2026/10/27');
    expect(prompt).toContain('[OpenAI News] 新模型發布');
    expect(prompt).toContain('https://example.com/');
  });

  it('沒有素材時回傳空字串', () => {
    expect(buildDigestFilmPrompt([], '2026/10/27')).toBe('');
    expect(digestFilmHtml([], '2026/10/27')).toBe('');
  });
});

describe('digestFilmHtml', () => {
  it('跳脫 HTML,避免新聞標題破壞信件版面', () => {
    const html = digestFilmHtml([item('X', '<script>alert(1)</script>')], '2026/10/27');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});
