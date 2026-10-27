// 輕量 Markdown 轉 HTML(自原教學頁抽出共用),並把圖表區塊拆成獨立片段。
// 支援的圖表語言標記:```vega-lite、```vegalite、```altair(內容為 Altair 的 chart.to_json())

import { parseVegaLiteSpec, VegaLiteSpec } from './vegaSpec';

export type ContentSegment =
  | { type: 'html'; html: string }
  | { type: 'chart'; spec: VegaLiteSpec }
  | { type: 'chart-error'; error: string; source: string };

export const CHART_LANGS = new Set(['vega-lite', 'vegalite', 'altair']);

export function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 只允許 http(s) 與站內相對連結,阻擋 javascript: 等危險協議
export function sanitizeUrl(url: string) {
  const trimmed = url.trim();
  if (/^(https?:\/\/|\/|#)/i.test(trimmed)) return trimmed;
  return '#';
}

function renderLine(line: string): string {
  const esc = escapeHtml(line);

  if (line.startsWith('### ')) return `<h3>${esc.slice(4)}</h3>`;
  if (line.startsWith('## ')) return `<h2>${esc.slice(3)}</h2>`;
  if (line.startsWith('# ')) return `<h1>${esc.slice(2)}</h1>`;
  if (line.startsWith('> ')) return `<blockquote>${esc.slice(2)}</blockquote>`;
  if (line.match(/^\d+\. /)) return `<li>${esc.replace(/^\d+\. /, '')}</li>`;
  if (line.startsWith('- ') || line.startsWith('* ')) return `<li>${esc.slice(2)}</li>`;
  if (line.trim() === '') return '<br/>';

  // inline formatting(在已跳脫的文字上套用)
  const formatted = esc
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, (_m, label, url) =>
      `<a href="${sanitizeUrl(url)}" rel="noopener noreferrer">${label}</a>`
    );
  return `<p>${formatted}</p>`;
}

/** 把內容拆成 HTML 片段與圖表片段,供 RichContent 依序渲染 */
export function splitContent(text: string): ContentSegment[] {
  if (!text) return [];
  const lines = text.trim().split('\n');
  const segments: ContentSegment[] = [];
  let html: string[] = [];
  let inCode = false;
  let codeLang = '';
  let codeLines: string[] = [];

  const flushHtml = () => {
    if (html.length) segments.push({ type: 'html', html: html.join('') });
    html = [];
  };

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (!inCode) {
        inCode = true;
        codeLang = line.slice(3).trim().toLowerCase();
        codeLines = [];
      } else {
        const source = codeLines.join('\n');
        if (CHART_LANGS.has(codeLang)) {
          flushHtml();
          const result = parseVegaLiteSpec(source);
          segments.push(
            result.ok
              ? { type: 'chart', spec: result.spec }
              : { type: 'chart-error', error: result.error, source }
          );
        } else {
          html.push(
            `<pre><code class="language-${escapeHtml(codeLang)}">${codeLines.map(escapeHtml).join('\n')}</code></pre>`
          );
        }
        inCode = false;
        codeLang = '';
        codeLines = [];
      }
      continue;
    }
    if (inCode) {
      codeLines.push(line);
      continue;
    }
    html.push(renderLine(line));
  }

  // 未關閉的程式碼區塊:照原文顯示,不靜默吞掉內容
  if (inCode) {
    html.push(`<pre><code>${codeLines.map(escapeHtml).join('\n')}</code></pre>`);
  }
  flushHtml();
  return segments;
}
