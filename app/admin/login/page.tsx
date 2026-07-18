import { login } from '../actions';

export const metadata = { title: '後台登入 — VeNews' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const passwordConfigured = Boolean(process.env.ADMIN_PASSWORD);

  return (
    <div className="mx-auto flex max-w-sm flex-col px-4 py-24">
      <div className="mb-8 flex items-center gap-3">
        <span className="seal font-serif-tc h-10 w-10 text-xl font-bold" aria-hidden>
          聞
        </span>
        <h1 className="font-serif-tc text-2xl font-black text-[var(--ink)]">後台登入</h1>
      </div>

      {!passwordConfigured ? (
        <div className="rounded-xl border border-[var(--hairline)] bg-[var(--card)] p-5 text-sm leading-relaxed text-[var(--ink-soft)]">
          尚未設定後台密碼。請在環境變數加入
          <code className="mx-1 rounded bg-[var(--bg-secondary)] px-1.5 py-0.5 text-xs">ADMIN_PASSWORD</code>
          後重新部署(本機則寫入 <code className="mx-1 rounded bg-[var(--bg-secondary)] px-1.5 py-0.5 text-xs">.env.local</code>)。
        </div>
      ) : (
        <form action={login} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm text-[var(--ink-soft)]">
            管理密碼
            <input
              type="password"
              name="password"
              required
              autoFocus
              className="rounded-lg border border-[var(--hairline)] bg-[var(--card)] px-3 py-2 text-[var(--ink)] outline-none focus:border-[var(--seal)]"
            />
          </label>
          {error === 'locked' ? (
            <p className="text-sm text-[var(--seal)]">嘗試次數過多,請五分鐘後再試。</p>
          ) : error ? (
            <p className="text-sm text-[var(--seal)]">密碼錯誤,請再試一次。</p>
          ) : null}
          <button
            type="submit"
            className="rounded-lg bg-[var(--seal)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            登入
          </button>
        </form>
      )}
    </div>
  );
}
