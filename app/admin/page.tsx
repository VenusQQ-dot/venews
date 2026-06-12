import Link from 'next/link';
import { getCategory } from '../data/news';
import { DbArticle } from '../../lib/articles';
import { adminConfigured, getSupabaseAdmin } from '../../lib/supabase';
import { requireAdmin } from '../../lib/requireAdmin';
import { deleteArticle, logout, setStatus } from './actions';

export const metadata = { title: '文章管理 — VeNews' };
export const dynamic = 'force-dynamic';

function fmt(iso: string | null) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('zh-TW', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Taipei',
  }).format(new Date(iso));
}

export default async function AdminPage() {
  await requireAdmin();
  if (!adminConfigured()) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <h1 className="font-serif-tc mb-4 text-2xl font-black text-[var(--ink)]">文章管理</h1>
        <div className="rounded-xl border border-[var(--hairline)] bg-[var(--card)] p-6 text-sm leading-relaxed text-[var(--ink-soft)]">
          <p className="mb-3 font-semibold text-[var(--ink)]">尚未連接 Supabase</p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>到 supabase.com 建立專案(免費方案即可)</li>
            <li>在 SQL Editor 貼上執行 repo 裡的 <code className="rounded bg-[var(--bg-secondary)] px-1.5 py-0.5 text-xs">supabase/schema.sql</code></li>
            <li>把專案的 URL 與金鑰填入環境變數(參考 <code className="rounded bg-[var(--bg-secondary)] px-1.5 py-0.5 text-xs">.env.example</code>)後重新部署</li>
          </ol>
        </div>
      </div>
    );
  }

  const { data, error } = await getSupabaseAdmin()
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });

  const articles = (data ?? []) as DbArticle[];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif-tc text-2xl font-black text-[var(--ink)]">文章管理</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/new"
            className="rounded-lg bg-[var(--seal)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            ＋ 新增文章
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-[var(--hairline)] px-4 py-2 text-sm text-[var(--ink-soft)] transition-colors hover:border-[var(--hairline-strong)] hover:text-[var(--ink)]"
            >
              登出
            </button>
          </form>
        </div>
      </div>

      {error && (
        <p className="mb-6 rounded-lg border border-[var(--seal)] px-4 py-3 text-sm text-[var(--seal)]">
          讀取失敗:{error.message}
        </p>
      )}

      {articles.length === 0 && !error ? (
        <p className="py-20 text-center text-sm text-[var(--ink-faint)]">
          還沒有任何文章,點「新增文章」寫第一篇。
        </p>
      ) : (
        <ul className="divide-y divide-[var(--hairline)] rounded-xl border border-[var(--hairline)] bg-[var(--card)]">
          {articles.map(a => {
            const cat = getCategory(a.category);
            return (
              <li key={a.id} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs ${
                    a.status === 'published'
                      ? 'bg-[var(--seal)] text-white'
                      : 'border border-[var(--hairline)] text-[var(--ink-faint)]'
                  }`}
                >
                  {a.status === 'published' ? '已發布' : '草稿'}
                </span>
                <span className="text-xs text-[var(--ink-faint)]">{cat?.name ?? a.category}</span>
                {a.featured && <span className="text-xs text-[var(--seal)]">★ 頭條</span>}

                <Link
                  href={`/admin/${a.id}`}
                  className="min-w-0 flex-1 basis-full truncate font-medium text-[var(--ink)] hover:text-[var(--seal)] sm:basis-auto"
                >
                  {a.title}
                </Link>

                <time className="text-xs tabular-nums text-[var(--ink-faint)]">
                  {fmt(a.published_at ?? a.created_at)}
                </time>

                <span className="flex items-center gap-2">
                  <form action={setStatus.bind(null, a.id, a.status === 'published' ? 'draft' : 'published')}>
                    <button
                      type="submit"
                      className="rounded-md border border-[var(--hairline)] px-2.5 py-1 text-xs text-[var(--ink-soft)] transition-colors hover:border-[var(--hairline-strong)] hover:text-[var(--ink)]"
                    >
                      {a.status === 'published' ? '下架' : '發布'}
                    </button>
                  </form>
                  <form action={deleteArticle.bind(null, a.id)}>
                    <button
                      type="submit"
                      className="rounded-md border border-[var(--hairline)] px-2.5 py-1 text-xs text-[var(--ink-faint)] transition-colors hover:border-[var(--seal)] hover:text-[var(--seal)]"
                    >
                      刪除
                    </button>
                  </form>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
