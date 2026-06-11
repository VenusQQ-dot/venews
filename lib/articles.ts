import { Article, articles as staticArticles } from '../app/data/news';
import { getSupabasePublic, supabaseConfigured } from './supabase';

export type DbArticle = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  read_mins: number;
  featured: boolean;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export function toArticle(row: DbArticle): Article {
  return {
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    category: row.category,
    author: row.author,
    publishedAt: row.published_at ?? row.created_at,
    readMins: row.read_mins,
    featured: row.featured,
  };
}

/**
 * 首頁資料來源:Supabase 已設定就撈資料庫,否則退回靜態示意資料,
 * 讓專案在還沒接資料庫前也能完整預覽。
 */
export async function fetchPublishedArticles(): Promise<Article[]> {
  if (!supabaseConfigured()) return staticArticles;

  const { data, error } = await getSupabasePublic()
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('featured', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(60);

  if (error) {
    console.error('讀取文章失敗,改用靜態資料:', error.message);
    return staticArticles;
  }
  return (data as DbArticle[]).map(toArticle);
}
