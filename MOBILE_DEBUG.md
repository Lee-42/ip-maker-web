# 📱 移动端调试指南

## 快速开始

### 1. 启动应用

```bash
pnpm dev
```

应用会在 `http://localhost:5173` 启动，并自动打开浏览器。

### 2. 移动端调试工具

项目已集成 **eruda** 调试工具，在移动端访问时会自动启用：

- 点击页面右下角的悬浮按钮
- 查看 Console、Network、Elements 等信息
- 类似于桌面端的开发者工具

## 在手机上测试（局域网）

### 获取局域网 IP

```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# 输出示例
inet 192.168.1.100 netmask 0xffffff00 broadcast 192.168.1.255
```

### 在手机上访问

确保手机和电脑在同一局域网，在手机浏览器中访问：

```
http://192.168.1.100:5173
```

（替换为你的实际 IP）

### ⚠️ 注意事项

**Google 登录功能**在局域网 IP 下不可用，因为 Google OAuth 不支持局域网地址。

如果需要测试 Google 登录，请查看：[移动端 Google 登录调试指南](./docs/guides/mobile-google-login-setup.md)

## 🎯 测试 Google 登录（使用 ngrok）

### 快速步骤

1. **安装 ngrok**

   ```bash
   brew install ngrok/ngrok/ngrok
   ```

2. **启动应用**

   ```bash
   pnpm dev
   ```

3. **启动 ngrok**（新终端）

   ```bash
   ngrok http 5173
   ```

4. **记录 ngrok URL**

   ```
   Forwarding: https://abc123.ngrok-free.app -> http://localhost:5173
   ```

5. **配置 Google Cloud Console**
   - 访问 https://console.cloud.google.com/
   - APIs & Services > Credentials
   - 编辑 OAuth 2.0 客户端
   - 添加 ngrok URL 到 "Authorized JavaScript origins"
   - 等待 5-10 分钟生效

6. **在手机上访问 ngrok URL**
   ```
   https://abc123.ngrok-free.app
   ```

详细说明：[移动端 Google 登录调试指南](./docs/guides/mobile-google-login-setup.md)

## 📚 更多文档

- [完整文档中心](./docs/INDEX.md)
- [开发指南](./docs/guides/development.md)
- [Google OAuth 配置](./docs/guides/google-oauth-setup.md)

## 🔧 常用命令

```bash
# 启动开发服务器（自动启用 eruda）
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview

# 类型检查
pnpm type-check

# 代码格式化
pnpm lint
pnpm format
```

---

**提示**：开发环境中，eruda 会自动启用。生产环境中，可以通过 URL 参数 `?eruda=true` 启用调试工具。
