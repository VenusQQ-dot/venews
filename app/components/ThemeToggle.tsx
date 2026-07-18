'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'venews-theme';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
    } catch {
      // 私密瀏覽模式下寫入失敗,僅影響記憶偏好
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mounted && dark ? '切換為淺色模式' : '切換為深色模式'}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--hairline)] text-[var(--ink-soft)] transition-colors hover:border-[var(--hairline-strong)] hover:text-[var(--ink)]"
    >
      {mounted && dark ? (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}
