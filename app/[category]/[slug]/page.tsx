import Link from 'next/link';
import { categories, getCategoryById, getTutorialBySlug } from '../../data/tutorials';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateStaticParams() {
  return categories.flatMap(c =>
    c.tutorials.map(t => ({ category: c.id, slug: t.slug }))
  );
}

function renderMarkdown(text: string) {
  if (!text) return '';
  const lines = text.trim().split('\n');
  const result: string[] = [];
  let inCode = false;
  let codeLang = '';
  let codeLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (!inCode) {
        inCode = true;
        codeLang = line.slice(3).trim();
        codeLines = [];
      } else {
        result.push(
          `<pre><code class="language-${codeLang}">${codeLines.map(l => l.replace(/</g, '&lt;').replace(/>/g, '&gt;')).join('\n')}</code></pre>`
        );
        inCode = false;
        codeLang = '';
        codeLines = [];
      }
      continue;
    }
    if (inCode) {
      codeLines.push(line);
      continue;
    }

    if (line.startsWith('### ')) {
      result.push(`<h3>${line.slice(4)}</h3>`);
    } else if (line.startsWith('## ')) {
      result.push(`<h2>${line.slice(3)}</h2>`);
    } else if (line.startsWith('# ')) {
      result.push(`<h1>${line.slice(2)}</h1>`);
    } else if (line.startsWith('> ')) {
      result.push(`<blockquote>${line.slice(2)}</blockquote>`);
    } else if (line.match(/^\d+\. /)) {
      result.push(`<li>${line.replace(/^\d+\. /, '')}</li>`);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      result.push(`<li>${line.slice(2)}</li>`);
    } else if (line.trim() === '') {
      result.push('<br/>');
    } else {
      // inline formatting
      const formatted = line
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
      result.push(`<p>${formatted}</p>`);
    }
  }

  return result.join('');
}

export default async function TutorialPage({ params }: Props) {
  const { category: categoryId, slug } = await params;
  const category = getCategoryById(categoryId);
  const tutorial = getTutorialBySlug(categoryId, slug);

  if (!category || !tutorial) notFound();

  const currentIndex = category.tutorials.findIndex(t => t.slug === slug);
  const prevTutorial = currentIndex > 0 ? category.tutorials[currentIndex - 1] : null;
  const nextTutorial = currentIndex < category.tutorials.length - 1 ? category.tutorials[currentIndex + 1] : null;

  const htmlContent = renderMarkdown(tutorial.content || '');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            {/* Back */}
            <Link
              href={`/${category.id}`}
              className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors mb-6"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回 {category.name}
            </Link>

            {/* Category nav */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
              <div className={`bg-gradient-to-r ${category.gradient} px-4 py-3`}>
                <div className="flex items-center gap-2">
                  <span>{category.icon}</span>
                  <span className="font-semibold text-white text-sm">{category.name}</span>
                </div>
              </div>
              <nav className="p-2">
                {category.tutorials.map(t => (
                  <Link
                    key={t.slug}
                    href={`/${category.id}/${t.slug}`}
                    className={`block px-3 py-2 rounded-lg text-sm transition-all ${
                      t.slug === slug
                        ? 'bg-[var(--accent)]/10 text-[#a78bfa] font-medium'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                    }`}
                  >
                    {t.title}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-6">
            <Link href="/" className="hover:text-[var(--accent)] transition-colors">首页</Link>
            <span>/</span>
            <Link href={`/${category.id}`} className="hover:text-[var(--accent)] transition-colors">
              {category.name}
            </Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)] truncate">{tutorial.title}</span>
          </nav>

          {/* Article header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span
                className={`text-xs px-2.5 py-1 rounded-full border ${
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
                  #{tag}
                </span>
              ))}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)] leading-tight mb-3">
              {tutorial.title}
            </h1>
            <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
              {tutorial.description}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--border)] mb-8" />

          {/* Content */}
          <article
            className="prose-dark"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* Navigation between tutorials */}
          <div className="mt-12 pt-8 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prevTutorial ? (
              <Link
                href={`/${category.id}/${prevTutorial.slug}`}
                className="card-hover group flex items-start gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-hover)] transition-all"
              >
                <svg className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <div>
                  <div className="text-xs text-[var(--text-muted)] mb-1">上一篇</div>
                  <div className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                    {prevTutorial.title}
                  </div>
                </div>
              </Link>
            ) : <div />}

            {nextTutorial ? (
              <Link
                href={`/${category.id}/${nextTutorial.slug}`}
                className="card-hover group flex items-start gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-hover)] transition-all text-right sm:flex-row-reverse"
              >
                <svg className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <div>
                  <div className="text-xs text-[var(--text-muted)] mb-1">下一篇</div>
                  <div className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                    {nextTutorial.title}
                  </div>
                </div>
              </Link>
            ) : <div />}
          </div>
        </div>
      </div>
    </div>
  );
}
