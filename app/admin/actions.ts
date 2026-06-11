'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, sessionToken, verifySessionToken } from '../../lib/adminAuth';
import { getSupabaseAdmin } from '../../lib/supabase';

async function requireAdmin() {
  const store = await cookies();
  const ok = await verifySessionToken(store.get(ADMIN_COOKIE)?.value);
  if (!ok) redirect('/admin/login');
}

export async function login(formData: FormData) {
  const password = String(formData.get('password') ?? '');
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected || password !== expected) {
    redirect('/admin/login?error=1');
  }

  const token = await sessionToken();
  const store = await cookies();
  store.set(ADMIN_COOKIE, token!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 七天
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
