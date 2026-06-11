import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function supabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}

export function adminConfigured(): boolean {
  return Boolean(url && serviceKey);
}

/** 前台讀取(受 RLS 限制,只看得到已發布) */
export function getSupabasePublic(): SupabaseClient {
  if (!url || !anonKey) throw new Error('Supabase 尚未設定');
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

/** 後台讀寫(service role,僅限伺服器端使用,切勿傳到瀏覽器) */
export function getSupabaseAdmin(): SupabaseClient {
  if (!url || !serviceKey) throw new Error('Supabase service role 尚未設定');
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
