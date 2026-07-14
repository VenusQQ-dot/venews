import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { adminConfigured, getSupabaseAdmin } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';

type PublishRequest = {
  title: string;
  summary?: string;
  content?: string;
  category?: string;
  author?: string;
  read_mins?: number;
  status?: 'draft' | 'published';
  slug?: string;
};

const VALID_CATEGORIES = ['headline', 'world', 'tech', 'finance', 'culture', 'sports'];

function authorized(req: NextRequest): boolean {
  const token = process.env.PUBLISH_TOKEN;
  if (!token) return false;
  const authHeader = req.headers.get('authorization');
  return authHeader === `Bearer ${token}`;
}

export async function POST(req: NextRequest) {
  // 只有 POST 才能發佈
  if (!authorized(req)) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  if (!adminConfigured()) {
    return NextResponse.json({ error: '尚未設定 Supabase' }, { status: 503 });
  }

  let body: PublishRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '無效的 JSON' }, { status: 400 });
  }

  // 必填欄位
  if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
    return NextResponse.json({ error: 'title 必填' }, { status: 400 });
  }

  // 驗證分類
  const category = body.category && VALID_CATEGORIES.includes(body.category)
    ? body.category
    : 'headline';

  // 驗證狀態:預設為 published,但可指定 draft
  const status = body.status === 'draft' ? 'draft' : 'published';

  // Slug:用傳入的或自動產生
  const slug = body.slug || `routine-${Date.now()}`;

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('articles').insert({
      slug,
      title: body.title.trim(),
      summary: body.summary || '',
      content: body.content || '',
      category,
      author: body.author || '',
      read_mins: body.read_mins || 3,
      status,
      published_at: status === 'published' ? new Date().toISOString() : null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 若是發佈狀態,更新首頁
    if (status === 'published') {
      revalidatePath('/');
    }

    return NextResponse.json({ ok: true, slug, status });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
