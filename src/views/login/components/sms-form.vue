<template>
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
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useMessage, type FormInst, type FormRules } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import { smsLogin, sendSMSCode } from '@/api/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const message = useMessage()

const isLoggingIn = ref(false)
const isSendingCode = ref(false)
const countdown = ref(0)

const codeFormRef = ref<FormInst | null>(null)
const codeForm = reactive({
  phone: '',
  code: ''
})

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
  } catch (err) {
    message.error((err as Error).message || 'Error sending code')
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
      authStore.login({
        token: res.data.token,
        user: res.data.user,
        expiresIn: 7200 // Default 2h
      })
      message.success('Welcome back!')
      router.push('/')
    } else {
      message.error(res.message || 'Login failed')
    }
  } catch (err) {
    message.error((err as Error).message || 'Login error')
  } finally {
    isLoggingIn.value = false
  }
}
</script>
