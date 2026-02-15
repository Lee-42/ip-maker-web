# Cloudflare Worker Update Server

这个目录包含了一个基于 Cloudflare Workers + R2 的热更新服务后端实现。提供了一个生产可用的、全球加速的更新服务。

## 架构

*   **Cloudflare R2**: 对象存储，用于存放 `version.json` 和 `.zip` 更新包。
*   **Cloudflare Workers**: 无服务器函数，用于处理 HTTP 请求，从 R2 读取文件并返回给客户端，同时处理 CORS 和动态下载链接拼接。

## 前置准备

1.  拥有一个 Cloudflare 账号。
2.  安装 Wrangler CLI (Cloudflare 的命令行工具):
    ```bash
    npm install -g wrangler
    ```
3.  登录 Wrangler:
    ```bash
    wrangler login
    ```

## 部署步骤

### 1. 创建 R2 存储桶

在 Cloudflare Dashboard 中创建一个 R2 Bucket，或者使用命令行：

```bash
wrangler r2 bucket create wownow-updates
```

*注意：如果你使用了不同的 Bucket 名称，请修改 `wrangler.toml` 中的 `bucket_name` 字段。*

### 2. 部署 Worker

在 `scripts/cloudflare-worker` 目录下运行：

```bash
cd scripts/cloudflare-worker
wrangler deploy
```

部署成功后，你会获得一个 Worker 的访问地址，例如 `https://wownow-update-server.<你的子域>.workers.dev`。

## 热更新步骤

### 1. 配置 App

修改 `.env` ，将检查更新的 URL 指向你的 Worker 地址：

```
CAPGO_UPDATE_URL='<worker地址>/version.json';
```

### 2. 发布新版本热更新（完整流程）

#### 步骤 1: 更新版本号

修改项目根目录的 `package.json` 文件，更新版本号：

```json
"version": "1.0.3"
```

#### 步骤 2: 构建并打包

在项目根目录执行：

```bash
pnpm build-zip
```

这个命令会：
- 执行类型检查
- 构建生产版本
- 在项目根目录生成 `dist-<version>.zip` 文件

#### 步骤 3: 更新 version.json

修改 `scripts/capgo-worker/version.json`：

```json
{
  "version": "1.0.3",
  "note": "本次更新说明",
  "filename": "dist-1.0.3.zip"
}
```

*注意：`version.json` 中不需要包含 `download_url`，Worker 会自动根据请求域名拼接。*

#### 步骤 4: 上传到 R2 存储桶

**⚠️ 重要：必须使用 `--remote` 参数上传到远程 R2，否则只会上传到本地模拟环境！**

```bash
# 进入 worker 目录
cd scripts/capgo-worker

# 上传 version.json（必须加 --remote）
wrangler r2 object put capgo-builds/version.json --file=version.json --remote

# 返回项目根目录上传 zip 包（必须加 --remote）
cd ../..
wrangler r2 object put capgo-builds/dist-1.0.3.zip --file=dist-1.0.3.zip --remote
```

#### 步骤 5: 验证上传

在 [Cloudflare R2 控制台](https://dash.cloudflare.com/) 检查 `capgo-builds` 存储桶，确认文件已成功上传。

#### 步骤 6: 测试更新

访问更新服务地址验证配置：
```
https://capgo-update.iwownow.ai/version.json
```

应该返回：
```json
{
  "version": "1.0.3",
  "note": "本次更新说明",
  "filename": "dist-1.0.3.zip",
  "download_url": "https://capgo-update.iwownow.ai/updates/dist-1.0.3.zip"
}
```

### 3. 清理旧版本（可选）

为节省 R2 存储空间，可以删除不再需要的旧版本：

```bash
wrangler r2 object delete capgo-builds/dist-1.0.2.zip --remote
```

## 本地开发

你也可以在本地模拟 Cloudflare 环境进行测试：

```bash
wrangler dev
```

这将启动一个本地服务器（通常在 http://localhost:8787），并尝试连接到你绑定的远程 R2 Bucket（需要登录）。
