<template>
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
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useMessage, type FormInst, type FormRules } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import { passwordLogin } from '@/api/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const message = useMessage()

const isLoggingIn = ref(false)
const passwordFormRef = ref<FormInst | null>(null)
const passwordForm = reactive({
  phone: '',
  password: ''
})

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
