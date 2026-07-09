import { NextRequest, NextResponse } from 'next/server';
import { ingestNews } from '../../../lib/ingest';
import { newsroomConfigured } from '../../../lib/newsroom';
import { adminConfigured } from '../../../lib/supabase';

// 這條路由會呼叫 Claude API、跑好幾分鐘,不能靜態化
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Vercel:給流水線最多 5 分鐘

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
  try {
    const summary = await ingestNews(max);
    return NextResponse.json({ ok: true, ...summary });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// Vercel Cron 用 GET 觸發
export const GET = handle;
export const POST = handle;
