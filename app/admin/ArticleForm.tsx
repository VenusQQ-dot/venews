import Link from 'next/link';
import { categories } from '../data/news';
import { DbArticle } from '../../lib/articles';

const inputCls =
  'rounded-lg border border-[var(--hairline)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--seal)]';
const labelCls = 'flex flex-col gap-1.5 text-sm text-[var(--ink-soft)]';

export default function ArticleForm({
  action,
  article,
  error,
}: {
  action: (formData: FormData) => void;
  article?: DbArticle;
  error?: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-5">
      {error && (
        <p className="rounded-lg border border-[var(--seal)] px-4 py-3 text-sm text-[var(--seal)]">
          儲存失敗:{decodeURIComponent(error)}
        </p>
      )}

      <label className={labelCls}>
        標題 *
        <input name="title" required defaultValue={article?.title} className={inputCls} />
      </label>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className={labelCls}>
          分類
          <select name="category" defaultValue={article?.category ?? 'headline'} className={inputCls}>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className={labelCls}>
          記者/作者
          <input name="author" defaultValue={article?.author} className={inputCls} />
        </label>
      </div>

      <label className={labelCls}>
        摘要(顯示在卡片上,建議 60–100 字)
        <textarea name="summary" rows={3} defaultValue={article?.summary} className={inputCls} />
      </label>

      <label className={labelCls}>
        內文(Markdown,文章頁於後續階段加入)
        <textarea name="content" rows={12} defaultValue={article?.content} className={inputCls} />
      </label>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        <label className={labelCls}>
          閱讀分鐘
          <input
            type="number"
            name="read_mins"
            min={1}
            max={120}
            defaultValue={article?.read_mins ?? 3}
            className={inputCls}
          />
        </label>
        <label className={labelCls}>
          網址代稱(留空自動產生)
          <input name="slug" defaultValue={article?.slug} className={inputCls} />
        </label>
        <label className={labelCls}>
          狀態
          <select name="status" defaultValue={article?.status ?? 'draft'} className={inputCls}>
            <option value="draft">草稿</option>
            <option value="published">發布</option>
          </select>
        </label>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-[var(--ink-soft)]">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={article?.featured}
            className="h-4 w-4 accent-[var(--seal)]"
          />
          設為頭條
        </label>
      </div>

      <div className="flex items-center gap-3 border-t border-[var(--hairline)] pt-5">
        <button
          type="submit"
          className="rounded-lg bg-[var(--seal)] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          儲存
        </button>
        <Link href="/admin" className="text-sm text-[var(--ink-faint)] hover:text-[var(--ink)]">
          取消
        </Link>
      </div>
    </form>
  );
}
