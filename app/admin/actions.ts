'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { ADMIN_COOKIE, SESSION_TTL_MS, sessionToken, verifyPassword } from '../../lib/adminAuth';
import { requireAdmin } from '../../lib/requireAdmin';
import { clearFailures, isLocked, recordFailure } from '../../lib/loginThrottle';
import { getSupabaseAdmin } from '../../lib/supabase';
import { ingestNews } from '../../lib/ingest';
import { newsroomConfigured } from '../../lib/newsroom';

async function clientKey(): Promise<string> {
  const hdrs = await headers();
  return hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export async function login(formData: FormData) {
  const key = await clientKey();
  if (isLocked(key)) {
    redirect('/admin/login?error=locked');
  }

  const password = String(formData.get('password') ?? '');

  if (!(await verifyPassword(password))) {
    recordFailure(key);
    redirect(isLocked(key) ? '/admin/login?error=locked' : '/admin/login?error=1');
  }
  clearFailures(key);

  const token = await sessionToken();
  const store = await cookies();
  store.set(ADMIN_COOKIE, token!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  });
  redirect('/admin');
}

export async function logout() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect('/admin/login');
}

function articleFromForm(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  if (!title) throw new Error('標題不可為空');

  const slugInput = String(formData.get('slug') ?? '').trim();
  const slug = slugInput || `news-${Date.now()}`;
  const status = formData.get('status') === 'published' ? 'published' : 'draft';

  return {
    slug,
    title,
    summary: String(formData.get('summary') ?? '').trim(),
    content: String(formData.get('content') ?? ''),
    category: String(formData.get('category') ?? 'headline'),
    author: String(formData.get('author') ?? '').trim(),
    read_mins: Math.min(120, Math.max(1, Number(formData.get('read_mins') ?? 3) || 3)),
    featured: formData.get('featured') === 'on',
    status,
  };
}

export async function createArticle(formData: FormData) {
  await requireAdmin();
  const article = articleFromForm(formData);

  const { error } = await getSupabaseAdmin()
    .from('articles')
    .insert({
      ...article,
      published_at: article.status === 'published' ? new Date().toISOString() : null,
    });
  if (error) redirect(`/admin/new?error=${encodeURIComponent(error.message)}`);

  revalidatePath('/');
  redirect('/admin');
}

export async function updateArticle(id: number, formData: FormData) {
  await requireAdmin();
  const article = articleFromForm(formData);
  const supabase = getSupabaseAdmin();

  // 首次發布時補上發布時間
  const { data: existing } = await supabase
    .from('articles')
    .select('published_at')
    .eq('id', id)
    .single();

  const published_at =
    article.status === 'published'
      ? existing?.published_at ?? new Date().toISOString()
      : existing?.published_at ?? null;

  const { error } = await supabase
    .from('articles')
    .update({ ...article, published_at })
    .eq('id', id);
  if (error) redirect(`/admin/${id}?error=${encodeURIComponent(error.message)}`);

  revalidatePath('/');
  redirect('/admin');
}

export async function setStatus(id: number, status: 'draft' | 'published') {
  await requireAdmin();
  const supabase = getSupabaseAdmin();

  const update: Record<string, unknown> = { status };
  if (status === 'published') {
    const { data } = await supabase.from('articles').select('published_at').eq('id', id).single();
    if (!data?.published_at) update.published_at = new Date().toISOString();
  }

  await supabase.from('articles').update(update).eq('id', id);
  revalidatePath('/');
  revalidatePath('/admin');
}

export async function deleteArticle(id: number) {
  await requireAdmin();
  await getSupabaseAdmin().from('articles').delete().eq('id', id);
  revalidatePath('/');
  revalidatePath('/admin');
}

export type IngestState = { ok: boolean; message: string };

/** 後台「手動抓一次」按鈕:跑自動編輯部,產出進草稿區。 */
export async function triggerIngest(): Promise<IngestState> {
  await requireAdmin();
  if (!newsroomConfigured()) {
    return { ok: false, message: '尚未設定 ANTHROPIC_API_KEY,無法啟用自動編輯部。' };
  }
  try {
    const s = await ingestNews(4);
    revalidatePath('/admin');
    return {
      ok: true,
      message: `偵察 ${s.scouted} 則,撰稿 ${s.written} 篇,通過查證 ${s.passed} 篇,已存為草稿 ${s.inserted_as_draft} 篇${
        s.rejected ? `,退稿 ${s.rejected} 篇` : ''
      }。到下方列表確認後即可發布。`,
    };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
