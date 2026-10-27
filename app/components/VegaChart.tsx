'use client';

import { useEffect, useRef, useState } from 'react';
import type { VegaLiteSpec } from '../../lib/vegaSpec';

type Props = {
  spec: VegaLiteSpec;
  /** 給螢幕閱讀器的圖表說明;未提供時取 spec.description / title */
  ariaLabel?: string;
};

function cssVar(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

/** 依網站的紙墨配色產生 Vega 主題,深淺色模式切換時重新套用 */
function siteTheme() {
  const ink = cssVar('--ink', '#1f2227');
  const soft = cssVar('--ink-soft', '#4b4f55');
  const faint = cssVar('--ink-faint', '#84888f');
  const hairline = cssVar('--hairline', 'rgba(0,0,0,0.12)');
  const seal = cssVar('--seal', '#c5392f');
  const font = '"Noto Sans TC", system-ui, sans-serif';
  return {
    background: 'transparent',
    font,
    // 印泥紅為主色,其餘為低彩度輔色,避免顏色過多
    range: { category: [seal, '#3d6a8a', '#c89b3c', '#5b8a72', '#8a6a9a', '#7a7d82'] },
    mark: { color: seal },
    view: { stroke: 'transparent' },
    title: { color: ink, font, fontSize: 15, fontWeight: 700, anchor: 'start', subtitleColor: soft },
    axis: {
      domainColor: hairline,
      gridColor: hairline,
      tickColor: hairline,
      labelColor: soft,
      titleColor: soft,
      labelFont: font,
      titleFont: font,
      titleFontWeight: 500,
    },
    legend: { labelColor: soft, titleColor: soft, labelFont: font, titleFont: font },
    header: { labelColor: soft, titleColor: ink },
    text: { color: ink },
    style: { 'guide-label': { fill: faint } },
  };
}

function isExternalUri(uri: string) {
  const u = uri.trim();
  return /^[a-z][a-z0-9+.-]*:/i.test(u) && !/^data:/i.test(u);
}

export default function VegaChart({ spec, ariaLabel }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dark, setDark] = useState<boolean | null>(null);

  // 監聽 <html class="dark"> 變化,讓圖表跟著主題切換
  useEffect(() => {
    const root = document.documentElement;
    setDark(root.classList.contains('dark'));
    const observer = new MutationObserver(() => setDark(root.classList.contains('dark')));
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (dark === null || !ref.current) return;
    const el = ref.current;
    let cancelled = false;
    let finalize: (() => void) | undefined;

    (async () => {
      try {
        // 動態載入:只有含圖表的頁面才下載 Vega(約數百 KB)
        const [{ default: embed }, { expressionInterpreter }, vega] = await Promise.all([
          import('vega-embed'),
          import('vega-interpreter'),
          import('vega'),
        ]);
        if (cancelled) return;

        // 自訂 loader:二次把關,拒絕任何外部網址資料
        const loader = vega.loader();
        const baseSanitize = loader.sanitize.bind(loader);
        loader.sanitize = (uri, options) =>
          isExternalUri(uri)
            ? Promise.reject(new Error('不允許載入外部資料'))
            : baseSanitize(uri, options);

        // 單一視圖且未指定寬度時撐滿容器(Altair 預設不寫 width)
        const isSingleView = 'mark' in spec || 'layer' in spec;
        const finalSpec = isSingleView && spec.width === undefined
          ? { ...spec, width: 'container' as const, autosize: { type: 'fit-x' as const, contains: 'padding' as const } }
          : spec;

        const result = await embed(el, finalSpec as never, {
          // CSP 未開 unsafe-eval:改用 AST 直譯器執行運算式,也避免文章內容執行任意 JS
          ast: true,
          expr: expressionInterpreter,
          loader,
          renderer: 'svg',
          config: siteTheme() as never,
          actions: { export: true, source: true, compiled: false, editor: false },
          i18n: {
            CLICK_TO_VIEW_ACTIONS: '圖表選單',
            COMPILED_ACTION: '檢視 Vega 規格',
            EDITOR_ACTION: '在 Vega Editor 開啟',
            PNG_ACTION: '下載 PNG',
            SOURCE_ACTION: '檢視原始規格',
            SVG_ACTION: '下載 SVG',
          },
        });
        if (cancelled) {
          result.finalize();
          return;
        }
        finalize = result.finalize;
        setError(null);
      } catch (e) {
        console.error('圖表渲染失敗:', e);
        if (!cancelled) setError((e as Error).message || '未知錯誤');
      }
    })();

    return () => {
      cancelled = true;
      finalize?.();
    };
  }, [spec, dark]);

  const label =
    ariaLabel ??
    (typeof spec.description === 'string' ? spec.description : undefined) ??
    (typeof spec.title === 'string' ? spec.title : '資料圖表');

  return (
    <figure className="vega-chart my-6" role="img" aria-label={label}>
      {error ? (
        <p className="rounded-lg border border-[var(--hairline)] p-4 text-sm text-[var(--seal)]">
          圖表無法顯示:{error}
        </p>
      ) : (
        <div ref={ref} className="w-full min-h-[120px]" />
      )}
    </figure>
  );
}
