import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    // 页面切换时，滚动到顶部
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/index.vue'),
      meta: {
        showDefaultBackground: false,
      },
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/home/index.vue'),
      meta: {
        showDefaultBackground: false,
      },
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('@/views/chat/index.vue'),
      meta: {
        showDefaultBackground: false,
      },
    },
    {
      path: '/workspace/:id',
      name: 'workspace',
      component: () => import('@/views/workspace/index.vue'),
      meta: {
        showDefaultBackground: false,
      },
    },
  ],
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isLoggedIn = authStore.isLoggedIn

  if (!isLoggedIn && to.name !== 'login') {
    // 如果用户未登录且目标路由不是登录页，则重定向到登录页
    next({ name: 'login' })
  } else {
    // 如果用户已登录或目标是登录页，则正常放行
    next()
  }
})

// 全局后置守卫
router.afterEach(() => {})

export default router
