const keyInput = document.getElementById("api-key");
const modelSelect = document.getElementById("model");
const statusEl = document.getElementById("status");

chrome.storage.local.get("settings").then(({ settings = {} }) => {
  keyInput.value = settings.apiKey || "";
  if (settings.model) modelSelect.value = settings.model;
});

document.getElementById("toggle-key").addEventListener("click", (e) => {
  const hidden = keyInput.type === "password";
  keyInput.type = hidden ? "text" : "password";
  e.currentTarget.textContent = hidden ? "隱藏" : "顯示";
});

document.getElementById("save").addEventListener("click", async () => {
  await chrome.storage.local.set({
    settings: {
      apiKey: keyInput.value.trim(),
      model: modelSelect.value,
    },
  });
  statusEl.textContent = "✓ 已儲存";
  setTimeout(() => (statusEl.textContent = ""), 2000);
});
