<template>
  <div class="login-page">
    <div class="login-container">
      <n-card class="login-card" :bordered="false" size="large">
        <div class="header">
          <h1 class="title">Welcome Back</h1>
          <p class="subtitle">Sign in to continue to WowNow</p>
        </div>

        <n-tabs default-value="password" size="large" justify-content="space-evenly" animated>
          <!-- Password Login -->
          <n-tab-pane name="password" tab="Password Login">
            <n-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" size="large">
              <n-form-item path="phone" label="Phone Number">
                <n-input
                  v-model:value="passwordForm.phone"
                  placeholder="Enter your phone number"
                  :maxlength="11"
                >
                  <template #prefix>+86</template>
                </n-input>
              </n-form-item>
              <n-form-item path="password" label="Password">
                <n-input
                  v-model:value="passwordForm.password"
                  type="password"
                  show-password-on="click"
                  placeholder="Enter your password"
                  @keydown.enter="handlePasswordLogin"
                />
              </n-form-item>
              <n-button
                type="primary"
                block
                size="large"
                :loading="isLoggingIn"
                @click="handlePasswordLogin"
              >
                Sign in
              </n-button>
            </n-form>
          </n-tab-pane>

          <!-- SMS Code Login -->
          <n-tab-pane name="code" tab="Code Login">
            <n-form ref="codeFormRef" :model="codeForm" :rules="codeRules" size="large">
              <n-form-item path="phone" label="Phone Number">
                <n-input
                  v-model:value="codeForm.phone"
                  placeholder="Enter your phone number"
                  :maxlength="11"
                >
                  <template #prefix>+86</template>
                </n-input>
              </n-form-item>
              <n-form-item path="code" label="Verification Code">
                <n-input-group>
                  <n-input
                    v-model:value="codeForm.code"
                    placeholder="Enter 6-digit code"
                    :maxlength="6"
                  />
                  <n-button
                    :disabled="isSendingCode || countdown > 0"
                    :loading="isSendingCode"
                    @click="handleSendCode"
                  >
                    {{ countdown > 0 ? `${countdown}s` : 'Get Code' }}
                  </n-button>
                </n-input-group>
              </n-form-item>
              <n-button
                type="primary"
                block
                size="large"
                :loading="isLoggingIn"
                @click="handleCodeLogin"
              >
                Sign in
              </n-button>
            </n-form>
          </n-tab-pane>
        </n-tabs>

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

        <div class="footer">
          <p>
            Don't have an account? 
            <n-button text type="primary">Sign up</n-button>
          </p>
        </div>
      </n-card>
    </div>

    <!-- WeChat QR Code Modal -->
    <n-modal
      v-model:show="showWeChatModal"
      preset="card"
      title="WeChat Login"
      :style="{ width: '360px' }"
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
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMessage, type FormInst, type FormRules } from 'naive-ui'
import { LogoWechat } from '@vicons/ionicons5'
import {
  passwordLogin,
  smsLogin,
  sendSMSCode,
  getWeChatQRCode,
  getWeChatLoginStatus,
} from '@/api/auth'
import { useGoogleLogin } from '@/hooks/useGoogleLogin'

const router = useRouter()
const authStore = useAuthStore()
const message = useMessage()

// State
const isLoggingIn = ref(false)
const isSendingCode = ref(false)
const countdown = ref(0)
const googleButtonRef = ref<HTMLDivElement | null>(null)

// Forms
const passwordFormRef = ref<FormInst | null>(null)
const passwordForm = reactive({
  phone: '',
  password: ''
})

const codeFormRef = ref<FormInst | null>(null)
const codeForm = reactive({
  phone: '',
  code: ''
})

// Rules
const passwordRules: FormRules = {
  phone: [
    { required: true, message: 'Please enter your phone number', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: 'Invalid phone number format', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Please enter your password', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
  ]
}

const codeRules: FormRules = {
  phone: [
    { required: true, message: 'Please enter your phone number', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: 'Invalid phone number format', trigger: 'blur' }
  ],
  code: [
    { required: true, message: 'Please enter verification code', trigger: 'blur' },
    { len: 6, message: 'Code must be 6 digits', trigger: 'blur' }
  ]
}

// WeChat Logic
const showWeChatModal = ref(false)
const loadingQrCode = ref(false)
const wechatQrCode = ref('')
const wechatScene = ref('')
let wechatPollTimer: number | null = null

// Actions - Password Login
const handlePasswordLogin = async () => {
  try {
    await passwordFormRef.value?.validate()
  } catch {
    return
  }

  isLoggingIn.value = true
  try {
    const res = await passwordLogin({
      phone: passwordForm.phone,
      password: passwordForm.password
    })
    
    if (res.code === 0 && res.data) {
      handleLoginSuccess(res.data)
    } else {
      message.error(res.message || 'Login failed')
    }
  } catch (err: any) {
    message.error(err.message || 'Login error')
  } finally {
    isLoggingIn.value = false
  }
}

// Actions - SMS Code
const handleSendCode = async () => {
  if (!/^1[3-9]\d{9}$/.test(codeForm.phone)) {
    message.warning('Please enter a valid phone number')
    return
  }
  
  isSendingCode.value = true
  try {
    const res = await sendSMSCode(codeForm.phone, 'login')
    if (res.code === 0 && res.data?.success) {
      message.success('Code sent')
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) clearInterval(timer)
      }, 1000)
    } else {
      message.error(res.message || 'Failed to send code')
    }
  } catch (err: any) {
    message.error(err.message || 'Error sending code')
  } finally {
    isSendingCode.value = false
  }
}

const handleCodeLogin = async () => {
  try {
    await codeFormRef.value?.validate()
  } catch {
    return
  }

  isLoggingIn.value = true
  try {
    const res = await smsLogin({
      phone: codeForm.phone,
      code: codeForm.code
    })
    
    if (res.code === 0 && res.data) {
      handleLoginSuccess(res.data)
    } else {
      message.error(res.message || 'Login failed')
    }
  } catch (err: any) {
    message.error(err.message || 'Login error')
  } finally {
    isLoggingIn.value = false
  }
}

// Actions - WeChat Login
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
        // State: 1: Waiting, 2: Scanned/Confirmed (Login Success), 3: Expired
        if (res.data.state === 2 && res.data.token && res.data.userInfo) {
          stopWeChatPolling()
          showWeChatModal.value = false
          // Assuming wechatLogin or direct token usage depending on API
          // The getWeChatLoginStatus might return the token directly if confirmed
          // Or we might need to call wechatLogin. Based on API definitions:
          // existing wechatLogin taking (token, userInfo string) might be for the mobile/redirect flow
          // Let's assume getWeChatLoginStatus returns ready-to-use auth data
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
    // Auth logic is handled inside useGoogleLogin via callback to googleLogin API
    // We just need to redirect after success
    router.push('/')
  },
  message
})

onMounted(() => {
  // Initialize Google Button
  if (googleButtonRef.value) {
    initButton(googleButtonRef)
  }
})

onUnmounted(() => {
  stopWeChatPolling()
})

// Shared Success Handler
const handleLoginSuccess = (data: { token: string; user: any }) => {
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
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--body-bg-color);
  background-image: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
}

.login-container {
  width: 100%;
  max-width: 480px;
  padding: 16px;
}

.login-card {
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  background-color: var(--card-bg-color);
}

.header {
  text-align: center;
  margin-bottom: 32px;
}

.title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--text-color);
}

.subtitle {
  margin: 8px 0 0;
  color: var(--text-color-secondary);
}

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
  /* Google button SDK renders its own constraints, usually needs adjustments */
  width: auto;
  height: auto;
  background: transparent;
}

.google-btn-container {
  min-width: 40px; /* Ensure space for Google's icon-only button if chosen */
}

/* Override Google Button wrapper if needed to make it circular-ish or use icon only config in hook */

.footer {
  text-align: center;
  margin-top: 32px;
  color: var(--text-color-secondary);
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
