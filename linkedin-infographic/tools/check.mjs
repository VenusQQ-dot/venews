#!/usr/bin/env node
/**
 * check.mjs — LinkedIn 資訊圖自我檢查（CLAUDE.md 第 4 行「Check yourself」的實作）
 *
 * 用法：
 *   node tools/check.mjs drafts/2026-11-04-ai-newsroom/v1.html [v2.html ...]
 *
 * 每個 HTML 會：
 *   1. 以 1080x1350、deviceScaleFactor 2 渲染，輸出同名 .png（2160x2700）
 *   2. 依 REFERENCE.md 的 ```brand-tokens``` 區塊檢查：
 *      - canvas   ：沒有東西超出畫布
 *      - fonts    ：只用允許的字體，且字體真的載入成功
 *      - min-font ：可見文字 >= min_font_px
 *      - colors   ：所有實際上色的顏色都在色票內
 *      - accent   ：強調色文字最多 N 處
 *      - identity ：有 data-brand="identity" 的品牌識別區
 *      - emoji    ：沒有 emoji
 *      - hans     ：沒有常見簡體字
 *      - bottom   ：內容底部與畫布底部留白 <= 140px（警告：可能有空白）
 *   3. 結果寫入同名 .check.json；任一 FAIL → exit code 1
 *
 * 需求：Node 18+、playwright（本機沒有就 `npm i -D playwright && npx playwright install chromium`）
 */
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// 用 require 載入，才能吃到全域安裝 / NODE_PATH 的 playwright
const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('找不到 playwright。請在本資料夾執行：npm i -D playwright && npx playwright install chromium');
  process.exit(2);
}

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function loadTokens() {
  const refPath = join(ROOT, 'REFERENCE.md');
  if (!existsSync(refPath)) throw new Error('找不到 REFERENCE.md，請先完成 Step 2');
  const md = readFileSync(refPath, 'utf8');
  const block = md.match(/```brand-tokens\n([\s\S]*?)```/);
  if (!block) throw new Error('REFERENCE.md 缺少 ```brand-tokens``` 區塊');
  const kv = Object.fromEntries(
    block[1]
      .split('\n')
      .map(l => l.match(/^(\w+):\s*(.+)$/))
      .filter(Boolean)
      .map(m => [m[1], m[2].trim()]),
  );
  const [w, h] = (kv.canvas ?? '1080x1350').split('x').map(Number);
  return {
    width: w,
    height: h,
    colors: new Set((kv.colors ?? '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean)),
    fonts: (kv.fonts ?? '').split(',').map(s => s.trim()).filter(Boolean),
    minFont: Number(kv.min_font_px ?? 26),
    accent: (kv.accent ?? '').toLowerCase(),
    maxAccent: Number(kv.max_accent_text_elements ?? 1),
  };
}

// 在頁面中執行：蒐集每個可見元素的樣式資訊
function collect() {
  const toHex = c => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    const a = p.length > 3 ? p[3] : 1;
    if (a === 0) return null; // 透明 = 沒上色
    const hex = '#' + p.slice(0, 3).map(n => Math.round(n).toString(16).padStart(2, '0')).join('');
    return a < 1 ? `${hex}@${a}` : hex;
  };
  const out = [];
  for (const el of document.body.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const ownText = [...el.childNodes]
      .filter(n => n.nodeType === 3)
      .map(n => n.textContent.trim())
      .join('');
    const colors = [];
    if (ownText) colors.push(['color', toHex(cs.color)]);
    colors.push(['background', toHex(cs.backgroundColor)]);
    for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
      if (parseFloat(cs[`border${side}Width`]) > 0 && cs[`border${side}Style`] !== 'none')
        colors.push([`border-${side.toLowerCase()}`, toHex(cs[`border${side}Color`])]);
    }
    // 只檢查真的會畫出東西的 SVG 圖形（<svg>/<g> 的繼承預設 fill 不算）
    if (el instanceof SVGElement && /^(path|rect|circle|ellipse|polygon|polyline|line|text)$/.test(el.tagName)) {
      if (cs.fill && cs.fill !== 'none' && !/^(line|polyline)$/.test(el.tagName)) colors.push(['fill', toHex(cs.fill)]);
      if (cs.stroke && cs.stroke !== 'none' && parseFloat(cs.strokeWidth) > 0) colors.push(['stroke', toHex(cs.stroke)]);
    }
    if (cs.backgroundImage && cs.backgroundImage.includes('gradient')) colors.push(['gradient', 'GRADIENT']);
    out.push({
      tag: el.tagName.toLowerCase(),
      cls: typeof el.className === 'string' ? el.className : '',
      text: ownText.slice(0, 40),
      fontSize: parseFloat(cs.fontSize),
      fontFamily: cs.fontFamily,
      textAlign: cs.textAlign,
      colors: colors.filter(([, v]) => v),
      box: { x: r.left, y: r.top, right: r.right, bottom: r.bottom },
      identity: el.getAttribute('data-brand') === 'identity',
    });
  }
  return {
    els: out,
    scrollW: document.documentElement.scrollWidth,
    scrollH: document.documentElement.scrollHeight,
  };
}

async function checkFile(browser, file, t) {
  const abs = resolve(file);
  const page = await browser.newPage({ viewport: { width: t.width, height: t.height }, deviceScaleFactor: 2 });
  const results = [];
  const add = (id, status, detail) => results.push({ id, status, detail });

  await page.goto(pathToFileURL(abs).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  // 任一字重成功載入即視為該字體可用（避免 fallback 成系統字型卻沒發現）
  const fontsLoaded = await page.evaluate(
    fams => fams.map(f => ({
      f,
      ok: [...document.fonts].some(ff => ff.family.replace(/["']/g, '') === f && ff.status === 'loaded'),
    })),
    t.fonts,
  );
  const { els, scrollW, scrollH } = await page.evaluate(collect);

  // canvas
  const over = els.filter(e => e.box.right > t.width + 0.5 || e.box.bottom > t.height + 0.5 || e.box.x < -0.5 || e.box.y < -0.5);
  add('canvas', scrollW <= t.width && scrollH <= t.height && over.length === 0 ? 'PASS' : 'FAIL',
    `scroll ${scrollW}x${scrollH}；超出畫布元素 ${over.length} 個` + (over[0] ? `（例：<${over[0].tag}> "${over[0].text}"）` : ''));

  // fonts
  const textEls = els.filter(e => e.text);
  const badFont = textEls.filter(e => !t.fonts.some(f => e.fontFamily.split(',')[0].replace(/["']/g, '').trim() === f));
  const notLoaded = fontsLoaded.filter(x => !x.ok).map(x => x.f);
  add('fonts', badFont.length === 0 && notLoaded.length === 0 ? 'PASS' : 'FAIL',
    `非規範字體 ${badFont.length} 處` + (badFont[0] ? `（例：${badFont[0].fontFamily} "${badFont[0].text}"）` : '') +
    (notLoaded.length ? `；未載入：${notLoaded.join(', ')}` : '；字體已載入'));

  // min-font
  const tiny = textEls.filter(e => e.fontSize < t.minFont);
  add('min-font', tiny.length === 0 ? 'PASS' : 'FAIL',
    `最小字級 ${Math.min(...textEls.map(e => e.fontSize))}px（下限 ${t.minFont}px）` +
    (tiny[0] ? `；過小 ${tiny.length} 處，例："${tiny[0].text}" ${tiny[0].fontSize}px` : ''));

  // colors
  const offPalette = [];
  for (const e of els) for (const [prop, v] of e.colors) if (!t.colors.has(v)) offPalette.push(`${v} (${prop} <${e.tag}> "${e.text}")`);
  add('colors', offPalette.length === 0 ? 'PASS' : 'FAIL',
    offPalette.length ? `色票外顏色 ${offPalette.length} 處：${[...new Set(offPalette)].slice(0, 5).join('；')}` : `全部 ${t.colors.size} 色票內`);

  // accent
  const accentText = textEls.filter(e => e.colors.some(([p, v]) => p === 'color' && v === t.accent));
  add('accent', accentText.length <= t.maxAccent ? 'PASS' : 'FAIL',
    `強調色文字 ${accentText.length} 處（上限 ${t.maxAccent}）：${accentText.map(e => `"${e.text}"`).join('、') || '無'}`);

  // identity
  add('identity', els.some(e => e.identity) ? 'PASS' : 'FAIL', 'data-brand="identity" 品牌識別區');

  // emoji
  const allText = textEls.map(e => e.text).join('');
  const emoji = allText.match(/\p{Extended_Pictographic}/gu) ?? [];
  add('emoji', emoji.length === 0 ? 'PASS' : 'FAIL', emoji.length ? `發現 emoji：${emoji.join(' ')}` : '無 emoji');

  // hans（常見簡體字抽查，非完整偵測）
  const hans = allText.match(/[这们说为对时会国发经过后来个开关见还进与问题设计实现]/g) ?? [];
  add('hans', hans.length === 0 ? 'PASS' : 'FAIL', hans.length ? `疑似簡體字：${[...new Set(hans)].join('')}` : '未發現常見簡體字');

  // bottom whitespace（警告）
  const contentBottom = Math.max(...textEls.map(e => e.box.bottom));
  const gap = Math.round(t.height - contentBottom);
  add('bottom', gap <= 140 ? 'PASS' : 'WARN', `最後一行文字距畫布底 ${gap}px`);

  // center（資訊用，不判定）
  const centered = textEls.filter(e => e.textAlign === 'center').length;
  add('center', 'INFO', `置中文字 ${centered} 處`);

  const png = abs.replace(/\.html?$/, '.png');
  await page.screenshot({ path: png, clip: { x: 0, y: 0, width: t.width, height: t.height } });
  await page.close();

  const report = { file, png, checkedAt: new Date().toISOString(), results };
  writeFileSync(abs.replace(/\.html?$/, '.check.json'), JSON.stringify(report, null, 2));
  return report;
}

const files = process.argv.slice(2);
if (!files.length) {
  console.error('用法：node tools/check.mjs <file.html> [...]');
  process.exit(2);
}

const tokens = loadTokens();
const browser = await chromium.launch();
let failed = 0;
try {
  for (const f of files) {
    const r = await checkFile(browser, f, tokens);
    console.log(`\n■ ${f}`);
    for (const x of r.results) console.log(`  ${x.status.padEnd(4)} ${x.id.padEnd(9)} ${x.detail}`);
    console.log(`  PNG   ${r.png}`);
    if (r.results.some(x => x.status === 'FAIL')) failed++;
  }
} catch (e) {
  console.error('檢查中斷：', e.message);
  failed++;
} finally {
  await browser.close();
}
console.log(failed ? `\n${failed} 個檔案未通過` : '\n全部通過');
process.exit(failed ? 1 : 0);
