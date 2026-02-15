<template>
  <n-modal
    v-model:show="showModal"
    preset="card"
    :style="{ width: '500px' }"
    title="Sign in to WowNow"
    :mask-closable="true"
    @close="onClose"
    @after-leave="onClose"
  >
    <div class="space-y-6">
      <div class="text-center">
        <p class="text-gray-500">
          Turn your boldest ideas into tangible reality. Create it. Own it.
        </p>
      </div>

      <!-- Google Login -->
      <div v-if="isGoogleLoginAvailable">
        <n-divider>Sign in with</n-divider>
        <div class="flex justify-center">
          <div ref="googleButtonRef" id="google-signin-button" class="w-full flex justify-center"></div>
        </div>
      </div>

      <!-- Phone Login -->
      <div v-if="authMode === 'phone'">
        <n-form ref="formRef" :model="formState" :rules="rules">
          <n-form-item path="phone" label="Phone Number">
            <n-input-group>
              <n-input-group-label>+86</n-input-group-label>
              <n-input
                v-model:value="formState.phone"
                placeholder="Enter your phone number"
                :maxlength="11"
                clearable
              />
            </n-input-group>
          </n-form-item>
          <n-form-item path="code" label="Verification Code">
            <n-input-group>
              <n-input
                v-model:value="formState.code"
                placeholder="Enter code"
                :maxlength="6"
                clearable
              />
              <n-button
                @click="handleSendCode"
                :disabled="isSendingCode || countdown > 0"
                :loading="isSendingCode"
                ghost
              >
                {{ countdown > 0 ? `${countdown}s` : 'Get Code' }}
              </n-button>
            </n-input-group>
          </n-form-item>
          
          <n-button
            type="primary"
            block
            attr-type="button"
            @click="handleSMSLogin"
            :disabled="!isButtonEnabled"
            :loading="isLoggingIn"
            size="large"
          >
            Sign in
          </n-button>
        </n-form>
      </div>

      <!-- Terms -->
      <div class="text-center text-xs text-gray-500 mt-4">
        By continuing, you agree to our
        <n-button text type="primary" size="tiny" @click="onClickUserAgreement">Terms of Service</n-button>
        and
        <n-button text type="primary" size="tiny" @click="onClickPrivacyPolicy">Privacy Policy</n-button>.
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { smsLogin, sendSMSCode } from '@/api/auth'
import type { SMSLoginRequest } from '@/api/auth'
import { useGoogleLogin } from '@/hooks/useGoogleLogin'
import { useMessage, type FormInst } from 'naive-ui'

type AuthMode = 'phone' | 'password' | 'register' | 'wechat'

const router = useRouter()
const authStore = useAuthStore()
const message = useMessage()

const authMode = ref<AuthMode>('phone')
const countdown = ref(0)
const isSendingCode = ref(false)
const isLoggingIn = ref(false)
const googleButtonRef = ref<HTMLDivElement | null>(null)
const formRef = ref<FormInst | null>(null)

const formState = reactive({
  phone: '',
  code: '',
})

const rules = {
  phone: [
    { required: true, message: 'Please enter phone number', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: 'Invalid phone number format', trigger: 'blur' },
  ],
  code: [
    { required: true, message: 'Please enter verification code', trigger: 'blur' },
    { min: 4, message: 'Code length should be at least 4', trigger: 'blur' },
  ],
}

const showModal = computed({
  get: () => authStore.showLoginModal,
  set: (value) => authStore.setShowLoginModal(value),
})

const onSuccess = () => {
  authStore.setShowLoginModal(false)
  resetForm()
  window.location.reload()
}

const {
  isAvailable: isGoogleLoginAvailable,
  initButton: initGoogleButton,
  reset: resetGoogleLogin,
} = useGoogleLogin({
  onSuccess: onSuccess,
  message: message,
})

watch(showModal, (newVal) => {
  if (!newVal) {
    resetForm()
  } else {
    nextTick(() => {
      if (googleButtonRef.value) {
        initGoogleButton(googleButtonRef)
      }
    })
  }
})

const resetForm = () => {
  authMode.value = 'phone'
  formState.phone = ''
  formState.code = ''
  countdown.value = 0
  isSendingCode.value = false
  isLoggingIn.value = false
  resetGoogleLogin()
}

const isButtonEnabled = computed(() => {
  if (authMode.value === 'phone') {
    return /^1[3-9]\d{9}$/.test(formState.phone) && formState.code.length >= 4
  }
  return false
})

const handleSendCode = async () => {
  if (!/^1[3-9]\d{9}$/.test(formState.phone)) {
    message.warning('Please enter a valid phone number')
    return
  }

  if (isSendingCode.value || countdown.value > 0) {
    return
  }

  isSendingCode.value = true

  try {
    const res = await sendSMSCode(formState.phone, 'login')
    if (res.code === 0 && res.data?.success) {
      countdown.value = 60
      message.success('Verification code sent')

      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    } else {
      message.error(res.message || 'Failed to send verification code')
    }
  } catch (error) {
    console.error('Send SMS error:', error)
    message.error('Failed to send verification code')
  } finally {
    isSendingCode.value = false
  }
}

const handleSMSLogin = async () => {
  if (!formState.phone || !formState.code) {
    message.warning('Please enter your phone number and verification code')
    return
  }

  isLoggingIn.value = true

  try {
    const loginData: SMSLoginRequest = {
      phone: formState.phone,
      code: formState.code,
    }
    const res = await smsLogin(loginData)

    if (res.code === 0 && res.data) {
      const { token, user } = res.data

      const userInfo = {
        id: user.id,
        nickname: user.nickname || 'User',
        avatar: user.avatar || '',
        phone: user.phone || '',
      }

      authStore.login({
        user: userInfo,
        token: token,
        expiresIn: 7200,
      })

      message.success('Logged in successfully')
      onSuccess()
    } else {
      if (res.message?.includes('尚未注册')) {
         message.error('This phone number is not registered. Please register first.')
      } else {
         message.error(res.message || 'Login failed. Please check the verification code.')
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Login failed'
    message.error(errorMessage)
    console.error('SMS login error:', error)
  } finally {
    isLoggingIn.value = false
  }
}

const onClose = () => {
  authStore.setShowLoginModal(false)
  resetForm()
}

const onClickUserAgreement = () => {
  authStore.setShowLoginModal(false)
  router.push('/agreement/user')
}

const onClickPrivacyPolicy = () => {
  authStore.setShowLoginModal(false)
  router.push('/agreement/privacy')
}
</script>

<style scoped>
/* Scoped styles can be added here if needed */
</style>
