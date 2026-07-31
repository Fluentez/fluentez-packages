import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        index: 'src/index.ts',
        'use-infinite-scroll-top': 'src/useInfiniteScrollTop.ts',
        'use-scroll-restoration': 'src/useScrollRestoration.ts',
        'use-available-height': 'src/useAvailableHeight.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: false,
    clean: true,
    external: ['react', 'react-dom', 'react-router-dom'],
});
