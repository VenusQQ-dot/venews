# CLAUDE.md — LinkedIn 資訊圖工作區

Before anything, read REFERENCE.md in full.
No inventing, every value comes from it.
Ask, do not choose, if it is not covered there.
Check yourself. Fix what fails, then show me.

## 執行細則（上面四行的落地方式）

1. **先讀**：`REFERENCE.md` 全文 → `examples/` 裡最接近本次主題的一張。新圖從那張的版面出發。
2. **不發明**：顏色、字體、字級、間距只能用 REFERENCE.md 的 `brand-tokens` 區塊裡的值。需要新值時停下來問，不要自己挑。
3. **要問不要選**：REFERENCE.md 標示「待確認」的項目（例如姓名、大頭照）不可自行填入假資料，用 REFERENCE.md 指定的暫代方式。
4. **自我檢查**：每張圖完成後執行
   ```bash
   node tools/check.mjs drafts/<檔名>.html
   ```
   全部 PASS 才能給我看；FAIL 先修正再重跑。另外用 `remove-ai-design-slop` skill 的 29 個 tells 逐條目檢。
5. **事實**：圖上每個數字、名稱都要能追溯到來源；在 HTML 開頭的註解寫明來源。查不到就不放。
6. **輸出規格**：單一 HTML、1080 × 1350、檔案放 `drafts/YYYY-MM-DD-<主題>/v1.html…`，PNG 由 check.mjs 產出在同資料夾。
7. **定稿**：我選定的版本才複製到 `examples/`，並在 `examples/README.md` 加一行紀錄。
