import { describe, expect, it } from 'vitest';
import { extractJson } from '../lib/newsroom';

describe('extractJson', () => {
  it('解析純 JSON 物件', () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });

  it('解析 JSON 陣列', () => {
    expect(extractJson('[1,2,3]')).toEqual([1, 2, 3]);
  });

  it('容忍 ```json 圍欄', () => {
    const text = '好的,結果如下:\n```json\n{"title":"測試"}\n```';
    expect(extractJson(text)).toEqual({ title: '測試' });
  });

  it('容忍無語言標記的圍欄', () => {
    expect(extractJson('```\n[{"x":true}]\n```')).toEqual([{ x: true }]);
  });

  it('容忍 JSON 前後贅字', () => {
    const text = '以下是分析結果 {"ok":true,"n":5} 希望對你有幫助';
    expect(extractJson(text)).toEqual({ ok: true, n: 5 });
  });

  it('無 JSON 時回傳 null', () => {
    expect(extractJson('完全沒有結構化內容')).toBeNull();
    expect(extractJson('')).toBeNull();
  });

  it('巢狀物件完整解析', () => {
    const text = '{"a":{"b":[1,{"c":"深"}]}}';
    expect(extractJson(text)).toEqual({ a: { b: [1, { c: '深' }] } });
  });

  it('截斷的 JSON 回傳 null 而非丟例外', () => {
    expect(extractJson('{"title":"未完')).toBeNull();
  });
});
