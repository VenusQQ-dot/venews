// Content script:偵測文字選取、顯示觸發按鈕與解釋卡片(Shadow DOM 隔離樣式)。

(() => {
  const MAX_SELECTION_LENGTH = 300;
  const MAX_CONTEXT_LENGTH = 600;

  // 先觸發語音清單載入(getVoices 第一次呼叫常回傳空陣列)
  if ("speechSynthesis" in window) speechSynthesis.getVoices();

  let host = null;
  let shadow = null;
  let triggerBtn = null;
  let card = null;
  // 點按鈕當下擷取的資料(避免選取在點擊過程中被清掉)
  let pending = null;

  function ensureShadowHost() {
    if (host) return;
    host = document.createElement("div");
    host.id = "wortschatz-host";
    host.style.cssText =
      "all:initial; position:absolute; top:0; left:0; z-index:2147483647;";
    shadow = host.attachShadow({ mode: "closed" });

    const style = document.createElement("style");
    style.textContent = `
      :host { all: initial; }
      * { box-sizing: border-box; font-family: -apple-system, "PingFang TC", "Microsoft JhengHei", "Noto Sans TC", sans-serif; }
      .trigger {
        position: absolute;
        display: flex; align-items: center; gap: 4px;
        padding: 4px 10px;
        background: #1a1a2e; color: #fff;
        border: none; border-radius: 14px;
        font-size: 13px; line-height: 1.4;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,.3);
        user-select: none;
      }
      .trigger:hover { background: #30305a; }
      .card {
        position: absolute;
        width: 380px; max-width: 92vw;
        max-height: 60vh; overflow-y: auto;
        background: #fff; color: #1a1a2e;
        border: 1px solid #ddd; border-radius: 10px;
        box-shadow: 0 6px 24px rgba(0,0,0,.22);
        padding: 14px 16px;
        font-size: 14px; line-height: 1.6;
      }
      .word { font-size: 18px; font-weight: 700; }
      .pos { display: inline-block; margin-left: 6px; padding: 1px 8px; background: #eef; color: #334; border-radius: 8px; font-size: 12px; }
      .row { margin-top: 6px; }
      .label { color: #888; font-size: 12px; margin-right: 6px; }
      .grammar { margin-top: 8px; padding: 8px 10px; background: #f7f7fb; border-radius: 8px; }
      .example { margin-top: 8px; font-style: italic; }
      .example-zh { color: #666; font-style: normal; font-size: 13px; }
      .footer { margin-top: 12px; display: flex; gap: 8px; align-items: center; }
      .save {
        padding: 6px 14px; border: none; border-radius: 8px;
        background: #1a1a2e; color: #fff; font-size: 13px; cursor: pointer;
      }
      .save:hover { background: #30305a; }
      .save[disabled] { background: #9a9; cursor: default; }
      .muted { color: #888; font-size: 12px; }
      .ipa { color: #667; font-size: 13px; margin-left: 6px; }
      .speak {
        background: none; border: none; cursor: pointer;
        font-size: 15px; padding: 0 2px; vertical-align: middle;
      }
      .speak:hover { opacity: .7; }
      .error { color: #b00020; }
      .link { color: #2244cc; cursor: pointer; text-decoration: underline; background: none; border: none; font-size: 13px; padding: 0; }
      .spinner { color: #666; }
    `;
    shadow.appendChild(style);
    document.documentElement.appendChild(host);
  }

  function removeTrigger() {
    if (triggerBtn) {
      triggerBtn.remove();
      triggerBtn = null;
    }
  }

  function removeCard() {
    if (card) {
      card.remove();
      card = null;
    }
  }

  function escapeHtml(s) {
    return String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
    );
  }

  // 取得選取處附近的上下文:往上找最近的區塊級祖先,取其純文字
  function getContext(selection) {
    let node = selection.anchorNode;
    if (!node) return "";
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    const blockTags = new Set([
      "P", "LI", "TD", "TH", "BLOCKQUOTE", "ARTICLE", "SECTION",
      "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "FIGCAPTION", "DD", "DT",
    ]);
    let el = node;
    while (el && el !== document.body && !blockTags.has(el.tagName)) {
      el = el.parentElement;
    }
    const text = (el || node)?.textContent?.replace(/\s+/g, " ").trim() || "";
    if (text.length <= MAX_CONTEXT_LENGTH) return text;
    // 以選取文字為中心截斷
    const sel = selection.toString().trim();
    const idx = text.indexOf(sel);
    const half = Math.floor(MAX_CONTEXT_LENGTH / 2);
    const start = Math.max(0, (idx === -1 ? 0 : idx) - half);
    return text.slice(start, start + MAX_CONTEXT_LENGTH);
  }

  function positionBelow(el, rect) {
    el.style.left = `${Math.max(4, rect.left + window.scrollX)}px`;
    el.style.top = `${rect.bottom + window.scrollY + 6}px`;
  }

  function showTrigger(selection) {
    removeTrigger();
    const text = selection.toString().trim();
    const rect = selection.getRangeAt(0).getBoundingClientRect();
    if (!rect || (rect.width === 0 && rect.height === 0)) return;

    pending = {
      text,
      context: getContext(selection),
      url: location.href,
      title: document.title,
      rect: {
        left: rect.left,
        bottom: rect.bottom,
      },
    };

    triggerBtn = document.createElement("button");
    triggerBtn.className = "trigger";
    triggerBtn.textContent = "✨ 解釋德文";
    positionBelow(triggerBtn, rect);
    // mousedown 會清掉選取,先擋掉
    triggerBtn.addEventListener("mousedown", (e) => e.preventDefault());
    triggerBtn.addEventListener("click", onTriggerClick);
    shadow.appendChild(triggerBtn);
  }

  function onTriggerClick() {
    const req = pending;
    removeTrigger();
    if (!req) return;
    showCard(req);
    chrome.runtime.sendMessage(
      { type: "explain", text: req.text, context: req.context, url: req.url, title: req.title },
      (resp) => {
        if (chrome.runtime.lastError || !resp) {
          renderError(req, { error: "NETWORK" });
        } else if (!resp.ok) {
          renderError(req, resp);
        } else {
          renderResult(req, resp.result);
        }
      }
    );
  }

  function showCard(req) {
    removeCard();
    card = document.createElement("div");
    card.className = "card";
    card.style.left = `${Math.max(4, req.rect.left + window.scrollX)}px`;
    card.style.top = `${req.rect.bottom + window.scrollY + 6}px`;
    card.innerHTML = `
      <div class="word">${escapeHtml(req.text)}</div>
      <div class="row spinner">AI 解釋產生中…</div>
    `;
    shadow.appendChild(card);
  }

  const ERROR_MESSAGES = {
    NO_API_KEY: "尚未設定 Claude API key。",
    AUTH: "API key 無效或沒有權限,請檢查設定。",
    RATE_LIMIT: "請求過於頻繁,請稍後再試。",
    OVERLOADED: "AI 服務目前忙碌,請稍後再試。",
    REFUSAL: "AI 無法處理這段內容,請換一段文字試試。",
    PARSE_ERROR: "回應格式異常,請再試一次。",
    EMPTY_RESPONSE: "沒有收到回應,請再試一次。",
    NETWORK: "連線失敗,請檢查網路。",
    API_ERROR: "API 發生錯誤,請稍後再試。",
  };

  function renderError(req, resp) {
    if (!card) return;
    const msg = ERROR_MESSAGES[resp.error] || ERROR_MESSAGES.API_ERROR;
    const detail = resp.detail ? `<div class="muted">${escapeHtml(resp.detail)}</div>` : "";
    const settingsBtn =
      resp.error === "NO_API_KEY" || resp.error === "AUTH"
        ? `<button class="link" id="open-settings">開啟設定</button>`
        : "";
    card.innerHTML = `
      <div class="word">${escapeHtml(req.text)}</div>
      <div class="row error">${msg}</div>
      ${detail}
      <div class="footer">${settingsBtn}</div>
    `;
    const btn = card.querySelector("#open-settings");
    if (btn) {
      btn.addEventListener("click", () =>
        chrome.runtime.sendMessage({ type: "openOptions" })
      );
    }
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

  function renderResult(req, r) {
    if (!card) return;
    const optionalRow = (label, value) =>
      value
        ? `<div class="row"><span class="label">${label}</span>${escapeHtml(value)}</div>`
        : "";

    card.innerHTML = `
      <div>
        <span class="word">${escapeHtml(r.lemma || req.text)}</span>
        <button class="speak" id="speak-word" title="朗讀單字">🔊</button>
        ${r.pronunciation ? `<span class="ipa">${escapeHtml(r.pronunciation)}</span>` : ""}
        ${r.part_of_speech ? `<span class="pos">${escapeHtml(r.part_of_speech)}</span>` : ""}
        ${r.gender_article ? `<span class="pos">${escapeHtml(r.gender_article)}</span>` : ""}
      </div>
      ${
        r.lemma && r.lemma !== req.text
          ? `<div class="muted">原文:${escapeHtml(req.text)}</div>`
          : ""
      }
      <div class="row"><span class="label">意思</span>${escapeHtml(r.meaning)}</div>
      ${optionalRow("複數", r.plural)}
      ${optionalRow("動詞變化", r.conjugation)}
      ${r.grammar_notes ? `<div class="grammar"><span class="label">文法</span>${escapeHtml(r.grammar_notes)}</div>` : ""}
      ${
        r.example_sentence
          ? `<div class="example">${escapeHtml(r.example_sentence)} <button class="speak" id="speak-example" title="朗讀例句">🔊</button><br><span class="example-zh">${escapeHtml(r.example_translation)}</span></div>`
          : ""
      }
      <div class="footer">
        <button class="save" id="save-btn">⭐ 存入單字表</button>
        <span class="muted" id="save-status"></span>
      </div>
    `;
    card
      .querySelector("#speak-word")
      .addEventListener("click", () => speakGerman(r.lemma || req.text));
    const speakExample = card.querySelector("#speak-example");
    if (speakExample) {
      speakExample.addEventListener("click", () => speakGerman(r.example_sentence));
    }
    card.querySelector("#save-btn").addEventListener("click", async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true;
      await saveEntry(req, r);
      btn.textContent = "✓ 已儲存";
      card.querySelector("#save-status").textContent = "可在工具列圖示查看單字表";
    });
  }

  async function saveEntry(req, r) {
    const { vocab = [] } = await chrome.storage.local.get("vocab");
    vocab.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      word: req.text,
      lemma: r.lemma || "",
      pronunciation: r.pronunciation || "",
      partOfSpeech: r.part_of_speech || "",
      genderArticle: r.gender_article || "",
      plural: r.plural || "",
      conjugation: r.conjugation || "",
      meaning: r.meaning || "",
      grammarNotes: r.grammar_notes || "",
      example: r.example_sentence || "",
      exampleTranslation: r.example_translation || "",
      context: req.context || "",
      url: req.url,
      title: req.title,
      savedAt: new Date().toISOString(),
    });
    await chrome.storage.local.set({ vocab });
  }

  function isValidSelection(text) {
    return (
      text.length > 0 &&
      text.length <= MAX_SELECTION_LENGTH &&
      /\p{L}/u.test(text)
    );
  }

  document.addEventListener("mouseup", (e) => {
    // 在自己的 UI 上操作時不處理
    if (e.target === host) return;
    // 延遲一拍,讓瀏覽器先更新 selection
    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection?.toString().trim() || "";
      if (!selection || selection.rangeCount === 0 || !isValidSelection(text)) {
        removeTrigger();
        return;
      }
      ensureShadowHost();
      showTrigger(selection);
    }, 0);
  });

  document.addEventListener("mousedown", (e) => {
    if (e.target === host) return;
    removeTrigger();
    removeCard();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      removeTrigger();
      removeCard();
    }
  });
})();
