# 快速开始

本指南将帮助你快速搭建和运行 WowNow WebApp 项目。

## 📋 前置要求

在开始之前，请确保你的开发环境已安装：

- **Node.js**: >= 18.0.0 (推荐使用 LTS 版本)
- **pnpm**: >= 8.0.0 (推荐的包管理器)
- **Git**: 用于版本控制

### 安装 pnpm

如果你还没有安装 pnpm，可以通过以下命令安装：

```bash
# 使用 npm 安装
npm install -g pnpm

# 或使用 Homebrew (macOS)
brew install pnpm
```

## 🚀 安装步骤

### 1. 克隆项目

```bash
git clone https://github.com/polpo-space/wownow-webapp.git
cd wownow-webapp
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 启动开发服务器

```bash
pnpm dev
```

开发服务器将在以下地址启动：

- **本地访问**: http://localhost:5173
- **局域网访问**: http://[你的IP地址]:5173 (终端会显示)

## 🌐 推荐开发环境

### IDE 设置

推荐使用 [Visual Studio Code](https://code.visualstudio.com/) 并安装以下插件：

- [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) - Vue 3 语言支持
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - 代码检查
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) - 代码格式化

**注意**: 如果之前安装了 Vetur，请禁用它以避免冲突。

### 浏览器设置

推荐使用 Chromium 内核浏览器（Chrome、Edge、Brave 等）并安装：

- [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) - Vue 调试工具
- [启用 Custom Object Formatter](http://bit.ly/object-formatters) - 更好的对象展示

## 📱 移动端调试

### 方法一：真机调试

1. 确保手机和电脑在同一局域网
2. 启动开发服务器：`pnpm dev`
3. 查看终端输出的局域网地址
4. 在手机浏览器中访问该地址

### 方法二：Chrome DevTools 模拟器

1. 打开 Chrome 浏览器
2. 访问 http://localhost:5173
3. 打开开发者工具 (F12)
4. 点击设备切换按钮 (Ctrl/Cmd + Shift + M)
5. 选择想要模拟的设备

## 🛠️ 其他命令

```bash
# 类型检查
pnpm type-check

# 代码检查和修复
pnpm lint

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

## 🎯 下一步

- 了解[开发指南](./development.md)
- 学习[移动端适配方案](../features/mobile-adaptation.md)
- 查看[项目结构](../architecture/project-structure.md)

## ❓ 遇到问题？

如果在安装或运行过程中遇到问题：

1. 检查 Node.js 和 pnpm 版本是否符合要求
2. 删除 `node_modules` 和 `pnpm-lock.yaml` 后重新安装
3. 查看项目 Issue 或创建新的 Issue
4. 参考主项目 [README](../../README.md)

---

*最后更新时间: 2025-12-03*
