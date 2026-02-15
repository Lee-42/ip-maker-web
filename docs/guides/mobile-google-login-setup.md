# 移动端 Google 登录调试快速指南

## 🚨 问题

在手机上通过局域网 IP（如 `http://192.168.1.100:5173`）访问应用时，Google OAuth 会报错：

```
错误 400: origin_mismatch
```

**原因**：Google OAuth 不允许使用局域网 IP 地址作为授权来源。

---

## ✅ 推荐解决方案：使用 ngrok

### 第 1 步：安装 ngrok

```bash
# macOS
brew install ngrok/ngrok/ngrok

# 或访问 https://ngrok.com/download 下载
```

### 第 2 步：启动应用

```bash
pnpm dev
```

应用会在 `http://localhost:5173` 启动

### 第 3 步：在新终端启动 ngrok

```bash
ngrok http 5173
```

你会看到类似输出：

```
ngrok

Session Status                online
Forwarding                    https://abc123-456-def.ngrok-free.app -> http://localhost:5173

Web Interface                 http://127.0.0.1:4040
```

**记下这个 HTTPS 地址**（如 `https://abc123-456-def.ngrok-free.app`）

### 第 4 步：配置 Google Cloud Console

1. 访问 https://console.cloud.google.com/
2. 选择项目
3. 点击 **APIs & Services** > **Credentials**
4. 编辑你的 OAuth 2.0 客户端 ID（✏️ 图标）
5. 在 **Authorized JavaScript origins** 中点击 **+ ADD URI**
6. 添加刚才的 ngrok URL（如 `https://abc123-456-def.ngrok-free.app`）
7. 点击 **Save**

⏱️ **等待 5-10 分钟**让配置生效

### 第 5 步：在手机上测试

在手机浏览器中访问：`https://abc123-456-def.ngrok-free.app`

✅ 现在可以正常使用 Google 登录了！

---

## 📝 注意事项

### ngrok 免费版限制

- 每次重启 ngrok，URL 会改变（需要重新配置 Google Console）
- 首次访问可能显示 ngrok 警告页面（点击 "Visit Site" 继续）
- 每分钟请求数有限制（通常足够开发使用）

### 获取固定域名（可选）

如果不想每次都修改配置：

1. 访问 https://dashboard.ngrok.com/signup 注册账号（免费）
2. 获取 authtoken：
   ```bash
   ngrok config add-authtoken <your-token>
   ```
3. 认证后可以获得一个固定的子域名

---

## 🎯 替代方案

### 方案 B：在电脑浏览器中测试

如果暂时不需要在真实手机上测试：

1. 启动应用：`pnpm dev`
2. 在 Chrome 中按 `F12` 打开开发者工具
3. 点击设备模拟图标（`Ctrl+Shift+M` / `Cmd+Shift+M`）
4. 选择移动设备（如 iPhone 14 Pro）
5. 在 Google Cloud Console 中添加：`http://localhost:5173`
6. 在 `http://localhost:5173` 测试功能

✅ 优点：简单，无需额外配置
❌ 缺点：不是真实移动设备环境

---

## 🔧 调试技巧

### 使用 eruda 查看日志

应用已经集成了 eruda 移动端调试工具：

1. 在页面右下角点击悬浮按钮
2. 切换到 **Console** 标签
3. 查看 Google SDK 加载日志：
   ```
   [Google SDK] 当前访问来源: https://...
   [Google SDK] 加载成功
   [Google Login] 按钮渲染成功
   ```

### 查看 ngrok 请求详情

访问 http://127.0.0.1:4040 可以查看所有通过 ngrok 的 HTTP 请求。

---

## 📚 相关文档

- [完整 Google OAuth 配置指南](./google-oauth-setup.md)
- [ngrok 官方文档](https://ngrok.com/docs)

---

## 💡 快速命令

```bash
# 终端 1：启动应用
pnpm dev

# 终端 2：启动 ngrok
ngrok http 5173
```

就这么简单！🎉
