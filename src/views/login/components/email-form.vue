<template>
  <n-form ref="emailFormRef" :model="emailForm" :rules="emailRules" size="large">
    <n-form-item path="email" label="Email Address">
      <n-input
        v-model:value="emailForm.email"
        placeholder="Enter your email address"
      />
    </n-form-item>
    <n-form-item path="password" label="Password">
      <n-input
        v-model:value="emailForm.password"
        type="password"
        show-password-on="click"
        placeholder="Enter your password"
        @keydown.enter="handleEmailLogin"
      />
    </n-form-item>
    <n-button
      type="primary"
      block
      size="large"
      :loading="isLoggingIn"
      @click="handleEmailLogin"
    >
      Sign in
    </n-button>
  </n-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useMessage, type FormInst, type FormRules } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import { emailLogin } from '@/api/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const message = useMessage()

const isLoggingIn = ref(false)
const emailFormRef = ref<FormInst | null>(null)
const emailForm = reactive({
  email: '',
  password: ''
})

const emailRules: FormRules = {
  email: [
    { required: true, message: 'Please enter your email address', trigger: 'blur' },
    { type: 'email', message: 'Invalid email format', trigger: ['blur', 'input'] }
  ],
  password: [
    { required: true, message: 'Please enter your password', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
  ]
}

const handleEmailLogin = async () => {
  try {
    await emailFormRef.value?.validate()
  } catch {
    return
  }

  isLoggingIn.value = true
  try {
    const res = await emailLogin({
      email: emailForm.email,
      password: emailForm.password
    })

    if (res.code === 0 && res.data) {
      authStore.login({
        token: res.data.token,
        user: res.data.userInfo,
        expiresIn: new Date(res.data.expiresAt).getTime()
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
