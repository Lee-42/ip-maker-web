# 开发指南

本指南介绍了 WowNow WebApp 项目的开发规范、工作流程和最佳实践。

## 📐 开发规范

### 代码风格

项目使用 ESLint 和 Prettier 进行代码规范管理：

```bash
# 检查代码规范
pnpm lint

# 自动修复问题
pnpm lint --fix
```

### TypeScript 使用

- 所有新文件应使用 TypeScript
- 合理使用类型定义，避免使用 `any`
- 公共 API 和组件 Props 必须有明确的类型

```typescript
// ✅ 推荐
interface UserInfo {
  id: string
  name: string
  email: string
}

const user: UserInfo = {
  id: '1',
  name: 'John',
  email: 'john@example.com'
}

// ❌ 避免
const user: any = { ... }
```

### Vue 组件规范

#### 组件命名

- 使用 PascalCase 命名组件文件: `UserProfile.vue`
- 使用 kebab-case 在模板中引用: `<user-profile />`

#### 组件结构

推荐使用以下顺序组织组件：

```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup lang="ts">
// 1. 导入
import { ref, computed, onMounted } from 'vue'
import type { PropType } from 'vue'

// 2. 类型定义
interface Props {
  title: string
  items: Item[]
}

// 3. Props 定义
const props = defineProps<Props>()

// 4. Emits 定义
const emit = defineEmits<{
  update: [value: string]
}>()

// 5. 响应式数据
const count = ref(0)

// 6. 计算属性
const doubleCount = computed(() => count.value * 2)

// 7. 方法
function increment() {
  count.value++
}

// 8. 生命周期
onMounted(() => {
  console.log('Component mounted')
})
</script>

<style scoped>
/* 样式 */
</style>
```

### 样式规范

#### 使用 px 单位

在开发时直接使用设计稿的 px 值，构建时会自动转换为 rem：

```vue
<style scoped>
.container {
  width: 375px; /* 自动转换为 rem */
  padding: 20px;
  font-size: 16px;
}
</style>
```

#### 禁用自动转换

对于不需要适配的元素，使用 `.no-rem` 类名：

```vue
<style scoped>
.no-rem {
  width: 100px; /* 不会被转换 */
}
</style>
```

详细说明请参考[移动端适配文档](../features/mobile-adaptation.md)。

## 🗂️ 文件组织

### 目录结构

```
src/
├── api/          # API 接口
├── assets/       # 静态资源
├── components/   # 公共组件
├── config/       # 配置文件
├── data/         # 静态数据
├── layouts/      # 布局组件
├── router/       # 路由配置
├── stores/       # 状态管理
├── styles/       # 全局样式
├── types/        # TypeScript 类型
├── utils/        # 工具函数
└── views/        # 页面组件
```

### 命名约定

| 类型     | 命名规则            | 示例                    |
| -------- | ------------------- | ----------------------- |
| 组件     | PascalCase          | `UserProfile.vue`       |
| 工具函数 | camelCase           | `formatDate.ts`         |
| 类型文件 | kebab-case          | `user-info.ts`          |
| 样式文件 | kebab-case          | `custom-theme.css`      |
| 常量     | UPPER_SNAKE_CASE    | `API_BASE_URL`          |
| Store    | camelCase           | `useAuthStore`          |
| 组合函数 | camelCase (use 前缀) | `useUserInfo`           |

## 🔄 Git 工作流

### 分支策略

- `main` - 主分支，稳定版本
- `develop` - 开发分支，日常开发
- `feature/*` - 功能分支
- `bugfix/*` - 修复分支
- `hotfix/*` - 紧急修复分支

### 提交规范

使用语义化提交信息：

```bash
# 格式
<type>(<scope>): <subject>

# 类型
feat:     新功能
fix:      修复 bug
docs:     文档更新
style:    代码格式调整（不影响功能）
refactor: 代码重构
perf:     性能优化
test:     测试相关
chore:    构建/工具链相关

# 示例
feat(auth): 添加 Google 登录功能
fix(ui): 修复移动端布局问题
docs: 更新移动端适配文档
```

## 🧪 测试

### 单元测试

```bash
# 运行测试
pnpm test

# 测试覆盖率
pnpm test:coverage
```

### 编写测试

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from './MyComponent.vue'

describe('MyComponent', () => {
  it('renders properly', () => {
    const wrapper = mount(MyComponent, {
      props: { title: 'Hello' }
    })
    expect(wrapper.text()).toContain('Hello')
  })
})
```

## 🎨 UI/UX 规范

### 移动端适配

- 设计稿基准：375px
- 使用 px 单位开发
- 注意安全区域（刘海屏适配）
- 适配横屏场景

### 交互规范

- 按钮点击区域 >= 44px × 44px
- 避免使用 hover 效果（移动端不适用）
- 提供明确的加载和错误状态
- 使用触觉反馈（振动）增强体验

## 📦 状态管理

使用 Pinia 进行状态管理：

```typescript
// stores/user.ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null as UserInfo | null,
    isLoggedIn: false
  }),
  
  getters: {
    userName: (state) => state.userInfo?.name ?? '游客'
  },
  
  actions: {
    async login(credentials: Credentials) {
      // 登录逻辑
    }
  }
})
```

## 🌐 API 调用

### 使用统一的 API 客户端

```typescript
// api/user.ts
import { apiClient } from '@/utils/api-client'

export const userApi = {
  getUserInfo: (id: string) =>
    apiClient.get<UserInfo>(`/users/${id}`),
  
  updateUser: (id: string, data: Partial<UserInfo>) =>
    apiClient.put(`/users/${id}`, data)
}
```

### 错误处理

```typescript
try {
  const user = await userApi.getUserInfo('123')
  // 处理成功响应
} catch (error) {
  // 统一错误处理
  console.error('获取用户信息失败:', error)
}
```

## 🔧 调试技巧

### Vue DevTools

使用 Vue DevTools 查看：
- 组件层级
- 组件状态
- Pinia stores
- 路由信息

### 移动端调试

1. **真机调试**: 使用 Chrome Remote Debugging
2. **模拟器**: Chrome DevTools Device Mode
3. **日志**: 使用 vconsole 或 eruda

```typescript
// 开发环境启用 vconsole
if (import.meta.env.DEV) {
  import('vconsole').then(VConsole => {
    new VConsole.default()
  })
}
```

## 📚 推荐资源

- [Vue 3 官方文档](https://vuejs.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Pinia 官方文档](https://pinia.vuejs.org/)
- [Vite 官方文档](https://vitejs.dev/)

## 🎯 下一步

- 了解[部署指南](./deployment.md)
- 查看[项目架构](../architecture/project-structure.md)
- 探索[功能文档](../features/mobile-adaptation.md)

---

*最后更新时间: 2025-12-03*
