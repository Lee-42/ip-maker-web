# 部署指南

本指南介绍如何构建和部署 WowNow WebApp 到生产环境。

## 🏗️ 构建生产版本

### 构建命令

```bash
# 类型检查和构建
pnpm build

# 仅构建（跳过类型检查）
pnpm build-only
```

构建产物将输出到 `dist` 目录。

### 预览构建结果

```bash
pnpm preview
```

这将启动一个本地服务器来预览生产构建，默认地址为 http://localhost:4173。

## 🌐 部署平台

### Vercel 部署（推荐）

#### 方式一：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 部署到生产环境
vercel --prod
```

#### 方式二：通过 GitHub 集成

1. 访问 [Vercel](https://vercel.com)
2. 导入 GitHub 仓库
3. Vercel 会自动检测项目类型并配置

**构建配置**:
- **Framework Preset**: Vite
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`

### Netlify 部署

#### 方式一：拖放部署

1. 运行 `pnpm build`
2. 将 `dist` 文件夹拖放到 [Netlify Drop](https://app.netlify.com/drop)

#### 方式二：Git 集成

创建 `netlify.toml` 配置文件：

```toml
[build]
  command = "pnpm build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 静态服务器部署

#### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Apache 配置

创建 `.htaccess` 文件：

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# 开启 Gzip 压缩
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css application/json application/javascript text/xml application/xml
</IfModule>

# 缓存控制
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

## 🔐 环境变量

### 配置环境变量

创建环境变量文件：

```bash
# .env.production
VITE_API_BASE_URL=https://api.your-domain.com
VITE_APP_TITLE=WowNow WebApp
```

### 在代码中使用

```typescript
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const appTitle = import.meta.env.VITE_APP_TITLE
```

**注意**: 只有以 `VITE_` 开头的变量才会暴露给客户端代码。

## 🚀 性能优化

### 代码分割

Vite 会自动进行代码分割，但你可以手动优化：

```typescript
// 路由懒加载
const routes = [
  {
    path: '/about',
    component: () => import('./views/About.vue')
  }
]
```

### 图片优化

- 使用 WebP 格式
- 提供多种尺寸（响应式图片）
- 使用 CDN 加载图片

```vue
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description">
</picture>
```

### 资源压缩

生产构建已包含以下优化：

- CSS 和 JS 压缩
- Tree-shaking（移除未使用的代码）
- 资源指纹（缓存优化）

### 分析打包体积

```bash
# 安装分析工具
pnpm add -D rollup-plugin-visualizer

# 在 vite.config.ts 中配置
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    vue(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
})

# 构建后会生成可视化报告
pnpm build
```

## 🔍 监控与日志

### 错误监控

集成 Sentry 进行错误追踪：

```typescript
// main.ts
import * as Sentry from '@sentry/vue'

if (import.meta.env.PROD) {
  Sentry.init({
    app,
    dsn: "YOUR_SENTRY_DSN",
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay()
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0
  })
}
```

### 性能监控

使用 Web Vitals：

```typescript
import { onCLS, onFID, onLCP } from 'web-vitals'

function sendToAnalytics(metric) {
  // 发送到分析服务
  console.log(metric)
}

onCLS(sendToAnalytics)
onFID(sendToAnalytics)
onLCP(sendToAnalytics)
```

## 🔄 CI/CD

### GitHub Actions 示例

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build
        run: pnpm build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 📋 部署检查清单

部署前请确认：

- [ ] 运行所有测试 (`pnpm test`)
- [ ] 执行代码检查 (`pnpm lint`)
- [ ] 本地构建成功 (`pnpm build`)
- [ ] 预览构建结果 (`pnpm preview`)
- [ ] 配置正确的环境变量
- [ ] 设置正确的 API 地址
- [ ] 检查移动端适配效果
- [ ] 测试不同浏览器兼容性
- [ ] 配置 HTTPS 证书
- [ ] 设置 CDN（如需要）
- [ ] 配置错误监控
- [ ] 设置性能监控

## 🔧 故障排查

### 常见问题

#### 1. 路由 404 错误

确保服务器配置了回退到 `index.html`。

#### 2. 环境变量未生效

- 检查变量名是否以 `VITE_` 开头
- 确认使用了正确的环境文件
- 重启开发服务器

#### 3. 资源加载失败

检查 `vite.config.ts` 中的 `base` 配置：

```typescript
export default defineConfig({
  base: '/your-app/', // 如果部署在子路径
})
```

## 📚 相关资源

- [Vite 部署文档](https://vitejs.dev/guide/static-deploy.html)
- [Vercel 文档](https://vercel.com/docs)
- [Netlify 文档](https://docs.netlify.com/)
- [Nginx 配置指南](https://nginx.org/en/docs/)

---

*最后更新时间: 2025-12-03*
