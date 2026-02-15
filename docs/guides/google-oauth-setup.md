# Google OAuth 配置指南

## 问题：origin_mismatch 错误

当在移动设备上通过局域网访问应用时，可能会遇到 Google OAuth 的 `origin_mismatch` 错误：

```
禁止访问：发生了授权错误
您无法登录此应用，因为它不符合 Google 的 OAuth 2.0 政策的规定。
错误 400： origin_mismatch
```

## 原因

Google OAuth 要求在 Google Cloud Console 中明确注册所有可能访问应用的来源 URL。

⚠️ **重要限制**：Google OAuth **不允许**使用局域网 IP 地址（如 `http://192.168.x.x:5173` 或 `http://10.0.x.x:5173`）

### Google 允许的来源

✅ **允许**：

- `http://localhost:5173` - 本地访问
- `http://127.0.0.1:5173` - 本地 IP 访问
- `http://localhost:任意端口` - 本地其他端口
- `https://yourdomain.com` - 生产环境域名（必须 HTTPS）
- `https://xxx.ngrok-free.app` - ngrok 或类似隧道服务

❌ **不允许**：

- `http://192.168.x.x:5173` - 局域网 IP
- `http://10.0.x.x:5173` - 局域网 IP
- `http://172.16.x.x:5173` - 局域网 IP

## 解决方案

由于 Google 不允许使用局域网 IP，我们需要采用其他方式在手机上测试 Google 登录：

---

### 🌟 方案一：使用 ngrok（推荐）

ngrok 可以创建一个临时的 HTTPS 隧道，让你的本地应用通过公网域名访问。

#### 步骤 1：安装 ngrok

**macOS (Homebrew)**

```bash
brew install ngrok/ngrok/ngrok
```

**其他平台**
访问 https://ngrok.com/download 下载安装

#### 步骤 2：启动应用

```bash
pnpm dev
```

应用会在 `http://localhost:5173` 启动

#### 步骤 3：启动 ngrok 隧道

打开新终端窗口：

```bash
ngrok http 5173
```

你会看到类似输出：

```
Session Status                online
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:5173
```

#### 步骤 4：配置 Google Cloud Console

1. 访问 https://console.cloud.google.com/
2. 选择项目 > **APIs & Services** > **Credentials**
3. 编辑 OAuth 2.0 客户端 ID
4. 在 **Authorized JavaScript origins** 中添加：
   ```
   https://abc123.ngrok-free.app
   ```
   （替换为你的实际 ngrok URL）
5. 保存并等待 5-10 分钟生效

#### 步骤 5：在手机上测试

在手机浏览器中访问：`https://abc123.ngrok-free.app`

✅ 优点：

- 真实的 HTTPS 环境
- Google OAuth 完全支持
- 可以分享链接给其他人测试

❌ 缺点：

- 免费版每次重启 URL 会变化（需要重新配置）
- 需要保持 ngrok 进程运行
- 首次访问可能有 ngrok 警告页面（点击 "Visit Site" 继续）

💡 **提示**：可以注册 ngrok 账号获取固定域名，避免频繁修改配置。

---

### 🌟 方案二：使用本地域名（hosts + mDNS）

通过配置本地域名，可以使用类似 `http://myapp.local:5173` 的地址。

#### 步骤 1：修改 Vite 配置

编辑 `vite.config.ts`：

```typescript
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: true,
    // 允许通过域名访问
    strictPort: true,
  },
})
```

#### 步骤 2：配置 hosts 文件（手机端）

**iOS**（需要越狱或使用 App）：

- 使用类似 "DNS Override" 的 App

**Android**：

1. 需要 Root 权限
2. 编辑 `/etc/hosts`
3. 添加：`192.168.1.100 myapp.local`

❌ **缺点**：

- 配置复杂，需要特殊权限
- Google OAuth 可能仍然不接受 `.local` 域名
- 不推荐用于临时测试

---

### 🌟 方案三：在电脑浏览器中测试（最简单）

如果只是为了测试 Google 登录功能，可以直接在电脑浏览器中测试。

#### 步骤 1：启动应用

```bash
pnpm dev
```

#### 步骤 2：打开浏览器开发者工具

在 Chrome/Edge 中：

1. 按 `F12` 打开开发者工具
2. 点击设备模拟图标（Toggle device toolbar）或按 `Ctrl+Shift+M` / `Cmd+Shift+M`
3. 选择移动设备（如 iPhone 14 Pro）

#### 步骤 3：配置 Google Cloud Console

添加来源：

```
http://localhost:5173
```

#### 步骤 4：测试

在 `http://localhost:5173` 测试 Google 登录功能

✅ 优点：

- 最简单，无需额外配置
- 可以使用浏览器的移动设备模拟器
- Google OAuth 完全支持 localhost

❌ 缺点：

- 不是真实的移动设备环境
- 无法测试某些移动端特有功能（触摸、陀螺仪等）

---

### 🌟 方案四：跳过 Google 登录测试（开发模式）

如果暂时不需要测试 Google 登录，可以先使用其他登录方式（手机号、微信）进行开发。

---

### 步骤 1：获取当前访问的来源 URL（仅用于诊断）

1. 在手机上访问应用
2. 打开 eruda 调试工具（点击右下角悬浮按钮）
3. 切换到 **Console** 标签
4. 打开登录弹窗
5. 查找类似这样的日志：
   ```
   [Google SDK] 当前访问来源: http://192.168.1.100:5173
   [Google SDK] 请确保此来源已在 Google Cloud Console 中配置
   ```
6. 记录下这个来源 URL

### 步骤 2：在 Google Cloud Console 中添加授权来源

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 选择你的项目
3. 在左侧菜单中，选择 **APIs & Services** > **Credentials**（API 和服务 > 凭据）
4. 找到你的 OAuth 2.0 客户端 ID，点击编辑（✏️ 图标）
5. 在 **Authorized JavaScript origins**（已获授权的 JavaScript 来源）部分：
   - 点击 **+ ADD URI**（+ 添加 URI）
   - 根据你使用的方案添加相应的 URI：

     **方案一（ngrok）**：

     ```
     https://abc123.ngrok-free.app
     ```

     **方案三（本地浏览器）**：

     ```
     http://localhost:5173
     http://127.0.0.1:5173
     ```

     ⚠️ **注意**：不要添加 `http://192.168.x.x:5173`，Google 不支持！

6. 点击 **Save**（保存）

### 步骤 3：等待生效并测试

- 配置保存后，通常需要等待 **5-10 分钟** 才能生效
- 刷新页面
- 再次尝试 Google 登录

## 开发环境推荐配置

### 使用 localhost 测试

```
http://localhost:5173
http://127.0.0.1:5173
```

### 使用 ngrok 测试（移动设备）

```
https://your-unique-id.ngrok-free.app
```

⚠️ **不要添加局域网 IP**：

```
❌ http://192.168.1.100:5173
❌ http://10.0.0.1:5173
❌ http://172.16.0.1:5173
```

Google OAuth 不支持这些地址！

## 生产环境配置

生产环境必须使用 HTTPS，添加你的实际域名：

```
https://yourdomain.com
https://www.yourdomain.com
```

⚠️ **注意**：生产环境不要添加 `http://` 或本地 IP 地址。

## 快速获取本机 IP 地址

### macOS/Linux

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Windows

```cmd
ipconfig | findstr IPv4
```

### 在应用中查看

打开 eruda 控制台，运行：

```javascript
console.log('当前来源:', window.location.origin)
console.log('当前主机:', window.location.host)
```

## 常见问题

### Q: 为什么 Google 不允许使用局域网 IP？

A: 这是 Google 的安全策略。局域网 IP（192.168.x.x、10.0.x.x）是私有地址，可能被多个不同的网络使用，存在安全风险。

### Q: 我添加了来源，为什么还是报错？

A: 请等待 5-10 分钟让配置生效，然后刷新页面。

### Q: ngrok 免费版够用吗？

A: 对于开发测试完全够用。如果需要固定域名，可以注册账号（免费）并认证。

### Q: ngrok 每次重启 URL 都会变怎么办？

A:

- 方法 1：注册 ngrok 账号并认证，可以获得固定域名
- 方法 2：在 Google Cloud Console 中同时保留多个 ngrok URL
- 方法 3：使用 `ngrok http 5173 --domain=your-fixed-domain.ngrok-free.app`（需要付费版）

### Q: 可以用 frp、localtunnel 等其他隧道服务吗？

A: 可以！只要能提供 HTTPS 公网域名的隧道服务都可以使用。

### Q: 开发环境能用 HTTPS 吗？

A: 可以，但需要配置本地 SSL 证书。对于简单的开发测试，HTTP 已经足够。

### Q: 生产环境部署后需要修改什么？

A: 在 Google Cloud Console 中添加生产域名（必须是 HTTPS），并删除开发环境的 HTTP 来源。

## 相关资源

- [Google Identity Services 文档](https://developers.google.com/identity/gsi/web)
- [OAuth 2.0 调试工具](https://developers.google.com/oauthplayground/)
- [Google Cloud Console](https://console.cloud.google.com/)
