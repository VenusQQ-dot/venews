import { runNewsroom, newsroomConfigured } from './newsroom';
import { adminConfigured, getSupabaseAdmin } from './supabase';

export type IngestSummary = {
  scouted: number;
  written: number;
  passed: number;
  rejected: number;
  published: number;
  inserted_as_draft: number;
  notes: string[];
};

/**
 * 跑一次自動編輯部,把通過查證的文章寫入 Supabase。
 *
 * autoPublishOne=true(每日排程):自動發佈「審過的最佳一篇」,其餘留草稿。
 * autoPublishOne=false(後台手動按鈕):全部存草稿,方便測試不會亂發。
 */
export async function ingestNews(max = 5, autoPublishOne = false): Promise<IngestSummary> {
  if (!newsroomConfigured()) throw new Error('尚未設定 ANTHROPIC_API_KEY');
  if (!adminConfigured()) throw new Error('尚未設定 Supabase');

  const result = await runNewsroom(max);
  const supabase = getSupabaseAdmin();
  let drafts = 0;
  let published = 0;
  let publishedOne = false;

  // result.drafts 依偵察時的重要性排序;第一篇通過的當作「今日一篇」發佈
  for (let i = 0; i < result.drafts.length; i++) {
    const d = result.drafts[i];
    const publishThis = autoPublishOne && !publishedOne;
    const slug = `ai-${Date.now()}-${i}`;
    const content = `${d.content}\n\n---\n來源:${d.source_url}`;

    const { error } = await supabase.from('articles').insert({
      slug,
      title: d.title,
      summary: d.summary,
      content,
      category: d.category,
      author: d.author,
      read_mins: d.read_mins,
      status: publishThis ? 'published' : 'draft',
      published_at: publishThis ? new Date().toISOString() : null,
    });

    if (error) {
      result.notes.push(`寫入失敗「${d.title}」:${error.message}`);
      continue;
    }
    if (publishThis) {
      published++;
      publishedOne = true;
    } else {
      drafts++;
    }
  }

  return {
    scouted: result.scouted,
    written: result.written,
    passed: result.published,
    rejected: result.rejected,
    published,
    inserted_as_draft: drafts,
    notes: result.notes,
  };
}
