# 阿里云 CDN 部署方案（iwownow.ai）

本方案覆盖 `https://iwownow.ai` 的全站 CDN 落地：Vite 产物默认以根路径 `/` 发布（无须 `VITE_CDN_BASE`），静态资源走阿里云 CDN 缓存，动态推荐等实时数据通过“回源 API”处理。内容包含域名接入、构建产物、缓存策略、CI/CD、验证与回滚。

## 1. 目标与角色划分

| 角色 | 域名 | 内容 | 说明 |
| --- | --- | --- | --- |
| 入口站点 | `iwownow.ai` / `www.iwownow.ai` | Vite 构建后的静态站点（`dist/`） | 走阿里云 CDN，命中率 > 95% |
| 静态备源 | `static-origin.iwownow.ai`（ECS/OSS） | CDN 回源目录，默认只对 CDN 开放 | 用于上传最新构建包 |
| 回源 API | `api.iwownow.ai` | 推荐、用户态接口 | 由 CDN 转发至应用服务器，按需缓存 |

> ICP/备案、域名所有权需在阿里云完成；`iwownow.ai` 和子域名需可控。

## 2. 构建与环境变量

1. 复制 `.env.production.example` 为 `.env.production`（或 `.env.staging` 等），只需配置 API 相关变量：
   ```bash
   VITE_WOWNOW_API_BASE=https://api.iwownow.ai/
   VITE_WOWNOW_CHAT_BASE=...
   VITE_WOWNOW_NFC_BASE=...
   ```
   静态资源始终以根路径输出，无需额外 CDN base 配置。
2. 运行 `pnpm build --mode production`，产物位于 `dist/`。
3. 使用 `pnpm preview --host` 回归路由、懒加载与 API 代理，记录手工验证步骤供 PR/发布使用。

## 3. 阿里云 CDN 配置

1. **创建加速域名**：在“阿里云 CDN → 域名管理 → 新增”，选择“全站加速/DCDN”，填入 `iwownow.ai`、`www.iwownow.ai`，源站指向静态备源（ECS IP、SLB、或 OSS 域）。
2. **HTTPS/TLS**：申请或上传证书绑定 `iwownow.ai`/`www`，开启强制 HTTPS、HSTS，禁用 TLS 1.0。
3. **缓存策略**：`index.html` 缓存 30~60 秒；`*.js/*.css/*.woff2/assets/**` 缓存 ≥30 天（带 hash）；`/api/*` 0 秒或按需短缓存。开启 Gzip/Brotli、Range，关闭目录浏览。
4. **智能回源与健康检查**：开启回源 HOST 重写为 `static-origin.iwownow.ai`，配置健康检查（如 `/healthz.txt`）。
5. **DNS 切换**：`@`、`www` CNAME 到阿里云接入点，`api` CNAME 到全站加速或 SLB；可开启“权威 DNS 回源加速”。

## 4. 回源 API（动态推荐）策略

1. `api.iwownow.ai` 接入全站加速/DCDN，源站指向应用服务器 / K8s Ingress。
2. 推荐接口可按 `userId`/`scene` 设 5–15 秒短缓存；下单、登录等实时接口直接回源。
3. 可用边缘脚本/云函数做简单 A/B 和兜底，减少源站压力；透出 `x-cache`、`x-request-id` 便于排查。
4. 内网服务可用“内网回源 + 私网 SLB”隔离公网。

## 5. 部署流程

1. **构建**：`pnpm build --mode production`，确认 `dist/` 体积与 hash 正常。
2. **上传源站**（示例，ECS/Nginx）：
   ```bash
   rsync -av --delete dist/ deploy@static-origin.iwownow.ai:/srv/www/wownow/releases/20240516/
   ssh deploy@static-origin.iwownow.ai "ln -sfn /srv/www/wownow/releases/20240516 /srv/www/wownow/current && sudo systemctl reload nginx"
   ```
3. **CDN 刷新 / 预热**：刷新 `index.html` 与入口目录 `/`，预热核心 SPA 路由与首屏 JS。
4. **灰度切流**：先切 `www` 再切根域，按 20%→50%→100% 观察；必要时用阿里云流量比例做灰度。
5. **自动化**：CI 侧运行 `pnpm install && pnpm lint && pnpm type-check && pnpm build` 产出 artifact；运维流水线从 artifact 上传到源站并调用阿里云刷新/预热 API。

## 6. CI/CD（GitHub Actions）

- **Workflows**：
  - `.github/workflows/docker-build.yml`：推送到 `main`/`v*` 构建并推送镜像，`VITE_*` API 变量作为 build args。
  - `.github/workflows/oss-cdn-release.yml`：推 tag 或手动触发，构建 `dist/` 并上传到绑定 CDN 的 OSS 桶，支持 `objectPrefix` 输入（可选）控制上传路径。

- **必需 Secrets**：

  | Secret | 用途 |
  | --- | --- |
  | `VITE_WOWNOW_API_BASE` / `VITE_WOWNOW_CHAT_BASE` / `VITE_WOWNOW_NFC_BASE` | 前端 API 地址 |
  | `OSS_ENDPOINT` | OSS 访问域名，如 `oss-cn-shanghai.aliyuncs.com` |
  | `OSS_BUCKET` | OSS 桶名 |
  | `OSS_ACCESS_KEY_ID` / `OSS_ACCESS_KEY_SECRET` | 上传凭证（建议使用 RAM 用户） |

- **使用说明**：
  1. 推 tag（`v*`）或手动 dispatch；如需上传到子目录，输入 `objectPrefix`（例：`releases/v1.2.3/`），留空则上传到桶根。
  2. Workflow 执行 `pnpm build`，使用 `ossutil64` 将 `dist/` 上传到 `oss://<bucket>/<prefix>/`。确保 CDN 源站指向该桶/目录，必要时执行 CDN 刷新/预热。
  3. Actions Summary 中查看上传日志；如需 CDN 刷新可在后续步骤或运维流水线调用阿里云 CDN API。

- **验证**：确认 CDN 已能加载 `index.html` 与 `/assets/...`，必要时用 DevTools “Disable Cache” 验证回源逻辑。

## 7. 验证清单

- `https://iwownow.ai` / `www` / `api` 通过 TLS 1.2+，证书健康。
- Lighthouse ≥ 90/90/100（本地 + CDN 实测）。
- 静态资源命中率 ≥95%，推荐接口命中率 ≥40%。
- DevTools 开启 “Disable Cache” 验证回源逻辑；`pnpm preview` 行为与 CDN 一致。
- 日志：阿里云日志服务开启，`x-request-id` 回传至前端便于定位。

## 8. 回滚策略

1. 源站保留 ≥2 套版本目录（如 `releases/<tag>`），`current` 指向线上版本。
2. CDN 刷新脚本支持 `--version` 快速切换目录。
3. API 层用开关/流量镜像（如 `recommendation.v2`）控制新逻辑。
4. 保留未 CDN 的内部旁路域名便于紧急验证源站。

## 9. 常见问题

- **路径 404**：确认 CDN 源站目录与版本软链一致，检查 Nginx/后端代理是否放行 `/assets` 等静态路径。
- **缓存未刷新**：确保新的 hashed 文件已上传并执行 CDN 刷新或使用版本目录+软链回滚策略。
- **多环境**：`pnpm build --mode staging` + `.env.staging` 可为 QA/灰度提供独立 API 域名与回源路径。

---

- **文档维护人**：Infra @ WowNow  
- **最近更新**：2025-12-04（首次创建）
