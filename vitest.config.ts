import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 只跑專案自己的測試,排除 .claude/skills 內的模板測試
    include: ['tests/**/*.test.ts'],
  },
});
