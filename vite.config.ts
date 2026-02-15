import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
// import vueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    vue(),
    vueJsx(),
    // vueDevTools(), // Vue DevTools 自动在开发环境启用
    // Naive UI 组件自动按需引入
    Components({
      resolvers: [NaiveUiResolver()],
    }),
  ],
  resolve: {
    dedupe: ['@capacitor/core'],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@capacitor/cli': fileURLToPath(new URL('./src/shims/capacitor-cli.ts', import.meta.url)),
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    host: '0.0.0.0', // 允许局域网访问，方便移动端调试
    port: 5173,
    open: true,
  },
})
