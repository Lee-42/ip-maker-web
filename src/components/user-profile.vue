'''<template>
  <div v-if="isLoggedIn && user" class="user-profile">
    <n-dropdown trigger="hover" :options="options" @select="handleSelect">
      <div class="profile-trigger">
        <n-avatar round size="medium" :src="user.avatar" />
        <span class="username">{{ user.nickname }}</span>
      </div>
    </n-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { logout } from '@/api/auth'
import { NDropdown, NAvatar, useMessage } from 'naive-ui'

const router = useRouter()
const authStore = useAuthStore()
const message = useMessage()

const isLoggedIn = computed(() => authStore.isLoggedIn)
const user = computed(() => authStore.user)

const options = [
  {
    label: '退出登录',
    key: 'logout'
  }
]

const handleSelect = async (key: string | number) => {
  if (key === 'logout') {
    try {
      await logout()
      message.success('您已成功退出')
    } catch (error) {
      console.error('退出登录失败:', error)
      message.error('退出登录失败，请稍后重试')
    } finally {
      authStore.logout()
      router.push('/login')
    }
  }
}
</script>

<style scoped>
.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.profile-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-size: 14px;
  color: #333;
}
</style>
'''