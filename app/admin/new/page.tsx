import ArticleForm from '../ArticleForm';
import { createArticle } from '../actions';

export const metadata = { title: '新增文章 — VeNews' };

export default async function NewArticlePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-serif-tc mb-8 text-2xl font-black text-[var(--ink)]">新增文章</h1>
      <ArticleForm action={createArticle} error={error} />
    </div>
  );
}
