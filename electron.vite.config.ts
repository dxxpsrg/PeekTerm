import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// electron-vite 설정 — main / preload / renderer 3개 빌드 타깃을 한 파일에서 구성한다.
// '@shared' 별칭으로 src/shared(타입·IPC 채널·순수 로직)를 세 영역에서 공유한다.
export default defineConfig({
  main: {
    build: { outDir: 'dist/main' },
    // 네이티브/노드 의존성(node-pty 등)은 번들에서 제외해 런타임에서 require 한다.
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: { '@shared': resolve('src/shared') },
    },
  },
  preload: {
    build: { outDir: 'dist/preload' },
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: { '@shared': resolve('src/shared') },
    },
  },
  renderer: {
    root: 'src/renderer',
    build: {
      outDir: 'dist/renderer',
      rollupOptions: {
        // 터미널 창과 설정 창 — 두 개의 HTML 엔트리.
        input: {
          index: resolve('src/renderer/index.html'),
          settings: resolve('src/renderer/settings.html'),
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: { '@shared': resolve('src/shared') },
    },
  },
});
