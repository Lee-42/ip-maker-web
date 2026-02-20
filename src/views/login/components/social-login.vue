<template>
  <div>
    <n-divider class="divider">Or sign in with</n-divider>

    <div class="social-login">
      <!-- WeChat Login -->
      <div class="social-btn wechat" @click="handleWeChatLogin">
        <n-icon size="24" color="#07c160">
          <logo-wechat />
        </n-icon>
      </div>
      <!-- Google Login -->
      <div class="social-btn google">
        <!-- Google button container -->
        <div ref="googleButtonRef" class="google-btn-container"></div>
      </div>
    </div>

    <!-- WeChat QR Code Modal -->
    <n-modal
      v-model:show="showWeChatModal"
      preset="card"
      title="WeChat Login"
      :style="{ width: '360px' }"
      @after-leave="stopWeChatPolling"
    >
      <div class="wechat-qr-container">
        <n-spin :show="loadingQrCode">
          <div v-if="wechatQrCode" class="qr-code">
            <img :src="wechatQrCode" alt="WeChat QR Code" />
          </div>
          <div v-else class="qr-error">
            <p>Failed to load QR code</p>
            <n-button size="small" @click="fetchWeChatQRCode">Retry</n-button>
          </div>
        </n-spin>
        <p class="qr-tip">Scan with WeChat to sign in</p>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMessage } from 'naive-ui'
import { LogoWechat } from '@vicons/ionicons5'
import { getWeChatQRCode, getWeChatLoginStatus, type UserInfo } from '@/api/auth'
import { useGoogleLogin } from '@/hooks/useGoogleLogin'

const router = useRouter()
const authStore = useAuthStore()
const message = useMessage()

const googleButtonRef = ref<HTMLDivElement | null>(null)

// WeChat Logic
const showWeChatModal = ref(false)
const loadingQrCode = ref(false)
const wechatQrCode = ref('')
const wechatScene = ref('')
let wechatPollTimer: number | null = null

const handleWeChatLogin = () => {
  showWeChatModal.value = true
  fetchWeChatQRCode()
}

const fetchWeChatQRCode = async () => {
  loadingQrCode.value = true
  try {
    const res = await getWeChatQRCode()
    if (res.code === 0 && res.data) {
      wechatQrCode.value = res.data.qrcode_url
      wechatScene.value = res.data.scene_str
      startWeChatPolling()
    } else {
      message.error('Failed to get Wechat QR Code')
    }
  } catch (err) {
    message.error('Error loading QR Code')
  } finally {
    loadingQrCode.value = false
  }
}

const startWeChatPolling = () => {
  if (wechatPollTimer) clearInterval(wechatPollTimer)

  wechatPollTimer = window.setInterval(async () => {
    if (!showWeChatModal.value) {
      stopWeChatPolling()
      return
    }

    try {
      const res = await getWeChatLoginStatus(wechatScene.value)
      if (res.code === 0 && res.data) {
        if (res.data.state === 2 && res.data.token && res.data.userInfo) {
          stopWeChatPolling()
          showWeChatModal.value = false
          handleLoginSuccess({
            token: res.data.token,
            user: res.data.userInfo
          })
        } else if (res.data.state === 3) {
          stopWeChatPolling()
          message.warning('QR Code expired, please refresh')
        }
      }
    } catch (err) {
      console.error('WeChat poll error', err)
    }
  }, 2000)
}

const stopWeChatPolling = () => {
  if (wechatPollTimer) {
    clearInterval(wechatPollTimer)
    wechatPollTimer = null
  }
}

// Google Login Integration
const { initButton } = useGoogleLogin({
  onSuccess: () => {
    router.push('/')
  },
  message
})

onMounted(() => {
  if (googleButtonRef.value) {
    initButton(googleButtonRef)
  }
})

onUnmounted(() => {
  stopWeChatPolling()
})

// Shared Success Handler
const handleLoginSuccess = (data: { token: string; user: UserInfo }) => {
  authStore.login({
    token: data.token,
    user: data.user,
    expiresIn: 7200 // Default 2h
  })
  message.success('Welcome back!')
  router.push('/')
}
</script>

<style scoped>
.divider {
  margin: 24px 0;
  color: var(--text-color-secondary);
  font-size: 13px;
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.social-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--hover-bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.social-btn:hover {
  transform: translateY(-2px);
  background-color: var(--active-bg-color);
}

.google {
  width: auto;
  height: auto;
  background: transparent;
}

.google-btn-container {
  min-width: 40px;
}

.wechat-qr-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 0;
}

.qr-code img {
  width: 200px;
  height: 200px;
  border-radius: 8px;
}

.qr-tip {
  margin-top: 16px;
  color: var(--text-color-secondary);
  font-size: 14px;
}

.qr-error {
  width: 200px;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: var(--hover-bg-color);
  border-radius: 8px;
  gap: 12px;
}
</style>
