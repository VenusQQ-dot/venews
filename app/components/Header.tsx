import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

function todayLine() {
  const now = new Date();
  const date = new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    timeZone: 'Asia/Taipei',
  }).format(now);
  return date;
}

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--hairline)] bg-[var(--paper)]/90 backdrop-blur-md">
      {/* 日期列 */}
      <div className="border-b border-[var(--hairline)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5 sm:px-6 lg:px-8">
          <p className="text-xs tracking-widest text-[var(--ink-faint)]">{todayLine()}</p>
          <p className="hidden text-xs tracking-widest text-[var(--ink-faint)] sm:block">
            創刊第一年 · 每日更新
          </p>
        </div>
      </div>

      {/* 報頭 */}
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="seal font-serif-tc h-10 w-10 text-xl font-bold" aria-hidden>
            聞
          </span>
          <span className="flex flex-col">
            <span className="font-serif-tc text-2xl font-black leading-none tracking-wide text-[var(--ink)] sm:text-3xl">
              VeNews
            </span>
            <span className="mt-1 text-[11px] tracking-[0.4em] text-[var(--ink-faint)]">
              鳴 新 聞
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/#news"
            className="hidden text-sm text-[var(--ink-soft)] transition-colors hover:text-[var(--seal)] sm:block"
          >
            今日新聞
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
