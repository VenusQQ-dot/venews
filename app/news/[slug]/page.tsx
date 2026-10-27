import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import RichContent from '../../components/RichContent';
import { getCategory } from '../../data/news';
import { fetchPublishedArticle } from '../../../lib/articles';

// 與首頁一致:發布或修改後最慢一分鐘內更新
export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

function formatFullTime(iso: string) {
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Taipei',
  }).format(new Date(iso));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchPublishedArticle(slug);
  if (!article) return { title: '找不到文章 — VeNews 鳴新聞' };
  return { title: `${article.title} — VeNews 鳴新聞`, description: article.summary };
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await fetchPublishedArticle(slug);
  if (!article) notFound();

  const cat = getCategory(article.category);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--ink-faint)]">
        <Link href="/" className="transition-colors hover:text-[var(--seal)]">首頁</Link>
        <span>/</span>
        <span>{cat?.name ?? article.category}</span>
      </nav>

      <header className="mb-8 border-b border-[var(--hairline)] pb-6">
        <h1 className="font-serif-tc mb-4 text-2xl font-black leading-snug text-[var(--ink)] sm:text-3xl">
          {article.title}
        </h1>
        <p className="text-xs text-[var(--ink-faint)]">
          記者 {article.author} · <time dateTime={article.publishedAt}>{formatFullTime(article.publishedAt)}</time>
          {' '}· 閱讀約 {article.readMins} 分鐘
        </p>
      </header>

      {article.content ? (
        <RichContent className="prose-dark leading-relaxed" content={article.content} />
      ) : (
        <p className="leading-relaxed text-[var(--ink-soft)]">{article.summary}</p>
      )}
    </div>
  );
}
