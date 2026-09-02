import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { ingestStockBrief } from '../../../lib/stockIngest';
import { adminConfigured } from '../../../lib/supabase';

// 會抓外部資料 + 呼叫 Claude,不可靜態化
export const dynamic = 'force-dynamic';
// Vercel Hobby 上限 60 秒;Pro 可調高到 300(資料多或開 AI 解讀時建議升 Pro)
export const maxDuration = 60;

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  // 只接受 Authorization header(Vercel Cron 會帶 Bearer <CRON_SECRET>),不接受 query string 傳密鑰
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

async function handle(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }
  if (!adminConfigured()) {
    return NextResponse.json({ error: '尚未設定 Supabase' }, { status: 503 });
  }

  // ?analyze=0 只做籌碼掃描不呼叫 Claude(省時省費);?publish=1 直接發佈(預設存草稿等人工確認)
  const analyze = req.nextUrl.searchParams.get('analyze') !== '0';
  const autoPublish = req.nextUrl.searchParams.get('publish') === '1';
  try {
    const summary = await ingestStockBrief({ analyze, autoPublish });
    if (autoPublish && summary.draftInserted) revalidatePath('/');
    return NextResponse.json({ ok: true, ...summary });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// Vercel Cron 用 GET 觸發;POST 供手動
export const GET = handle;
export const POST = handle;
