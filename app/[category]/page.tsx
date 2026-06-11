import Link from 'next/link';
import { categories, getCategoryById } from '../data/tutorials';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return categories.map(c => ({ category: c.id }));
}

export default async function CategoryPage({ params }: Props) {
  const { category: categoryId } = await params;
  const category = getCategoryById(categoryId);

  if (!category) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-8">
        <Link href="/" className="hover:text-[var(--accent)] transition-colors">首页</Link>
        <span>/</span>
        <span className="text-[var(--text-secondary)]">{category.name}</span>
      </nav>

      {/* Category Header */}
      <div className={`rounded-2xl bg-gradient-to-r ${category.gradient} p-8 mb-10`}>
        <div className="flex items-center gap-4">
          <span className="text-6xl">{category.icon}</span>
          <div>
            <h1 className="text-3xl font-bold text-white">{category.name}</h1>
            <p className="text-white/80 mt-1">{category.description}</p>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-white/60 text-sm">{category.tutorials.length} 篇教程</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tutorials */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text-secondary)] mb-4">全部教程</h2>
        {category.tutorials.map((tutorial, index) => (
          <Link
            key={tutorial.slug}
            href={`/${category.id}/${tutorial.slug}`}
            className="card-hover group flex items-start gap-4 p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-hover)] transition-all"
          >
            <div
              className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ background: `linear-gradient(135deg, ${category.accentColor}, ${category.accentColor}88)` }}
            >
              {String(index + 1).padStart(2, '0')}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[#a78bfa] transition-colors">
                {tutorial.title}
              </h3>
              <p className="text-sm text-[var(--text-muted)] mt-1 leading-relaxed">
                {tutorial.description}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${
                    tutorial.difficulty === '入門'
                      ? 'bg-green-500/10 text-green-400 border-green-500/20'
                      : tutorial.difficulty === '進階'
                      ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}
                >
                  {tutorial.difficulty}
                </span>
                <span className="text-xs text-[var(--text-muted)]">⏱ {tutorial.readTime}</span>
                {tutorial.tags?.map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <svg
              className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>

      {/* Back to home */}
      <div className="mt-10 pt-8 border-t border-[var(--border)]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回首頁
        </Link>
      </div>
    </div>
  );
}
