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
    content: row.content,
  };
}

/**
 * 首頁資料來源:Supabase 已設定就撈資料庫,否則退回靜態示意資料,
 * 讓專案在還沒接資料庫前也能完整預覽。
 */
// 列表不需要內文,避免把整篇內容(含圖表資料)塞進首頁 payload
const LIST_COLUMNS =
  'id,slug,title,summary,category,author,read_mins,featured,status,published_at,created_at,updated_at';

function withoutContent(list: Article[]): Article[] {
  return list.map(a => ({ ...a, content: undefined }));
}

export async function fetchPublishedArticles(): Promise<Article[]> {
  if (!supabaseConfigured()) return withoutContent(staticArticles);

  const { data, error } = await getSupabasePublic()
    .from('articles')
    .select(LIST_COLUMNS)
    .eq('status', 'published')
    .order('featured', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(60);

  if (error) {
    console.error('讀取文章失敗,改用靜態資料:', error.message);
    return withoutContent(staticArticles);
  }
  return (data as unknown as DbArticle[]).map(toArticle);
}

/** 單篇文章(詳情頁用);找不到或未發布回傳 null */
export async function fetchPublishedArticle(slug: string): Promise<Article | null> {
  if (!supabaseConfigured()) return staticArticles.find(a => a.slug === slug) ?? null;

  const { data, error } = await getSupabasePublic()
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('讀取文章失敗,改用靜態資料:', error.message);
    return staticArticles.find(a => a.slug === slug) ?? null;
  }
  return data ? toArticle(data as DbArticle) : null;
}
