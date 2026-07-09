import { runNewsroom, newsroomConfigured } from './newsroom';
import { adminConfigured, getSupabaseAdmin } from './supabase';

export type IngestSummary = {
  scouted: number;
  written: number;
  passed: number;
  rejected: number;
  inserted_as_draft: number;
  notes: string[];
};

/**
 * 跑一次自動編輯部,並把通過查證的文章以「草稿」寫入 Supabase。
 * 供 /api/ingest(Cron)與後台手動按鈕共用。
 */
export async function ingestNews(max = 5): Promise<IngestSummary> {
  if (!newsroomConfigured()) throw new Error('尚未設定 ANTHROPIC_API_KEY');
  if (!adminConfigured()) throw new Error('尚未設定 Supabase');

  const result = await runNewsroom(max);
  const supabase = getSupabaseAdmin();
  let inserted = 0;

  for (const d of result.drafts) {
    const slug = `ai-${Date.now()}-${inserted}`;
    const content = `${d.content}\n\n---\n來源:${d.source_url}`;
    const { error } = await supabase.from('articles').insert({
      slug,
      title: d.title,
      summary: d.summary,
      content,
      category: d.category,
      author: d.author,
      read_mins: d.read_mins,
      status: 'draft',
    });
    if (!error) inserted++;
    else result.notes.push(`寫入失敗「${d.title}」:${error.message}`);
  }

  return {
    scouted: result.scouted,
    written: result.written,
    passed: result.published,
    rejected: result.rejected,
    inserted_as_draft: inserted,
    notes: result.notes,
  };
}
