import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

// Foundation test suite: pure logic + server actions with a mocked DB.
// Tests use relative imports, but the app modules under test use the "@"
// path aliases, so those are mapped here. The tsconfig "react" alias is
// intentionally NOT replicated - it points at @types/react (no runtime JS)
// and would break any React import.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['app/**/*.test.ts'],
  },
  resolve: {
    // Only the aliases the test module graph actually resolves at runtime.
    // (types.ts -> @pollConfig -> @types). App code otherwise uses relative
    // imports, so @tripConfig/@actions aren't needed here.
    alias: {
      '@types': resolve(process.cwd(), 'app/types.ts'),
      '@pollConfig': resolve(process.cwd(), 'app/pollConfig.ts'),
    },
  },
})
