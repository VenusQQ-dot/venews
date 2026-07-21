# OmniRoute 自動容錯設定指南

> 目標:當 Claude 額度用完 / 被限流時,OmniRoute 自動把請求切到備援 AI,你無感、不中斷。
>
> 方案:**Anthropic API key(主要,付費）→ Kiro 免費 Claude（備援一）→ Kimi 免費（備援二）**
>
> 選 API key 而非訂閱代理,是為了**避開 Anthropic 消費者訂閱條款的風險**。

---

## 運作原理

```
你的請求 ─▶ Claude Code ─▶ OmniRoute ─┬─▶ ① Anthropic API key（主要）
                                      │      └─ 餘額不足 402 / 限流 429 ↓ 自動切
                                      ├─▶ ② Kiro（免費 Claude，相容性最好）
                                      │      └─ 免費額度也用完 ↓ 再切
                                      └─▶ ③ Kimi K2（免費，長上下文 / 寫程式）
```

使用 **`priority`（優先）策略**:永遠先用 ①,①回任何錯誤就往下掉到 ②,②也不行再到 ③。
每個請求**只會打到其中一家**,不會雙倍計費。

---

## 前置需求

- Node.js **≥ 22.22.2**(或 24):`node --version`
- **一把** Anthropic API key:<https://console.anthropic.com/>(`sk-ant-...`)
- 備援全部免費,免金鑰或用 OpenRouter 免費款(下方說明)

---

## Step 1 — 安裝並啟動 OmniRoute

```bash
npm install -g omniroute
omniroute setup       # 首次:設管理員密碼（≥8 碼）
omniroute             # 啟動 server（預設 port 20128，會自動開瀏覽器）
```

Dashboard:<http://localhost:20128>

---

## Step 2 — 接上 provider

在 Dashboard **Providers → + Add Provider**:

### ① Anthropic（主要，貼金鑰）
1. 選 **Anthropic**
2. 貼上 `sk-ant-...`
3. **Connect → Test Connection**(綠燈)

> 純指令版(免點介面):
> ```bash
> omniroute setup --non-interactive \
>   --password '你的管理密碼' \
>   --add-provider --provider anthropic --api-key 'sk-ant-...' --test-provider
> ```

### ② Kiro（備援一，免費 Claude，免金鑰）
1. 選 **Kiro AI**
2. 直接 **Connect**(不用貼金鑰)→ **Test Connection**

Kiro 免費提供 Claude Sonnet 4.5 / Opus,和主要模型同血統,切過去體感最接近。

### ③ Kimi（備援二,免費）
Kimi(Moonshot)兩種免費接法,擇一:

- **經 OpenRouter 免費款**:到 <https://openrouter.ai/keys> 拿一把 `sk-or-...`,Dashboard 加 **OpenRouter** provider 並貼金鑰;combo 備援填 `openrouter/moonshotai/kimi-k2:free`。
- **經內建免費 provider**:Dashboard 找 **Qoder**(免費提供 Kimi-K2 等)→ Connect,combo 備援填該 provider 的 Kimi model id。

---

## Step 3 — 建立三層容錯 combo

先看每個 provider 實際的 model id:

```bash
omniroute models                 # 列出所有 provider 的可用模型
omniroute models --search free   # 只看免費款
```

建立 combo(把 `<...>` 換成上面查到的實際 id):

```bash
omniroute combo create claude-failover \
  --strategy priority \
  --targets "anthropic/<claude-model>,kiro/<free-claude-model>,openrouter/moonshotai/kimi-k2:free"

omniroute combo switch claude-failover     # 設為預設
```

- `<claude-model>` 例:`claude-sonnet-4-6`
- `<free-claude-model>` 例:Kiro 上的 `claude-sonnet-4-5`
- 第三層即 Kimi 免費款

> 也可以在 Dashboard 的 **Routing / Combos** 用點選方式建立,效果一樣。

---

## Step 4 — 讓 Claude Code 走 OmniRoute

```bash
omniroute setup-claude      # 產生指向 OmniRoute 的 Claude Code profile
# 或
omniroute launch            # 直接開一個已指向 OmniRoute 的 Claude Code
```

---

## Step 5 — 驗證容錯真的會切

```bash
omniroute health            # 熔斷器 / provider 狀態
omniroute logs --follow     # 發請求時，看它從 anthropic 切到 kiro / kimi
```

---

## 費用說明

| 情況 | 花費 |
| --- | --- |
| Anthropic 正常時 | 只付 Anthropic，和「不設備援」完全一樣 |
| Anthropic 用完 → 切 Kiro / Kimi | **$0**（皆為免費模型） |

- 每個請求只打一家，**不會雙倍計費**。
- OmniRoute 本身免費（開源）。
- 想再保險:可對 Anthropic key 設預算上限(`omni-budget` 技能 / Dashboard），花超過自動擋。

---

## 免費備援的三個代價（老實講）

1. **限流 / 額度**:免費款自己也會被限速或用完 —— 所以疊了兩層(Kiro → Kimi)互相墊背。
2. **隱私**:免費端點常會記錄 / 拿 prompt 去訓練。工作內容敏感時,免費備援要謹慎。
3. **品質 / 相容性**:免費模型多半較弱,Claude Code 的工具呼叫偶爾會卡;Kiro 的免費 Claude 相容性最好,擺第一層備援。

---

## 長駐（開機自動啟動）

```bash
omniroute autostart enable      # Linux 會建立 systemd user service
```

---

## 疑難排解

- `providers test` 回 401 → provider 金鑰錯誤,`keys remove` 後重新 `keys add`
- `combo create` 回 `strategy unknown` → 策略要用 `priority`
- 免費備援也常常 429 → 再多疊一層免費 provider(combo 可放多個 target）
- `omniroute doctor` → 完整健康檢查,列出各項目狀態
