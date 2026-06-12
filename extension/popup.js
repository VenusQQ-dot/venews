const listEl = document.getElementById("list");
const countEl = document.getElementById("count");
const searchInput = document.getElementById("search");

let allEntries = [];

function escapeHtml(s) {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}

function render(entries) {
  countEl.textContent = `共 ${allEntries.length} 個單字${
    entries.length !== allEntries.length ? `,顯示 ${entries.length} 筆` : ""
  }`;

  if (entries.length === 0) {
    listEl.innerHTML = `
      <div class="empty">
        ${allEntries.length === 0
          ? "還沒有單字。在網頁上選取德文,點「✨ 解釋德文」後即可儲存。<br><br><button class='settings-link' id='open-settings'>開啟設定(填入 API key)</button>"
          : "沒有符合的單字。"}
      </div>`;
    const link = document.getElementById("open-settings");
    if (link) link.addEventListener("click", () => chrome.runtime.openOptionsPage());
    return;
  }

  listEl.innerHTML = entries
    .map((e) => {
      const headword = e.genderArticle
        ? `${e.genderArticle} ${e.lemma || e.word}`
        : e.lemma || e.word;
      const details = [
        e.plural && `複數:${e.plural}`,
        e.conjugation && `變化:${e.conjugation}`,
      ]
        .filter(Boolean)
        .join("  ·  ");
      return `
        <div class="entry">
          <div class="entry-head">
            <span>
              <span class="lemma">${escapeHtml(headword)}</span>
              ${e.partOfSpeech ? `<span class="pos">${escapeHtml(e.partOfSpeech)}</span>` : ""}
            </span>
            <button class="delete" data-id="${escapeHtml(e.id)}">刪除</button>
          </div>
          <div class="meaning">${escapeHtml(e.meaning)}</div>
          ${details ? `<div class="detail">${escapeHtml(details)}</div>` : ""}
          ${e.grammarNotes ? `<div class="detail">文法:${escapeHtml(e.grammarNotes)}</div>` : ""}
          ${e.example ? `<div class="detail"><i>${escapeHtml(e.example)}</i> — ${escapeHtml(e.exampleTranslation)}</div>` : ""}
          <div class="source" title="${escapeHtml(e.url)}">${escapeHtml(e.title || e.url)} · ${new Date(e.savedAt).toLocaleDateString()}</div>
        </div>`;
    })
    .join("");

  listEl.querySelectorAll(".delete").forEach((btn) => {
    btn.addEventListener("click", async () => {
      allEntries = allEntries.filter((e) => e.id !== btn.dataset.id);
      await chrome.storage.local.set({ vocab: allEntries });
      applyFilter();
    });
  });
}

function applyFilter() {
  const q = searchInput.value.trim().toLowerCase();
  const filtered = q
    ? allEntries.filter((e) =>
        [e.word, e.lemma, e.meaning, e.grammarNotes]
          .join("\n")
          .toLowerCase()
          .includes(q)
      )
    : allEntries;
  render(filtered);
}

function toCsv(entries) {
  const headers = [
    "word", "lemma", "partOfSpeech", "genderArticle", "plural", "conjugation",
    "meaning", "grammarNotes", "example", "exampleTranslation",
    "context", "url", "title", "savedAt",
  ];
  const quote = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = [
    headers.join(","),
    ...entries.map((e) => headers.map((h) => quote(e[h])).join(",")),
  ];
  // BOM 讓 Excel 正確以 UTF-8 開啟
  return "\uFEFF" + rows.join("\r\n");
}

document.getElementById("export").addEventListener("click", () => {
  const blob = new Blob([toCsv(allEntries)], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `wortschatz-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
});

searchInput.addEventListener("input", applyFilter);

chrome.storage.local.get("vocab").then(({ vocab = [] }) => {
  allEntries = vocab;
  applyFilter();
});
