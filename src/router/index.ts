import { createRouter, createWebHistory } from 'vue-router'
import { useChatStore } from '@/stores/chat'

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
  next()
})

// 全局后置守卫
router.afterEach(() => {})

export default router
