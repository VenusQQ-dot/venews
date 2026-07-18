import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import FlowingBackground from "./components/FlowingBackground";

export const metadata: Metadata = {
  title: "VeNews 鳴新聞 — 今日要聞、科技、財經、文化",
  description: "VeNews 鳴新聞:精選每日要聞、國際、科技、財經、文化與體育新聞。",
  keywords: "新聞, 要聞, 國際, 科技, 財經, 文化, 體育",
};

// 進頁面前先套用主題,避免深色模式閃白
const themeInitScript = `
(function () {
  try {
    var saved = localStorage.getItem('venews-theme');
    var dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&family=Noto+Serif+TC:wght@600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        <FlowingBackground />
        <Header />
        <main className="relative z-10">{children}</main>
        <footer className="relative z-10 mt-20 border-t border-[var(--hairline)]">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <span className="seal font-serif-tc h-8 w-8 text-base font-bold" aria-hidden>
                  聞
                </span>
                <div>
                  <p className="font-serif-tc font-bold text-[var(--ink)]">VeNews 鳴新聞</p>
                  <p className="text-xs text-[var(--ink-faint)]">每日要聞,值得慢讀。</p>
                </div>
              </div>
              <p className="text-xs text-[var(--ink-faint)]">
                © 2026 VeNews · 本站新聞內容為展示用示意稿
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
