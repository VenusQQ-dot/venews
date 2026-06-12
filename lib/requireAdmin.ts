import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE, verifySessionToken } from './adminAuth';

/**
 * 後台第二道防線:middleware 之外,頁面與 server action 內各自再驗一次。
 */
export async function requireAdmin() {
  const store = await cookies();
  const ok = await verifySessionToken(store.get(ADMIN_COOKIE)?.value);
  if (!ok) redirect('/admin/login');
}
