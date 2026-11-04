import type { Metadata } from 'next';
import Image from 'next/image';

// LinkedIn 資訊圖展示頁。圖檔來源：linkedin-infographic/drafts/，定稿後複製到 public/infographics/。
export const metadata: Metadata = {
  title: 'LinkedIn 資訊圖 — VeNews 鳴新聞',
  description: 'VeNews AI 新聞編輯部資訊圖，三種版型。',
  // 仍是待選草稿，先不讓搜尋引擎收錄
  robots: { index: false, follow: false },
};

type Graphic = { src: string; label: string; note: string };

const SETS: { date: string; topic: string; items: Graphic[] }[] = [
  {
    date: '2026-11-04',
    topic: 'AI 新聞編輯部：3 個 AI 編輯，每天只放行 1 篇',
    items: [
      { src: '/infographics/2026-11-04-ai-newsroom-v1.png', label: 'v1 流程版', note: '直式四步流程，最易讀' },
      { src: '/infographics/2026-11-04-ai-newsroom-v2.png', label: 'v2 報紙頭版', note: '三欄版面＋大數字' },
      { src: '/infographics/2026-11-04-ai-newsroom-v3.png', label: 'v3 規格表', note: '每列附程式碼出處' },
    ],
  },
];

export default function InfographicsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 border-b border-[var(--hairline-strong)] pb-6">
        <p className="text-xs tracking-widest text-[var(--ink-faint)]">LINKEDIN 資訊圖</p>
        <h1 className="font-serif-tc mt-2 text-3xl font-black text-[var(--ink)] sm:text-4xl">資訊圖作品</h1>
        <p className="mt-3 text-sm text-[var(--ink-soft)]">
          1080 × 1350，依 VeNews 品牌規範製作。點圖可開原尺寸（2160 × 2700）。
        </p>
      </header>

      {SETS.map(set => (
        <section key={set.date} className="mb-14">
          <h2 className="font-serif-tc text-xl font-bold text-[var(--ink)]">{set.topic}</h2>
          <p className="mt-1 text-xs text-[var(--ink-faint)]">{set.date} · 草稿，待選定</p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {set.items.map(g => (
              <figure key={g.src} className="rounded border border-[var(--hairline)] bg-[var(--card)] p-3">
                <a href={g.src} target="_blank" rel="noopener noreferrer">
                  <Image
                    src={g.src}
                    alt={`${set.topic}（${g.label}）`}
                    width={1080}
                    height={1350}
                    className="h-auto w-full"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                </a>
                <figcaption className="mt-3 flex items-baseline justify-between gap-2">
                  <span className="font-bold text-[var(--ink)]">{g.label}</span>
                  <span className="text-xs text-[var(--ink-faint)]">{g.note}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
