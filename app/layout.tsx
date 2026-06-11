import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "Agent × 100 - 小白也能学会的 AI 教程",
  description: "从零开始学习 AI Agent 和 MCP 工具，通过真实案例掌握人工智能应用开发",
  keywords: "AI教程, MCP, Agent, Claude, 人工智能, 小白教程",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen relative">
        <Header />
        <main className="relative z-10">
          {children}
        </main>
        <footer className="relative z-10 border-t border-[var(--border)] mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🤖</span>
                  <span className="font-bold text-lg gradient-text">Agent × 100</span>
                </div>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                  小白也能学会的 AI 教程。通过真实案例，零基础掌握 AI Agent 和 MCP 工具。
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text-secondary)] mb-4 text-sm uppercase tracking-wider">
                  热门教程
                </h3>
                <ul className="space-y-2 text-sm">
                  {[
                    { href: '/nanobanana/nanobanana-mcp-setup', label: 'Nano Banana MCP 配置' },
                    { href: '/didimcp/MCP配置指南', label: '滴滴 MCP 接入教程' },
                    { href: '/playwright-mcp/playwright-mcp-config', label: 'Playwright MCP 入门' },
                    { href: '/best-minds/index', label: 'AI 提问技巧' },
                  ].map(link => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text-secondary)] mb-4 text-sm uppercase tracking-wider">
                  关于
                </h3>
                <ul className="space-y-2 text-sm">
                  {[
                    { label: '关于本站', href: '#' },
                    { label: '贡献指南', href: '#' },
                    { label: '问题反馈', href: '#' },
                  ].map(link => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="border-t border-[var(--border)] mt-8 pt-8 text-center">
              <p className="text-[var(--text-muted)] text-sm">
                © 2025 Agent × 100 · 用 AI 的方式学习 AI
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
