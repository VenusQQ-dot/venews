/**
 * RSS 新聞來源(取代 NewsAPI 與 Claude web_search)。
 *
 * 免費、無額度限制、無「不得用於正式環境」條款。
 * 支援 RSS 2.0 <item> 與 Atom <entry> 兩種格式,不引入額外依賴。
 */

export type FeedItem = {
    headline: string;
    url: string;
    summary: string;
    source: string;
    publishedAt: string; // ISO
};

/** 預設新聞來源;可用環境變數 RSS_FEEDS(逗號分隔)覆蓋。 */
const DEFAULT_FEEDS: { name: string; url: string }[] = [
  { name: 'iThome', url: 'https://www.ithome.com.tw/rss' },
  { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
   { name: 'The Verge AI', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml' },
   ];

function feeds(): { name: string; url: string }[] {
    const env = process.env.RSS_FEEDS;
  if (!env) return DEFAULT_FEEDS;
  return env
    .split(',')
    .map(u => u.trim())
    .filter(Boolean)
    .map(u => ({ name: new URL(u).hostname, url: u }));
}

/** 去除 CDATA 包裝、HTML 標籤與 entity,壓縮空白。 */
export function cleanText(raw: string): string {
  return raw
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function tag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? cleanText(m[1]) : '';
}

/** 解析單一 feed 的 XML(RSS 2.0 或 Atom)。導出以便測試。 */
export function parseFeed(xml: string, sourceName: string): FeedItem[] {
    const items: FeedItem[] = [];
    const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>|<entry[\s>][\s\S]*?<\/entry>/gi) ?? [];
  for (const b of blocks) {
        const headline = tag(b, 'title');
    // RSS 2.0 用 <link>網址</link>;Atom 用 <link href="網址"/>
    let url = tag(b, 'link');
    if (!url) {
            const href = b.match(/<link[^>]*href=["']([^"']+)["']/i);
                  url = href ? href[1] : '';
                      }
                          const summary = tag(b, 'description') || tag(b, 'summary') || tag(b, 'content');
                              const dateRaw = tag(b, 'pubDate') || tag(b, 'updated') || tag(b, 'published');
                                  const date = new Date(dateRaw);
                                      if (!headline || !url.startsWith('http')) continue;
                                          items.push({
                                                headline,
                                                      url,
                                                            summary: summary.slice(0, 300),
                                                                  source: sourceName,
                                                                        publishedAt: isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString(),
                                                                            });
                                                                              }
                                                                                return items;
                                                                                }

                                                                                async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
                                                                                  const ctrl = new AbortController();
                                                                                    const timer = setTimeout(() => ctrl.abort(), ms);
                                                                                      try {
                                                                                          return await fetch(url, {
                                                                                                signal: ctrl.signal,
                                                                                                      headers: { 'user-agent': 'Mozilla/5.0 (compatible; VeNewsBot/1.0)' },
                                                                                                            // RSS 內容更新頻繁,不要吃到 Next.js 的 fetch 快取
                                                                                                                  cache: 'no-store',
                                                                                                                      });
                                                                                                                        } finally {
                                                                                                                            clearTimeout(timer);
                                                                                                                              }
                                                                                                                              }
                                                                                                                              
/**
 * 抓取所有 feed,合併、過濾近 48 小時、去重、依時間排序。
  * 個別 feed 失敗不影響其他來源(記進 notes 由呼叫端回報)。
   */
   export async function fetchRecentNews(
     notes: string[],
       maxAgeHours = 48,
         limit = 25,
         ): Promise<FeedItem[]> {
           const results = await Promise.allSettled(
               feeds().map(async f => {
                     const res = await fetchWithTimeout(f.url, 8000);
                           if (!res.ok) throw new Error(`HTTP ${res.status}`);
                                 return parseFeed(await res.text(), f.name);
                                     }),
                                       );

                                         const all: FeedItem[] = [];
                                           results.forEach((r, i) => {
                                               if (r.status === 'fulfilled') {
                                                     all.push(...r.value);
                                                         } else {
                                                               notes.push(`RSS 來源失敗(${feeds()[i].name}):${(r.reason as Error).message}`);
                                                                   }
                                                                     });

                                                                       const cutoff = Date.now() - maxAgeHours * 3600_000;
                                                                         const seen = new Set<string>();
                                                                           return all
                                                                               .filter(i => new Date(i.publishedAt).getTime() >= cutoff)
                                                                                   .filter(i => {
                                                                                         const key = i.url.replace(/[?#].*$/, '');
                                                                                               if (seen.has(key)) return false;
                                                                                                     seen.add(key);
                                                                                                           return true;
                                                                                                               })
                                                                                                                   .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
                                                                                                                       .slice(0, limit);
                                                                                                                       }
                                                                                                                       
                                                                                                                       /**
                                                                                                                        * 抓取單篇文章原文並轉成純文字(取代 Claude 的 web_fetch server tool)。
                                                                                                                         * 失敗時回傳 null,由呼叫端改用 RSS 摘要當素材。
                                                                                                                          */
                                                                                                                          export async function fetchArticleText(url: string, maxChars = 5000): Promise<string | null> {
                                                                                                                            try {
                                                                                                                                const res = await fetchWithTimeout(url, 8000);
                                                                                                                                    if (!res.ok) return null;
                                                                                                                                        const html = await res.text();
                                                                                                                                            // 粗略抽正文:先移除 script/style/nav 等雜訊,再抽 <p> 段落
                                                                                                                                                const noJunk = html.replace(
                                                                                                                                                      /<(script|style|nav|header|footer|aside|form|svg)[\s\S]*?<\/\1>/gi,
                                                                                                                                                            ' ',
                                                                                                                                                                );
                                                                                                                                                                    const paras = noJunk.match(/<p[^>]*>[\s\S]*?<\/p>/gi) ?? [];
                                                                                                                                                                        const text = cleanText(paras.join('\n'));
                                                                                                                                                                            if (text.length < 200) return null; // 太短代表抽取失敗(JS 渲染頁等)
                                                                                                                                                                                return text.slice(0, maxChars);
                                                                                                                                                                                  } catch {
                                                                                                                                                                                      return null;
                                                                                                                                                                                        }
                                                                                                                                                                                        }
