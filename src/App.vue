<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import LoginModal from '@/components/login-modal.vue'
import {
  NConfigProvider,
  NMessageProvider,
  NDialogProvider,
  NNotificationProvider,
  NGlobalStyle,
  darkTheme,
  NButton,
  NIcon,
  type GlobalTheme,
} from 'naive-ui'
import { Moon, Sunny } from '@vicons/ionicons5'

// Theme State
const theme = ref<GlobalTheme | null>(null)
const themeName = ref<'light' | 'dark'>('light')

const toggleTheme = () => {
  if (themeName.value === 'light') {
    theme.value = darkTheme
    themeName.value = 'dark'
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    theme.value = null
    themeName.value = 'light'
    document.documentElement.setAttribute('data-theme', 'light')
  }
  localStorage.setItem('theme', themeName.value)
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    theme.value = darkTheme
    themeName.value = 'dark'
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    document.documentElement.setAttribute('data-theme', 'light')
  }
})
</script>

<template>
  <n-config-provider :theme="theme">
    <n-global-style />
    <n-message-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <RouterView v-slot="{ Component }">
            <transition name="page" mode="out-in">
              <component :is="Component" />
            </transition>
          </RouterView>
          <LoginModal />

          <!-- Theme Toggle Button -->
          <div class="theme-toggle">
            <n-button circle size="large" @click="toggleTheme">
              <template #icon>
                <n-icon>
                  <moon v-if="themeName === 'light'" />
                  <sunny v-else />
                </n-icon>
              </template>
            </n-button>
          </div>
        </n-notification-provider>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<style>
@import '@/styles/theme.css';

:root {
  /* PC端全局变量 */
}

/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 允许输入框和文本域选择 */
input,
textarea,
[contenteditable='true'] {
  -webkit-user-select: auto;
  user-select: auto;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #ffffff;
}

#app {
  width: 100%;
  min-height: 100dvh;
}

.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.page-enter-to,
.page-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.theme-toggle {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}
</style>
