import { notFound } from 'next/navigation';
import ArticleForm from '../ArticleForm';
import { updateArticle } from '../actions';
import { DbArticle } from '../../../lib/articles';
import { adminConfigured, getSupabaseAdmin } from '../../../lib/supabase';

export const metadata = { title: '編輯文章 — VeNews' };
export const dynamic = 'force-dynamic';

export default async function EditArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const numericId = Number(id);
  if (!adminConfigured() || !Number.isInteger(numericId)) notFound();

  const { data } = await getSupabaseAdmin()
    .from('articles')
    .select('*')
    .eq('id', numericId)
    .single();

  if (!data) notFound();
  const article = data as DbArticle;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-serif-tc mb-8 text-2xl font-black text-[var(--ink)]">編輯文章</h1>
      <ArticleForm action={updateArticle.bind(null, article.id)} article={article} error={error} />
    </div>
  );
}
