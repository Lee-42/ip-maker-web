<template>
  <div class="login-page">
    <div class="login-container">
      <n-card class="login-card" :bordered="false" size="large">
        <div class="header">
          <h1 class="title">Welcome Back</h1>
          <p class="subtitle">Sign in to continue to IPMAKER</p>
        </div>

        <n-tabs default-value="password" size="large" justify-content="space-evenly" animated>
          <n-tab-pane name="password" tab="Password Login">
            <password-form />
          </n-tab-pane>

          <n-tab-pane name="email" tab="Email Login">
            <email-form />
          </n-tab-pane>

          <n-tab-pane name="code" tab="Code Login">
            <sms-form />
          </n-tab-pane>
        </n-tabs>

        <social-login />

        <div class="footer">
          <p>
            Don't have an account?
            <n-button text type="primary">Sign up</n-button>
          </p>
        </div>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import PasswordForm from './components/password-form.vue'
import EmailForm from './components/email-form.vue'
import SmsForm from './components/sms-form.vue'
import SocialLogin from './components/social-login.vue'
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

.footer {
  text-align: center;
  margin-top: 32px;
  color: var(--text-color-secondary);
}
</style>
