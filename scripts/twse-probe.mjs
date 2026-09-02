/**
 * TWSE OpenAPI 欄位診斷工具。
 *
 * 用途:第一次上線(或證交所調整 JSON key)時,列出各端點實際的欄位名稱與範例值,
 *       用來核對 lib/twse.ts 的取值 key 是否正確。
 *
 * 執行:node scripts/twse-probe.mjs
 * 注意:需能連到 openapi.twse.com.tw(部分沙箱/CI 的 egress 政策會封鎖,請在本機或可連外環境跑)。
 */

const BASE = 'https://openapi.twse.com.tw/v1';
const ENDPOINTS = [
  { label: '上市個股日成交 STOCK_DAY_ALL', path: '/exchangeReport/STOCK_DAY_ALL' },
  { label: '三大法人買賣超 T86', path: '/fund/T86' },
  { label: '上市每月營收 t187ap05_L', path: '/opendata/t187ap05_L' },
];

async function probe({ label, path }) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      console.log(`\n### ${label}\n  ✗ HTTP ${res.status}`);
      return;
    }
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      console.log(`\n### ${label}\n  ✗ 空陣列或非陣列`);
      return;
    }
    const first = data[0];
    console.log(`\n### ${label}  (共 ${data.length} 筆)`);
    for (const [k, v] of Object.entries(first)) {
      const sample = String(v).slice(0, 24);
      console.log(`  - ${k} = ${sample}`);
    }
  } catch (e) {
    console.log(`\n### ${label}\n  ✗ 連線失敗:${e.message}`);
  }
}

console.log('TWSE OpenAPI 欄位診斷(核對 lib/twse.ts 的取值 key)');
for (const ep of ENDPOINTS) {
  // eslint-disable-next-line no-await-in-loop
  await probe(ep);
}
console.log('\n完成。若某欄位名稱與 lib/twse.ts 的候選 key 不符,請把實際 key 補進對應的 candidates 陣列。');
