import { splitContent } from '../../lib/markdown';
import VegaChart from './VegaChart';

/** 渲染文章內容:一般 Markdown 轉 HTML,```vega-lite / ```altair 區塊轉成互動圖表 */
export default function RichContent({ content, className }: { content: string; className?: string }) {
  const segments = splitContent(content);

  return (
    <article className={className}>
      {segments.map((seg, i) => {
        if (seg.type === 'chart') return <VegaChart key={i} spec={seg.spec} />;
        if (seg.type === 'chart-error') {
          return (
            <div key={i} className="my-6 rounded-lg border border-[var(--hairline)] p-4 text-sm">
              <p className="mb-2 text-[var(--seal)]">圖表規格有誤:{seg.error}</p>
              <pre><code>{seg.source}</code></pre>
            </div>
          );
        }
        return <div key={i} dangerouslySetInnerHTML={{ __html: seg.html }} />;
      })}
    </article>
  );
}
