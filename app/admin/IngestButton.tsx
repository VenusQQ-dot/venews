'use client';

import { useState } from 'react';
import { triggerIngest } from './actions';

export default function IngestButton() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function run() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await triggerIngest();
      setMsg({ ok: res.ok, text: res.message });
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="rounded-lg border border-[var(--hairline)] px-4 py-2 text-sm text-[var(--ink-soft)] transition-colors hover:border-[var(--seal)] hover:text-[var(--seal)] disabled:opacity-50"
        title="用 Claude 搜尋當日 AI 新聞、改寫、查證後存為草稿"
      >
        {busy ? '編輯部工作中…(約 1–3 分鐘)' : '🤖 自動抓一次 AI 新聞'}
      </button>
      {msg && (
        <p className={`max-w-md text-right text-xs ${msg.ok ? 'text-[var(--ink-soft)]' : 'text-[var(--seal)]'}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
}
