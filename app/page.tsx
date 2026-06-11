import NewsFeed from './components/NewsFeed';
import { categories, getCategory } from './data/news';
import { fetchPublishedArticles } from '../lib/articles';

// 發布新文章後,首頁最慢一分鐘內更新
export const revalidate = 60;

function formatFullTime(iso: string) {
  return new Intl.DateTimeFormat('zh-TW', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Taipei',
  }).format(new Date(iso));
}

export default async function HomePage() {
  const articles = await fetchPublishedArticles();
  const featured = articles.find(a => a.featured) ?? articles[0];

  if (!featured) {
    return (
      <p className="mx-auto max-w-6xl px-4 py-24 text-center text-sm text-[var(--ink-faint)]">
        目前還沒有已發布的新聞,到 /admin 發布第一篇吧。
      </p>
    );
  }

  const rest = articles.filter(a => a.slug !== featured.slug);
  const featuredCat = getCategory(featured.category);

  return (
    <div>
      {/* 頭條 */}
      <section className="border-b border-[var(--hairline)]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="flex gap-6 sm:gap-10">
            {/* 直排「本日頭條」 */}
            <div className="hidden shrink-0 sm:block" aria-hidden>
              <span className="vertical-rl font-serif-tc select-none border-r border-[var(--hairline)] pr-5 text-sm font-bold text-[var(--seal)]">
                本日頭條
              </span>
            </div>

            <article className="min-w-0">
              <p className="mb-4 flex items-center gap-3 text-xs tracking-widest text-[var(--ink-faint)]">
                <span className="font-bold text-[var(--seal)] sm:hidden">頭條</span>
                <span>{featuredCat?.name}</span>
                <span aria-hidden>·</span>
                <time dateTime={featured.publishedAt} className="tabular-nums">
                  {formatFullTime(featured.publishedAt)}
                </time>
              </p>

              <h1 className="font-serif-tc mb-5 max-w-3xl text-3xl font-black leading-tight text-[var(--ink)] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.25]">
                {featured.title}
              </h1>

              <p className="mb-6 max-w-2xl text-base leading-relaxed text-[var(--ink-soft)]">
                {featured.summary}
              </p>

              <p className="text-xs text-[var(--ink-faint)]">
                記者 {featured.author} · 閱讀約 {featured.readMins} 分鐘
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* 今日新聞列表(分類標籤 + 卡片) */}
      <NewsFeed articles={rest} categories={categories} />
    </div>
  );
}
