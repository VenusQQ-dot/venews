// Vega-Lite 規格驗證。Python Altair 的 chart.to_json() 輸出就是 Vega-Lite JSON,
// 文章內容裡的 ```vega-lite / ```altair 區塊會先經過這裡才交給瀏覽器渲染。

export type VegaLiteSpec = Record<string, unknown>;

export type SpecResult =
  | { ok: true; spec: VegaLiteSpec }
  | { ok: false; error: string };

// 單一圖表上限 200 KB(含 inline data),避免文章塞入巨量資料拖慢頁面
export const MAX_SPEC_BYTES = 200 * 1024;

// 至少要有其中一個才算「圖表」,擋掉隨手貼錯的 JSON
const VIEW_KEYS = ['mark', 'layer', 'concat', 'hconcat', 'vconcat', 'facet', 'repeat', 'spec'];

/**
 * 只允許站內相對路徑與 data: URI 的外部資料。
 * 外部網址可能被拿來追蹤讀者或載入不受控資料(CSP connect-src 'self' 也會擋,這裡提早給明確錯誤)。
 */
function findExternalUrl(node: unknown, path: string): string | null {
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      const hit = findExternalUrl(node[i], `${path}[${i}]`);
      if (hit) return hit;
    }
    return null;
  }
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (key === 'url' && typeof value === 'string' && /^[a-z][a-z0-9+.-]*:/i.test(value.trim())
        && !/^data:/i.test(value.trim())) {
        return `${path}.url`;
      }
      const hit = findExternalUrl(value, `${path}.${key}`);
      if (hit) return hit;
    }
  }
  return null;
}

export function parseVegaLiteSpec(source: string): SpecResult {
  const text = source.trim();
  if (!text) return { ok: false, error: '圖表區塊是空的' };
  if (new TextEncoder().encode(text).length > MAX_SPEC_BYTES) {
    return { ok: false, error: `圖表超過 ${MAX_SPEC_BYTES / 1024} KB 上限,請改用彙總後的資料` };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    return { ok: false, error: `JSON 格式錯誤:${(e as Error).message}` };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, error: '圖表規格必須是 JSON 物件' };
  }
  const spec = parsed as VegaLiteSpec;

  const schema = spec.$schema;
  if (schema !== undefined && (typeof schema !== 'string' || !schema.includes('vega-lite'))) {
    return { ok: false, error: '只支援 Vega-Lite 規格($schema 需為 vega-lite)' };
  }

  if (!VIEW_KEYS.some(k => k in spec)) {
    return { ok: false, error: '缺少 mark / layer / concat 等圖表定義,不像 Vega-Lite 規格' };
  }

  const external = findExternalUrl(spec, 'spec');
  if (external) {
    return { ok: false, error: `不允許載入外部網址資料(${external}),請改用 inline values` };
  }

  return { ok: true, spec };
}
