# Android APK 构建指南

本文档介绍了如何构建 Android Release 版本的 APK 文件。

## 前置准备

1.  **环境要求**:
    - Node.js (推荐 v20+)
    - pnpm
    - Java JDK 21 (Capacitor 8 要求)
    - Android Studio (最新版)
    - Android SDK Command-line Tools

2.  **签名文件 (Keystore)**:
    - 确保 `android/app/` 目录下存在 `my-release-key.keystore` 文件。
    - 如果不存在，请联系管理员获取，或者自行生成（仅限测试）。
    - 注意：不要将生产环境的 Keystore 提交到 Git 仓库（除非是私有仓库且团队允许）。

## 版本管理

在构建新包之前，请检查版本号：

1.  **原生版本 (`android/app/build.gradle`)**:
    - `versionCode`: 整数，必须比上一个版本大（例如 `1` -> `2`）。Google Play 强制要求。
    - `versionName`: 字符串，展示给用户（例如 `"1.0.0"`）。

    ```gradle
    defaultConfig {
        versionCode 2
        versionName "1.1.0"
    }
    ```

2.  **Web 版本 (`package.json`)**:
    - 建议保持与 `versionName` 一致，方便追踪。

## 构建步骤

### 方法一：使用一键脚本 (推荐)

项目内置了构建脚本，会自动执行构建前端、同步 Capacitor 配置、并调用 Gradle 打包。

```bash
npm run genapk
# 或者
pnpm genapk
```

该命令执行了以下操作：

1.  `vite build`: 构建 Vue 前端资源到 `dist/`。
2.  `npx cap sync`: 将 `dist/` 资源同步到 `android/app/src/main/assets/public`，并更新插件配置。
3.  `./gradlew assembleRelease`: 调用 Android 构建工具生成 Release 包。

### 方法二：手动分步构建

如果你需要更细粒度的控制，或者想在 Android Studio 中调试：

1.  **构建前端资源**:

    ```bash
    pnpm build
    ```

2.  **同步到 Android 项目**:

    ```bash
    npx cap sync android
    ```

3.  **打开 Android Studio 打包**:

    ```bash
    npx cap open android
    ```

    - 在 Android Studio 中，点击菜单 `Build` -> `Generate Signed Bundle / APK`。
    - 选择 `APK` -> `Release`。
    - 配置 Keystore 路径和密码（如果 `build.gradle` 已配置，可以直接点击右侧 Gradle 面板的 `assembleRelease` 任务）。

## 构建产物

构建成功后，APK 文件位于：

```
android/app/build/outputs/apk/release/app-release.apk
```

## 常见问题

### 1. 签名错误

如果提示 Keystore 密码错误或文件不存在：

- 检查 `android/app/build.gradle` 中的 `signingConfigs` 配置。
- 确保 `my-release-key.keystore` 文件在正确的位置。
- 默认配置（开发用）：
  - Store Password: `wownow`
  - Key Alias: `my-key-alias`
  - Key Password: `wownow`

### 2. Java 版本错误

如果报错 `Unsupported class file major version 65` 或类似 Java 版本问题：

- 确保你的 `JAVA_HOME` 环境变量指向 JDK 21。
- 在 Android Studio 中检查 `Settings` -> `Build, Execution, Deployment` -> `Build Tools` -> `Gradle` -> `Gradle JDK` 是否为 JDK 21。

### 3. 插件未找到

如果报错找不到某些 Capacitor 插件：

- 确保你运行了 `pnpm install`。
- 确保运行了 `npx cap sync`。
- 不要随意删除 `android/capacitor.settings.gradle` 中的自动生成代码。
