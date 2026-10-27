import { Article } from '../app/data/news';

/**
 * 把一則新聞轉成 Lemo-Opuscar(github.com/lemomo-ai/lemo-opuscar)的製片需求。
 * 產出的 prompt 直接貼進已安裝 lemo-opuscar plugin 的 Claude Code 即可開拍;
 * 這裡只產生文字,不執行任何外部程式。
 */

export type FilmStyle = { slug: string; name: string };

// 分類 → 風格。slug 必須存在於 lemo-opuscar 的 styles/ 目錄
export const STYLE_BY_CATEGORY: Record<string, FilmStyle> = {
  headline: { slug: 'news-package', name: 'Broadcast News Package' },
  world: { slug: 'satellite-briefing', name: 'Satellite Briefing' },
  tech: { slug: 'iso-infographic', name: 'Isometric Infographic' },
  finance: { slug: 'dataviz', name: 'Data Storytelling' },
  culture: { slug: 'watercolor', name: 'Watercolor Brush' },
  sports: { slug: 'telestrator', name: 'Sports Telestrator' },
};

const FALLBACK_STYLE: FilmStyle = STYLE_BY_CATEGORY.headline;

export type FilmBriefOptions = {
  seconds?: number; // 片長,預設依閱讀時間推估
  narrator?: string; // 旁白描述
  style?: string; // 指定風格 slug,覆蓋分類預設
};

export type FilmBrief = {
  style: FilmStyle;
  seconds: number;
  prompt: string;
};

/** 閱讀時間每分鐘約 10 秒片長,限制在 30–90 秒的短片區間 */
export function estimateSeconds(readMins: number): number {
  const s = Math.round((readMins * 10) / 5) * 5;
  return Math.min(90, Math.max(30, s));
}

export function buildFilmBrief(article: Article, opts: FilmBriefOptions = {}): FilmBrief {
  const style = opts.style
    ? (Object.values(STYLE_BY_CATEGORY).find((s) => s.slug === opts.style) ?? {
        slug: opts.style,
        name: opts.style,
      })
    : (STYLE_BY_CATEGORY[article.category] ?? FALLBACK_STYLE);
  const seconds = opts.seconds ?? estimateSeconds(article.readMins);
  const narrator = opts.narrator ?? '沉穩的繁體中文女聲旁白';

  const prompt = [
    `Make a ${seconds}-second film in the **${style.name}** style (\`${style.slug}\`).`,
    '',
    `主題:${article.title}`,
    `內容摘要:${article.summary}`,
    '',
    '要求:',
    `- 旁白:${narrator},字幕使用繁體中文。`,
    '- 只使用摘要中的事實;沒有來源的數字不要出現在畫面上。',
    `- 片尾標註來源:VeNews 鳴新聞 · ${article.author} · ${article.publishedAt.slice(0, 10)}`,
    '- 先給我看分鏡(storyboard),確認後再算繪成片。',
  ].join('\n');

  return { style, seconds, prompt };
}
