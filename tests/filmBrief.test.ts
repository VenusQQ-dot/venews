import { describe, expect, it } from 'vitest';
import { articles } from '../app/data/news';
import { buildFilmBrief, estimateSeconds, STYLE_BY_CATEGORY } from '../lib/filmBrief';

const base = articles[0];

describe('estimateSeconds', () => {
  it('限制在 30–90 秒', () => {
    expect(estimateSeconds(1)).toBe(30);
    expect(estimateSeconds(6)).toBe(60);
    expect(estimateSeconds(20)).toBe(90);
  });
});

describe('buildFilmBrief', () => {
  it('依分類挑風格', () => {
    const brief = buildFilmBrief({ ...base, category: 'finance' });
    expect(brief.style.slug).toBe('dataviz');
    expect(brief.prompt).toContain('Data Storytelling');
  });

  it('未知分類退回新聞包裝風格', () => {
    expect(buildFilmBrief({ ...base, category: 'unknown' }).style.slug).toBe('news-package');
  });

  it('指定 style 與片長會覆蓋預設', () => {
    const brief = buildFilmBrief(base, { style: 'watercolor', seconds: 45 });
    expect(brief.style.name).toBe('Watercolor Brush');
    expect(brief.seconds).toBe(45);
    expect(brief.prompt).toMatch(/^Make a 45-second film/);
  });

  it('prompt 帶入標題、摘要與來源', () => {
    const { prompt } = buildFilmBrief(base);
    expect(prompt).toContain(base.title);
    expect(prompt).toContain(base.summary);
    expect(prompt).toContain(base.publishedAt.slice(0, 10));
  });

  it('每個靜態分類都有對應風格', () => {
    for (const a of articles) expect(STYLE_BY_CATEGORY[a.category]).toBeDefined();
  });
});
