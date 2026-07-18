'use client';

import { useState } from 'react';
import { Article, Category } from '../data/news';

function formatTime(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat('zh-TW', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Taipei',
  }).format(d);
}

export default function NewsFeed({
  articles,
  categories,
}: {
  articles: Article[];
  categories: Category[];
}) {
  const [active, setActive] = useState<string>('all');

  const shown =
    active === 'all' ? articles : articles.filter(a => a.category === active);

  const catOf = (id: string) => categories.find(c => c.id === id);

  return (
    <section id="news" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* 段落題與分類標籤 */}
      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-4">
        <h2 className="font-serif-tc text-xl font-bold tracking-wider text-[var(--ink)]">
          今日新聞
        </h2>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="新聞分類">
          <button
            type="button"
            role="tab"
            aria-selected={active === 'all'}
            onClick={() => setActive('all')}
            className={`rounded-full border px-3.5 py-1 text-sm transition-colors ${
              active === 'all'
                ? 'border-[var(--seal)] bg-[var(--seal)] text-white'
                : 'border-[var(--hairline)] text-[var(--ink-soft)] hover:border-[var(--hairline-strong)] hover:text-[var(--ink)]'
            }`}
          >
            全部
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={active === cat.id}
              onClick={() => setActive(cat.id)}
              className={`rounded-full border px-3.5 py-1 text-sm transition-colors ${
                active === cat.id
                  ? 'border-[var(--seal)] bg-[var(--seal)] text-white'
                  : 'border-[var(--hairline)] text-[var(--ink-soft)] hover:border-[var(--hairline-strong)] hover:text-[var(--ink)]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 卡片列表 */}
      {shown.length === 0 ? (
        <p className="py-16 text-center text-sm text-[var(--ink-faint)]">
          這個分類目前沒有新聞,先看看其他分類。
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {shown.map(article => {
            const cat = catOf(article.category);
            return (
              <li key={article.slug}>
                <article className="card-hover flex h-full flex-col rounded-xl border border-[var(--hairline)] bg-[var(--card)] p-5 hover:border-[var(--hairline-strong)] hover:bg-[var(--card-hover)]">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="seal font-serif-tc h-6 w-6 text-xs font-bold" aria-hidden>
                        {cat?.char}
                      </span>
                      <span className="text-xs tracking-widest text-[var(--ink-faint)]">
                        {cat?.name}
                      </span>
                    </span>
                    <time
                      dateTime={article.publishedAt}
                      className="text-xs tabular-nums text-[var(--ink-faint)]"
                    >
                      {formatTime(article.publishedAt)}
                    </time>
                  </div>

                  <h3 className="font-serif-tc mb-2 text-lg font-bold leading-snug text-[var(--ink)]">
                    {article.title}
                  </h3>
                  <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-[var(--ink-soft)]">
                    {article.summary}
                  </p>

                  <p className="mt-auto border-t border-[var(--hairline)] pt-3 text-xs text-[var(--ink-faint)]">
                    記者 {article.author} · 閱讀約 {article.readMins} 分鐘
                  </p>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
