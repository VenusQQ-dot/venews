#!/usr/bin/env bash
# 一次安裝本次對話中收集的所有 Claude Code Skills
# 在你的專案根目錄(或 Claude Code session)執行:bash install-skills.sh
set -e

# -a claude-code:安裝到 Claude Code 的 ./.claude/skills/
# --copy:複製實體檔案(而非 symlink),方便 commit 進 repo
FLAGS="-a claude-code --copy -y"

npx -y skills add https://github.com/vercel-labs/skills --skill find-skills $FLAGS
npx -y skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices $FLAGS
npx -y skills add https://github.com/anthropics/skills --skill frontend-design $FLAGS
npx -y skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines $FLAGS
npx -y skills add https://github.com/remotion-dev/skills --skill remotion-best-practices $FLAGS
npx -y skills add https://github.com/obra/superpowers --skill brainstorming $FLAGS
npx -y skills add https://github.com/vercel-labs/agent-browser --skill agent-browser $FLAGS
npx -y skills add https://github.com/browser-use/browser-use --skill browser-use $FLAGS
npx -y skills add https://github.com/supabase/agent-skills --skill supabase-postgres-best-practices $FLAGS
npx -y skills add cloudflare/skills --skill '*' $FLAGS
npx -y skills add redis/agent-skills --skill '*' $FLAGS
npx -y skills add https://github.com/vercel-labs/agent-skills --skill vercel-composition-patterns $FLAGS
npx -y skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-native-skills $FLAGS
npx -y skills add https://github.com/sleekdotdesign/agent-skills --skill sleek-design-mobile-apps $FLAGS
npx -y skills add ibelick/ui-skills --skill '*' $FLAGS
npx -y skills add https://github.com/anthropics/skills --skill pdf $FLAGS
npx -y skills add https://github.com/coreyhaines31/marketingskills --skill seo-audit $FLAGS
npx -y skills add https://github.com/sanyuan0704/code-review-expert --skill code-review-expert $FLAGS

echo "全部安裝完成!Skills 位於 ./.claude/skills/"
