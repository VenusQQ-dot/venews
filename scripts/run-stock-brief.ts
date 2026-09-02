/**
 * 台股盤後籌碼情報 Agent — standalone 執行入口(給 GitHub Actions / 本機 cron 用)。
 *
 * 直接呼叫 lib/stockIngest 的完整 pipeline(ETL → 選股 → Claude 解讀 → 寫入 Supabase),
 * 不需部署 Vercel、也不受 Vercel 60 秒上限影響。GitHub Actions runner 具完整外網,
 * 可正常連線證交所 OpenAPI。
 *
 * 執行:npx tsx scripts/run-stock-brief.ts
 *
 * 必要環境變數:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   寫入 Supabase
 * 選用環境變數:
 *   ANTHROPIC_API_KEY   有設定才會做 AI 解讀(未設定則只出純籌碼清單)
 *   STOCK_ANALYZE=0     強制略過 Claude 解讀(只做籌碼掃描,省時省費)
 *   STOCK_PUBLISH=1     直接發佈文章(預設存草稿等人工確認)
 */

import { ingestStockBrief } from '../lib/stockIngest';

async function main() {
  const analyze = process.env.STOCK_ANALYZE !== '0';
  const autoPublish = process.env.STOCK_PUBLISH === '1';

  console.log(`[stock-brief] 開始:analyze=${analyze} autoPublish=${autoPublish}`);
  const summary = await ingestStockBrief({ analyze, autoPublish });

  console.log(`[stock-brief] 交易日 ${summary.tradeDate}`);
  console.log(
    `[stock-brief] 抓取 ${summary.fetched} 檔｜掃描 ${summary.scanned}｜符合 ${summary.matched}｜` +
      `AI 解讀 ${summary.analyzed ? '是' : '否'}｜草稿寫入 ${summary.draftInserted ? '成功' : '失敗'}`,
  );
  for (const n of summary.notes) console.log(`  - ${n}`);
  if (summary.candidates.length > 0) {
    console.log('[stock-brief] 候選股:');
    for (const c of summary.candidates) {
      console.log(
        `  ${c.code} ${c.name}｜法人5日 ${c.instiNet5d} 張(佔量 ${c.concentrationPct}%)｜連買 ${c.instiStreak} 天｜分數 ${c.score}`,
      );
    }
  }
  console.log('[stock-brief] 完成');
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('[stock-brief] 失敗:', err);
    process.exit(1);
  });
