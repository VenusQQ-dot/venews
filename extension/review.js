// 全頁複習介面:從 chrome.storage.local 取出到期卡片,依 SM-2 排程。

const cardEl = document.getElementById("card");
const progressEl = document.getElementById("progress");
const kbdHintEl = document.getElementById("kbd-hint");

let queue = [];       // 本次待複習(到期)的單字
let current = null;   // 目前卡片
let showingAnswer = false;
let doneCount = 0;

if ("speechSynthesis" in window) speechSynthesis.getVoices();

function escapeHtml(s) {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}

function speakGerman(text) {
  if (!("speechSynthesis" in window) || !text) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "de-DE";
  const deVoice = speechSynthesis
    .getVoices()
    .find((v) => v.lang.toLowerCase().startsWith("de"));
  if (deVoice) utterance.voice = deVoice;
  utterance.rate = 0.9;
  speechSynthesis.speak(utterance);
}

function updateProgress() {
  progressEl.textContent = `已完成 ${doneCount} · 剩餘 ${queue.length + (current ? 1 : 0)}`;
}

function renderDone() {
  current = null;
  kbdHintEl.innerHTML = "";
  updateProgress();
  cardEl.innerHTML = `
    <div class="done">🎉 今天的複習完成了!</div>
    <div class="done-sub">共複習 ${doneCount} 張卡片。之後到期的卡片會再次出現。</div>
  `;
}

function nextCard() {
  showingAnswer = false;
  current = queue.shift() || null;
  if (!current) return renderDone();
  updateProgress();

  const word = current.lemma || current.word;
  cardEl.innerHTML = `
    <div class="front-word">${escapeHtml(word)}
      <button class="speak" id="speak-front" title="朗讀">🔊</button>
    </div>
    ${current.context ? `<div class="context">${escapeHtml(truncate(current.context, 160))}</div>` : ""}
    <div class="actions">
      <button id="show-answer">顯示答案</button>
    </div>
  `;
  kbdHintEl.innerHTML = `<kbd>空白鍵</kbd> 顯示答案 · <kbd>S</kbd> 朗讀`;
  document.getElementById("speak-front").addEventListener("click", () => speakGerman(word));
  document.getElementById("show-answer").addEventListener("click", showAnswer);
  speakGerman(word);
}

function truncate(s, n) {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

function showAnswer() {
  if (!current || showingAnswer) return;
  showingAnswer = true;
  const e = current;
  const headword = e.genderArticle ? `${e.genderArticle} ${e.lemma || e.word}` : e.lemma || e.word;
  const preview = SRS.previewIntervals(e.srs);
  const optionalRow = (label, value) =>
    value ? `<div><span class="label">${label}</span>${escapeHtml(value)}</div>` : "";

  cardEl.innerHTML = `
    <div class="front-word">${escapeHtml(e.lemma || e.word)}
      <button class="speak" id="speak-front" title="朗讀">🔊</button>
    </div>
    <hr>
    <div class="answer">
      <div class="headword">${escapeHtml(headword)}
        ${e.pronunciation ? `<span class="ipa">${escapeHtml(e.pronunciation)}</span>` : ""}
        ${e.partOfSpeech ? `<span class="pos">${escapeHtml(e.partOfSpeech)}</span>` : ""}
      </div>
      <div class="meaning">${escapeHtml(e.meaning)}</div>
      ${optionalRow("複數", e.plural)}
      ${optionalRow("動詞變化", e.conjugation)}
      ${e.grammarNotes ? `<div class="grammar"><span class="label">文法</span>${escapeHtml(e.grammarNotes)}</div>` : ""}
      ${
        e.example
          ? `<div class="example">${escapeHtml(e.example)} <button class="speak" id="speak-example" title="朗讀例句">🔊</button><br><span class="example-zh">${escapeHtml(e.exampleTranslation)}</span></div>`
          : ""
      }
    </div>
    <div class="actions">
      <button class="rate again" data-rating="again">再一次<small>${escapeHtml(preview.again)}</small></button>
      <button class="rate hard" data-rating="hard">困難<small>${escapeHtml(preview.hard)}</small></button>
      <button class="rate good" data-rating="good">良好<small>${escapeHtml(preview.good)}</small></button>
      <button class="rate easy" data-rating="easy">簡單<small>${escapeHtml(preview.easy)}</small></button>
    </div>
  `;
  kbdHintEl.innerHTML = `<kbd>1</kbd> 再一次 · <kbd>2</kbd> 困難 · <kbd>3</kbd> 良好 · <kbd>4</kbd> 簡單 · <kbd>S</kbd> 朗讀`;
  document
    .getElementById("speak-front")
    .addEventListener("click", () => speakGerman(e.lemma || e.word));
  const speakExample = document.getElementById("speak-example");
  if (speakExample) {
    speakExample.addEventListener("click", () => speakGerman(e.example));
  }
  cardEl.querySelectorAll(".rate").forEach((btn) => {
    btn.addEventListener("click", () => rateCard(btn.dataset.rating));
  });
}

async function rateCard(rating) {
  if (!current) return;
  const entry = current;
  entry.srs = SRS.rate(entry.srs, rating);

  // 寫回 storage(以 id 對應)
  const { vocab = [] } = await chrome.storage.local.get("vocab");
  const idx = vocab.findIndex((v) => v.id === entry.id);
  if (idx !== -1) {
    vocab[idx].srs = entry.srs;
    await chrome.storage.local.set({ vocab });
  }

  if (rating === "again") {
    queue.push(entry); // 本次複習內重出
  } else {
    doneCount += 1;
  }
  nextCard();
}

document.addEventListener("keydown", (ev) => {
  if (ev.key === " ") {
    ev.preventDefault();
    if (!showingAnswer) showAnswer();
    return;
  }
  if (ev.key.toLowerCase() === "s" && current) {
    speakGerman(current.lemma || current.word);
    return;
  }
  if (showingAnswer && ["1", "2", "3", "4"].includes(ev.key)) {
    rateCard({ 1: "again", 2: "hard", 3: "good", 4: "easy" }[ev.key]);
  }
});

chrome.storage.local.get("vocab").then(({ vocab = [] }) => {
  const now = Date.now();
  queue = vocab.filter((e) => SRS.isDue(e, now));
  // 新卡(從未複習)排在後面,先複習快忘記的舊卡
  queue.sort((a, b) => {
    const da = a.srs?.due ? new Date(a.srs.due).getTime() : Infinity;
    const db = b.srs?.due ? new Date(b.srs.due).getTime() : Infinity;
    return da - db;
  });
  if (queue.length === 0) {
    cardEl.innerHTML = `
      <div class="done">✅ 沒有到期的卡片</div>
      <div class="done-sub">先去網頁上存一些單字,或等已存的卡片到期。</div>
    `;
    progressEl.textContent = "";
    return;
  }
  nextCard();
});
