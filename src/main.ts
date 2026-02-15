import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { MotionPlugin } from '@vueuse/motion'

// 引入 Tailwind CSS
import './styles/tailwind.css'

import App from './App.vue'
import router from './router'
// Eruda 移动端调试工具
// 开发环境下自动启用，生产环境下可通过 URL 参数 ?eruda=true 启用
if (import.meta.env.DEV || new URLSearchParams(window.location.search).has('eruda')) {
  import('eruda').then((eruda) => {
    eruda.default.init()
    console.log('Eruda 调试工具已启用')
  })
}

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(MotionPlugin)
app.mount('#app')
