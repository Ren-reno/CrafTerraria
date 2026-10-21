import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // items.json + recipes.json (~2.5 MB) are bundled on purpose for v1, which
    // makes the main chunk large (~250 kB gzipped). Revisit if loading feels slow
    // (RNF01 in docs/01); until then the size warning is only noise.
    chunkSizeWarningLimit: 2500,
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
