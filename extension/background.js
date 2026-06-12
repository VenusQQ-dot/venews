// Background service worker:接收 content script 的請求,呼叫 Anthropic Messages API。
// 無打包工具的 MV3 外掛無法使用 npm SDK,因此以 raw HTTP 呼叫;
// CORS 由 manifest 的 host_permissions(https://api.anthropic.com/*)解決。

const API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-opus-4-8";

// 結構化輸出 schema:所有欄位皆為字串,不適用時回空字串,
// 避免 strict schema 對 null 型別的限制。
const EXPLANATION_SCHEMA = {
  type: "object",
  properties: {
    selection_type: {
      type: "string",
      enum: ["word", "phrase", "sentence"],
      description: "選取內容的類型",
    },
    lemma: {
      type: "string",
      description: "單字原形(Grundform)。選取為句子時填核心動詞或關鍵字的原形。",
    },
    part_of_speech: {
      type: "string",
      description: "詞性,以繁體中文表示,例如:名詞、動詞、形容詞、分離動詞",
    },
    gender_article: {
      type: "string",
      description: "名詞的性別與定冠詞,例如 'der'、'die'、'das';非名詞填空字串",
    },
    plural: {
      type: "string",
      description: "名詞複數形,例如 'die Häuser';非名詞或無複數填空字串",
    },
    conjugation: {
      type: "string",
      description: "動詞主要變化:現在式第三人稱單數、過去式(Präteritum)、過去分詞(Partizip II),例如 'geht / ging / ist gegangen';非動詞填空字串",
    },
    meaning: {
      type: "string",
      description: "在此網頁上下文中的意思,以繁體中文說明",
    },
    grammar_notes: {
      type: "string",
      description: "文法說明(繁體中文):格位(Kasus)、句構、為何用這個變化形等,針對此上下文",
    },
    example_sentence: {
      type: "string",
      description: "一個自然的德文例句(不同於原文)",
    },
    example_translation: {
      type: "string",
      description: "例句的繁體中文翻譯",
    },
  },
  required: [
    "selection_type",
    "lemma",
    "part_of_speech",
    "gender_article",
    "plural",
    "conjugation",
    "meaning",
    "grammar_notes",
    "example_sentence",
    "example_translation",
  ],
  additionalProperties: false,
};

const SYSTEM_PROMPT = `你是一位經驗豐富的德文老師,學生的母語是繁體中文。
學生會傳給你他在網頁上選取的德文文字,以及該文字周圍的上下文。
請根據「上下文中的實際用法」解釋,而不是字典式的所有義項:
- 解釋一律使用繁體中文(德文詞彙本身保留德文)。
- 名詞務必標明性別冠詞與複數;動詞務必給出三態變化。
- grammar_notes 聚焦於這段上下文裡值得學的文法點(格位、語序、從句、虛擬式等),簡潔但具體。
- 若選取的是片語或整句,lemma 填句中最值得學的核心字之原形,並在 grammar_notes 解析句構。`;

async function explain({ text, context, url, title }) {
  const { settings = {} } = await chrome.storage.local.get("settings");
  if (!settings.apiKey) {
    return { ok: false, error: "NO_API_KEY" };
  }

  const userMessage = [
    `選取的德文:${text}`,
    context ? `周圍上下文:${context}` : "",
    title ? `網頁標題:${title}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  let resp;
  try {
    resp = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": settings.apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: settings.model || DEFAULT_MODEL,
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        output_config: {
          format: {
            type: "json_schema",
            schema: EXPLANATION_SCHEMA,
          },
        },
        messages: [{ role: "user", content: userMessage }],
      }),
    });
  } catch (e) {
    return { ok: false, error: "NETWORK", detail: String(e) };
  }

  if (!resp.ok) {
    const errorByStatus = {
      401: "AUTH",
      403: "AUTH",
      429: "RATE_LIMIT",
      529: "OVERLOADED",
    };
    let detail = "";
    try {
      const body = await resp.json();
      detail = body?.error?.message || "";
    } catch (_) {
      // 忽略無法解析的錯誤內容
    }
    return {
      ok: false,
      error: errorByStatus[resp.status] || "API_ERROR",
      status: resp.status,
      detail,
    };
  }

  const data = await resp.json();
  if (data.stop_reason === "refusal") {
    return { ok: false, error: "REFUSAL" };
  }

  const textBlock = (data.content || []).find((b) => b.type === "text");
  if (!textBlock) {
    return { ok: false, error: "EMPTY_RESPONSE" };
  }
  try {
    return { ok: true, result: JSON.parse(textBlock.text) };
  } catch (_) {
    return { ok: false, error: "PARSE_ERROR" };
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "explain") {
    explain(message).then(sendResponse);
    return true; // 非同步回覆
  }
  if (message?.type === "openOptions") {
    chrome.runtime.openOptionsPage();
  }
});
