import Link from 'next/link';
import { categories } from './data/tutorials';

const stats = [
  { label: '教程数量', value: '40+' },
  { label: 'MCP 工具', value: '20+' },
  { label: '实战案例', value: '15+' },
  { label: '学习者', value: '5K+' },
];

const featuredTutorials = [
  {
    icon: '🍌',
    title: 'Nano Banana MCP 配置指南',
    desc: '3分钟完成 AI 生图配置',
    href: '/nanobanana/nanobanana-mcp-setup',
    tag: '入门必读',
    tagColor: 'bg-green-500/10 text-green-400 border-green-500/20',
  },
  {
    icon: '🧠',
    title: '一个简单问法让AI回答质量翻倍',
    desc: '掌握提示词技巧，解锁AI全部潜力',
    href: '/best-minds/index',
    tag: '强烈推荐',
    tagColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  {
    icon: '🎭',
    title: 'Playwright MCP 内容分析案例',
    desc: '网页抓取、PDF分析、文件整理全自动',
    href: '/playwright-mcp/Playwright-MCP内容分析案例',
    tag: '进阶实战',
    tagColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
];

export default function HomePage() {
  const totalTutorials = categories.reduce((sum, c) => sum + c.tutorials.length, 0);

  return (
    <div className="relative">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-8"
          style={{
            background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] rounded-full opacity-6"
          style={{
            background: 'radial-gradient(circle, #059669 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            持续更新中 · {totalTutorials} 个实战教程
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="gradient-text">Agent</span>
            <span className="text-[var(--text-muted)]"> × </span>
            <span className="gradient-text">100</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-[var(--text-secondary)] mb-4 font-medium">
            小白也能学会的 AI 教程
          </p>

          <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
            通过真实案例学习 AI Agent 和 MCP 工具。
            <br className="hidden sm:block" />
            零基础也能快速上手，让 AI 真正提升你的效率。
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="#all-tutorials"
              className="btn-glow inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] hover:bg-[#6d28d9] text-white font-semibold transition-all text-sm sm:text-base"
            >
              开始学习
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/best-minds/index"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--border)] hover:border-[var(--border-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition-all text-sm sm:text-base"
            >
              🧠 AI 提问技巧
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {stats.map(stat => (
              <div
                key={stat.label}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-4"
              >
                <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xl">⭐</span>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">精选推荐</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featuredTutorials.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="card-hover group rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-hover)] p-5 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{item.icon}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${item.tagColor}`}>
                    {item.tag}
                  </span>
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[#a78bfa] transition-colors mb-1.5 text-sm sm:text-base">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)]">{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* All Tutorials */}
        <section id="all-tutorials" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-xl">📚</span>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">全部教程</h2>
            <span className="ml-auto text-sm text-[var(--text-muted)]">
              {categories.length} 个分类 · {totalTutorials} 篇教程
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map(category => (
              <div
                key={category.id}
                className="card-hover rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden transition-all hover:border-[var(--border-hover)]"
              >
                {/* Category header */}
                <div className={`bg-gradient-to-r ${category.gradient} p-5`}>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{category.icon}</span>
                    <div>
                      <h3 className="font-bold text-white text-lg leading-tight">{category.name}</h3>
                      <p className="text-white/70 text-xs mt-0.5">{category.description}</p>
                    </div>
                  </div>
                </div>

                {/* Tutorials list */}
                <div className="p-4 space-y-2">
                  {category.tutorials.map(tutorial => (
                    <Link
                      key={tutorial.slug}
                      href={`/${category.id}/${tutorial.slug}`}
                      className="group flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--bg-secondary)] transition-all"
                    >
                      <span className="text-[var(--text-muted)] mt-0.5 flex-shrink-0 text-sm">→</span>
                      <div className="min-w-0">
                        <div className="font-medium text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors truncate">
                          {tutorial.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded border ${
                              tutorial.difficulty === '入门'
                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                : tutorial.difficulty === '进阶'
                                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}
                          >
                            {tutorial.difficulty}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)]">
                            ⏱ {tutorial.readTime}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}

                  <Link
                    href={`/${category.id}`}
                    className="flex items-center justify-center gap-1 w-full py-2 mt-2 rounded-lg border border-dashed border-[var(--border)] text-xs text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all"
                  >
                    查看全部 {category.name} 教程
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div
            className="rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(37,99,235,0.15) 100%)',
              border: '1px solid rgba(124,58,237,0.25)',
            }}
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.4) 0%, transparent 70%)',
              }}
            />
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 gradient-text">
                开始你的 AI 之旅
              </h2>
              <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
                从第一个 MCP 配置开始，一步步解锁 AI 的无限可能
              </p>
              <Link
                href="/nanobanana/nanobanana-mcp-setup"
                className="btn-glow inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[var(--accent)] hover:bg-[#6d28d9] text-white font-semibold transition-all"
              >
                从这里开始 →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
