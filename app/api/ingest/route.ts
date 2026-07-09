import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { ingestNews } from '../../../lib/ingest';
import { newsroomConfigured } from '../../../lib/newsroom';
import { adminConfigured } from '../../../lib/supabase';

// 這條路由會呼叫 Claude API、跑好幾分鐘,不能靜態化
export const dynamic = 'force-dynamic';
// Vercel Hobby 方案上限 60 秒;Pro 方案可調高到 300。
export const maxDuration = 60;

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  // Vercel Cron 會帶 Authorization: Bearer <CRON_SECRET>
  if (req.headers.get('authorization') === `Bearer ${secret}`) return true;
  return req.nextUrl.searchParams.get('secret') === secret;
}

async function handle(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }
  if (!newsroomConfigured()) {
    return NextResponse.json({ error: '尚未設定 ANTHROPIC_API_KEY' }, { status: 503 });
  }
  if (!adminConfigured()) {
    return NextResponse.json({ error: '尚未設定 Supabase' }, { status: 503 });
  }

  const max = Math.min(8, Math.max(1, Number(req.nextUrl.searchParams.get('max')) || 5));
  // 排程觸發:自動發佈審過的最佳一篇(?draft=1 可強制只存草稿)
  const autoPublish = req.nextUrl.searchParams.get('draft') !== '1';
  try {
    const summary = await ingestNews(max, autoPublish);
    if (summary.published > 0) revalidatePath('/'); // 立即更新首頁
    return NextResponse.json({ ok: true, ...summary });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// Vercel Cron 用 GET 觸發
export const GET = handle;
export const POST = handle;
