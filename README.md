# wownow-webapp

一个基于 Vue 3 + Vite + TypeScript 的现代化 Web 应用，内置移动端适配方案。

## ✨ 特性

- ⚡️ Vue 3 + Vite - 快速的开发体验
- 🎯 TypeScript - 类型安全
- 📱 移动端适配 - postcss-pxtorem + flexible 方案
- 🎨 现代化 UI - 渐变配色、圆角设计
- 🔥 热更新 - 开发时即时预览
- 📦 优化打包 - 生产环境代码优化

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## 📱 移动端适配

本项目采用 **postcss-pxtorem + flexible** 的移动端适配方案：

- 设计稿基准：375px
- 自动 px 转 rem
- 支持多种屏幕尺寸
- 完美适配 iPhone、Android 设备

详细说明请查看 [移动端适配文档](./docs/features/mobile-adaptation.md)

## 📚 文档

完整的项目文档请访问 [文档中心](./docs/INDEX.md)：

- [快速开始](./docs/guides/getting-started.md) - 项目安装和配置
- [开发指南](./docs/guides/development.md) - 开发规范和最佳实践
- [部署指南](./docs/guides/deployment.md) - 生产环境部署
- [移动端适配](./docs/features/mobile-adaptation.md) - 移动端适配方案
- [Google 登录](./docs/features/google-login.md) - Google OAuth 集成
- [项目架构](./docs/architecture/project-structure.md) - 目录结构说明

### 快速开始

开发时直接使用 px 单位，无需手动计算：

```vue
<style scoped>
.container {
  width: 375px; /* 自动转换为 10rem */
  padding: 20px; /* 自动转换为 0.53333rem */
}
</style>
```

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
pnpm install
```

## 环境变量

- 复制 `.env.development.example` / `.env.production.example` 为实际的 `.env.*` 并填入 `VITE_WOWNOW_API_BASE`、`VITE_WOWNOW_CHAT_BASE`、`VITE_WOWNOW_NFC_BASE` 等地址。推荐与线上域名保持一致，例如：

  ```bash
  VITE_WOWNOW_API_BASE=https://api.iwownow.ai/
  ```

  静态资源默认部署在域名根路径，无需额外 CDN base 配置。

- GitHub Actions 的 `Build and Push Docker Images` workflow 会把这些值作为 Docker build args 传入，记得在仓库 **Secrets / Actions variables** 中写入相同名称的 `VITE_*` 变量，以便 `pnpm build` 在 CI 中也能拿到正确的远程 API。

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

开发服务器会自动在 `http://localhost:5173` 启动，并支持局域网访问（方便移动端调试）。

### 移动端调试

本项目已集成 **eruda** 移动端调试工具，开发环境自动启用。

#### 基础调试（局域网）

1. 确保手机和电脑在同一局域网
2. 启动开发服务器：`pnpm dev`
3. 在手机浏览器中访问终端显示的局域网地址（如 `http://192.168.1.100:5173`）
4. 点击页面右下角悬浮按钮打开 eruda 调试面板

#### 测试 Google 登录（需要 ngrok）

⚠️ **注意**：Google OAuth 不支持局域网 IP，需要使用 ngrok 创建 HTTPS 隧道。

详见：**[移动端调试完整指南](./MOBILE_DEBUG.md)**

或使用 Chrome DevTools 的设备模拟器（Ctrl/Cmd + Shift + M）

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint
```
