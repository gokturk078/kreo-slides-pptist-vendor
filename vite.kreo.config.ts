import { fileURLToPath, URL } from 'node:url';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Icons from 'unplugin-icons/vite';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';
import IconsResolver from 'unplugin-icons/resolver';
import Components from 'unplugin-vue-components/vite';

function trimKreoBuildWhitespace() {
  return {
    name: 'trim-kreo-build-whitespace',
    closeBundle() {
      const outDir = fileURLToPath(new URL('../../public/vendor/kreoslides', import.meta.url));
      for (const fileName of ['kreo-slides-engine.es.js', 'style.css']) {
        const filePath = join(outDir, fileName);
        const source = readFileSync(filePath, 'utf8');
        writeFileSync(filePath, source.replace(/[ \t]+$/gm, ''), 'utf8');
      }
    },
  };
}

export default defineConfig({
  base: '/vendor/kreoslides/',
  publicDir: false,
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  plugins: [
    vue(),
    Components({
      dirs: [],
      resolvers: [
        IconsResolver({
          prefix: 'i',
          customCollections: ['custom'],
        }),
      ],
    }),
    Icons({
      compiler: 'vue3',
      autoInstall: false,
      customCollections: {
        custom: FileSystemIconLoader('src/assets/icons'),
      },
      scale: 1,
      defaultClass: 'i-icon',
    }),
    trimKreoBuildWhitespace(),
  ],
  css: {
    postcss: {
      plugins: [],
    },
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import '@/assets/styles/variable.scss';
          @import '@/assets/styles/mixin.scss';
        `,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: '../../public/vendor/kreoslides',
    emptyOutDir: true,
    sourcemap: false,
    lib: {
      entry: fileURLToPath(new URL('./kreo/kreo-entry.ts', import.meta.url)),
      name: 'KreoSlidesPptistEngine',
      formats: ['es'],
      fileName: () => 'kreo-slides-engine.es.js',
    },
    rollupOptions: {
      output: {
        entryFileNames: 'kreo-slides-engine.es.js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return 'style.css';
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});
