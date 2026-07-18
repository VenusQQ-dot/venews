import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { adminConfigured, getSupabaseAdmin } from '../../../lib/supabase';
import { clearFailures, isLocked, recordFailure } from '../../../lib/loginThrottle';

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
  // 未授權嘗試套用與登入相同的節流,防止 token 暴力猜測
  const clientKey =
    'publish:' + (req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown');
  if (isLocked(clientKey)) {
    return NextResponse.json({ error: '嘗試次數過多,請稍後再試' }, { status: 429 });
  }
  if (!authorized(req)) {
    recordFailure(clientKey);
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }
  clearFailures(clientKey);

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

  // Slug:只允許小寫英數與連字號,格式不符則自動產生
  const slugPattern = /^[a-z0-9][a-z0-9-]{0,98}[a-z0-9]$/;
  const slug =
    body.slug && typeof body.slug === 'string' && slugPattern.test(body.slug)
      ? body.slug
      : `routine-${Date.now()}`;

  // read_mins 夾在 DB check constraint 範圍內(1-120),避免超界變 500
  const readMins = Math.min(120, Math.max(1, Number(body.read_mins) || 3));

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('articles').insert({
      slug,
      title: body.title.trim(),
      summary: body.summary || '',
      content: body.content || '',
      category,
      author: body.author || '',
      read_mins: readMins,
      status,
      published_at: status === 'published' ? new Date().toISOString() : null,
    });

    if (error) {
      // 不把資料庫錯誤原文回給呼叫端(可能洩漏 schema);細節記在伺服器日誌
      console.error('[publish] insert failed:', error.message);
      const isConflict = error.code === '23505';
      return NextResponse.json(
        { error: isConflict ? 'slug 已存在' : '寫入失敗' },
        { status: isConflict ? 409 : 500 },
      );
    }

    // 若是發佈狀態,更新首頁
    if (status === 'published') {
      revalidatePath('/');
    }

    return NextResponse.json({ ok: true, slug, status });
  } catch (e) {
    console.error('[publish] unexpected error:', e);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}
