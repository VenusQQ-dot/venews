#!/usr/bin/env bash
# 安裝 5 個「用 Claude Code 做影片 / 動畫」的工具
# 在專案根目錄執行:bash install-video-tools.sh
#
#   工具                 授權                         安裝方式
#   1 HyperFrames        Apache-2.0                   Skill → ./.claude/skills/(進 repo)
#   2 onetake            PolyForm Noncommercial 1.0   Skill → ./.claude/skills/(114MB,.gitignore 排除)
#   3 vox-director       MIT                          Skill → ./.claude/skills/(31MB,.gitignore 排除)
#   4 ClaudeAnimationBase MIT                         獨立專案 → ~/ClaudeAnimationBase
#   5 Lemo-Opuscar       程式 MIT / 文件 CC BY-NC 4.0  Skill → ./.claude/skills/(首次使用時才抓 library 到 ~/lemo-opuscar)
#
# ⚠ onetake 與 Lemo-Opuscar 的文件/風格為「非商用」授權,商用影片需另取得授權。
#
# 參數:
#   --skip-heavy   不裝 onetake / vox-director(省 145MB)
#   --skip-cab     不 clone ClaudeAnimationBase
set -euo pipefail

SKIP_HEAVY=0
SKIP_CAB=0
for arg in "$@"; do
  case "$arg" in
    --skip-heavy) SKIP_HEAVY=1 ;;
    --skip-cab)   SKIP_CAB=1 ;;
    *) echo "未知參數:$arg"; exit 1 ;;
  esac
done

command -v npx >/dev/null || { echo "✗ 需要 Node.js(npx)"; exit 1; }
command -v git >/dev/null || { echo "✗ 需要 git"; exit 1; }

# -a claude-code:安裝到 ./.claude/skills/;--copy:實體檔案;-y:不互動
FLAGS="-a claude-code --copy -y"

echo "▶ 1/5 HyperFrames(HTML → 影片,含 CLI skill)"
npx -y skills add https://github.com/heygen-com/hyperframes --skill hyperframes --skill hyperframes-cli $FLAGS

echo "▶ 5/5 Lemo-Opuscar(多種畫風的程式短片,含浮世繪)"
npx -y skills add https://github.com/lemomo-ai/lemo-opuscar --skill lemo-opuscar $FLAGS

if [ "$SKIP_HEAVY" -eq 0 ]; then
  echo "▶ 2/5 onetake(產品動效短片)— 非商用授權"
  npx -y skills add https://github.com/feitangyuan/onetake --skill onetake $FLAGS
  echo "▶ 3/5 vox-director(Vox 紙拼貼解說影片,需 Atlas Cloud API + ffmpeg)"
  npx -y skills add https://github.com/Alisa0808/vox-director --skill vox-director $FLAGS
else
  echo "⏭ 略過 onetake / vox-director(--skip-heavy)"
fi

if [ "$SKIP_CAB" -eq 0 ]; then
  CAB_DIR="${CLAUDE_ANIMATION_BASE_DIR:-$HOME/ClaudeAnimationBase}"
  echo "▶ 4/5 ClaudeAnimationBase → $CAB_DIR"
  if [ -d "$CAB_DIR/.git" ]; then
    git -C "$CAB_DIR" pull --ff-only || echo "! 無法更新 $CAB_DIR,沿用本機版本"
  else
    git clone --depth 1 https://github.com/JohnHeibel/ClaudeAnimationBase.git "$CAB_DIR"
  fi
  echo "  下一步:cd \"$CAB_DIR\" && npm install,再開 Claude Code 說"
  echo "  「Read ANIMATION_GUIDE.md, then make a 15-second video of ...」"
else
  echo "⏭ 略過 ClaudeAnimationBase(--skip-cab)"
fi

# 系統工具檢查(只提示,不自動安裝)
echo
echo "── 系統工具檢查 ──"
for bin in node ffmpeg python3; do
  if command -v "$bin" >/dev/null; then echo "✓ $bin"; else echo "✗ $bin 未安裝(影片輸出需要)"; fi
done

echo
echo "完成。Skills 位於 ./.claude/skills/,重開 Claude Code 後生效。使用說明:docs/video-tools.md"
