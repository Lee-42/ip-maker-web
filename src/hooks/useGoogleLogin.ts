import { ref, type Ref } from 'vue'
import { googleLogin } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'

// Google Identity Services 类型定义
export interface GoogleCredentialResponse {
  credential: string
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string
    callback: (response: GoogleCredentialResponse) => void
    error_callback?: (error: { type: string; message?: string }) => void
    auto_select?: boolean
    cancel_on_tap_outside?: boolean
  }) => void
  renderButton: (
    element: HTMLElement,
    options: {
      theme?: string
      size?: string
      text?: string
      width?: string
      shape?: string
      logo_alignment?: string
    },
  ) => void
  disableAutoSelect: () => void
  revoke: (hint: string, callback?: () => void) => void
}

// 扩展 Window 接口
declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId
      }
    }
  }
}

// Google 登录按钮配置选项
export interface GoogleLoginButtonOptions {
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  logo_alignment?: 'left' | 'center'
  width?: string
}

import type { MessageApi } from 'naive-ui'

// Hook 配置选项
export interface UseGoogleLoginOptions {
  clientId?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
  buttonOptions?: GoogleLoginButtonOptions
  timeout?: number // SDK 加载超时时间（毫秒），默认 5000
  message?: MessageApi
}

export function useGoogleLogin(options: UseGoogleLoginOptions = {}) {
  const authStore = useAuthStore()
  const message = options.message

  // 从环境变量或配置中获取 Client ID
  const clientId = options.clientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

  // 状态管理
  const isAvailable = ref(true) // Google 登录是否可用（网络问题时会设为 false）
  const isLoading = ref(false) // SDK 是否正在加载
  const isLoaded = ref(false) // SDK 是否已加载
  const loadFailed = ref(false) // SDK 是否加载失败

  // 默认按钮配置
  const defaultButtonOptions: GoogleLoginButtonOptions = {
    theme: 'outline',
    size: 'large',
    text: 'signin_with',
    shape: 'rectangular',
    logo_alignment: 'left',
    width: '100%',
  }

  const buttonOptions = { ...defaultButtonOptions, ...options.buttonOptions }
  const timeout = options.timeout || 5000

  /**
   * 动态加载 Google GSI SDK
   */
  const loadSDK = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const currentOrigin = window.location.origin
      console.log('[Google SDK] 当前访问来源:', currentOrigin)
      console.log('[Google SDK] 请确保此来源已在 Google Cloud Console 中配置')

      // 如果已经加载成功
      if (window.google?.accounts) {
        isLoaded.value = true
        console.log('[Google SDK] 已加载')
        resolve()
        return
      }

      // 如果正在加载，等待加载完成
      if (isLoading.value) {
        const checkInterval = setInterval(() => {
          if (isLoaded.value) {
            clearInterval(checkInterval)
            resolve()
          } else if (loadFailed.value) {
            clearInterval(checkInterval)
            reject(new Error('Google SDK 加载失败'))
          }
        }, 100)
        return
      }

      isLoading.value = true
      console.log('[Google SDK] 开始加载...')

      const script = document.createElement('script')
      script.src = `https://accounts.google.com/gsi/client?hl=${navigator.language}`
      script.async = true
      script.defer = true

      // 设置加载超时
      const timeoutId = setTimeout(() => {
        console.error('[Google SDK] 加载超时（可能是网络问题，如在中国大陆无法访问 Google 服务）')
        loadFailed.value = true
        isLoading.value = false
        script.remove()
        isAvailable.value = false
        reject(new Error('Google SDK 加载超时'))
      }, timeout)

      script.onload = () => {
        clearTimeout(timeoutId)
        // 等待 SDK 完全初始化
        const checkSDK = setInterval(() => {
          if (window.google?.accounts) {
            clearInterval(checkSDK)
            isLoaded.value = true
            isLoading.value = false
            console.log('[Google SDK] 加载成功')
            resolve()
          }
        }, 50)

        // 设置 SDK 初始化超时（2秒）
        setTimeout(() => {
          if (!isLoaded.value) {
            clearInterval(checkSDK)
            console.error('[Google SDK] 初始化超时')
            loadFailed.value = true
            isLoading.value = false
            isAvailable.value = false
            reject(new Error('Google SDK 初始化超时'))
          }
        }, 2000)
      }

      script.onerror = () => {
        clearTimeout(timeoutId)
        console.error('[Google SDK] 加载失败（网络错误，可能无法访问 Google 服务）')
        console.warn('[Google SDK] 提示：在中国大陆地区，可能需要使用 VPN 才能访问 Google 服务')
        loadFailed.value = true
        isLoading.value = false
        isAvailable.value = false
        script.remove()
        reject(new Error('Google SDK 加载失败：网络错误'))
      }

      document.head.appendChild(script)
    })
  }

  /**
   * 处理 Google 登录回调
   */
  const handleCredentialResponse = async (response: GoogleCredentialResponse) => {
    if (!response.credential) {
      console.error('Failed to log in with Google: No credential received')
      options.onError?.(new Error('No credential received'))
      return
    }

    const loadingMsg = message?.loading('Logging in...', { duration: 0 })

    try {
      const res = await googleLogin(response.credential)

      if (res.code === 0 && res.data) {
        const { token, userInfo, expiresAt } = res.data

        authStore.login({
          user: userInfo,
          token: token,
          expiresIn: expiresAt,
        })

        loadingMsg?.destroy()
        message?.success('Successfully logged in with Google')
        console.log('Successfully logged in with Google')
        options.onSuccess?.()
      } else {
        loadingMsg?.destroy()
        const error = new Error(res.message || 'Failed to log in with Google')
        console.error(error.message)
        message?.error(error.message)
        options.onError?.(error)
      }
    } catch (error) {
      loadingMsg?.destroy()
      const errorObj = error instanceof Error ? error : new Error('Failed to log in with Google')
      console.error('Google login error:', error)
      message?.error(errorObj.message)
      options.onError?.(errorObj)
    }
  }

  // ... (rest of the file)

  /**
   * 初始化并渲染 Google 登录按钮
   */
  const initButton = async (buttonElement: HTMLElement | Ref<HTMLElement | null>) => {
    if (!clientId) {
      console.warn('[Google Login] 未配置 GOOGLE_CLIENT_ID')
      isAvailable.value = false
      return
    }
    console.log('clientId', clientId)
    const element = buttonElement instanceof HTMLElement ? buttonElement : buttonElement.value
    if (!element) {
      console.warn('[Google Login] 按钮容器不存在')
      return
    }

    try {
      // 动态加载 Google SDK
      await loadSDK()

      if (!window.google?.accounts) {
        console.error('[Google Login] SDK 加载失败')
        isAvailable.value = false
        return
      }

      // 清空容器
      element.innerHTML = ''

      // 初始化 Google OAuth
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false, // 禁用自动选择已登录的账户
        cancel_on_tap_outside: true, // 点击外部区域取消
        error_callback: (error: { type: string; message?: string }) => {
          console.error('[Google Login] OAuth 错误:', error)

          if (error.type === 'popup_closed' || error.type === 'popup_failed_to_open') {
            console.warn('[Google Login] 弹窗被阻止或关闭')
          } else {
            // 如果是授权错误（如 origin_mismatch）
            const currentOrigin = window.location.origin
            const isLocalIP = /^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(
              currentOrigin,
            )

            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
            console.error('🚨 Google OAuth 配置错误')
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
            console.error('当前访问来源:', currentOrigin)
            console.error('')

            if (isLocalIP) {
              console.error('⚠️  检测到局域网 IP 地址！')
              console.error('')
              console.error('❌ Google OAuth 不允许使用局域网 IP（192.168.x.x、10.x.x.x）')
              console.error('')
              console.error('✅ 推荐解决方案：使用 ngrok')
              console.error('')
              console.error('步骤 1: 安装 ngrok')
              console.error('  macOS: brew install ngrok/ngrok/ngrok')
              console.error('  其他: https://ngrok.com/download')
              console.error('')
              console.error('步骤 2: 启动 ngrok')
              console.error('  ngrok http 5173')
              console.error('')
              console.error('步骤 3: 使用 ngrok 提供的 HTTPS 地址访问应用')
              console.error('')
              console.error('详细文档: docs/guides/mobile-google-login-setup.md')
            } else {
              console.error('请按以下步骤解决：')
              console.error('1. 访问 https://console.cloud.google.com/')
              console.error('2. 选择项目 > APIs & Services > Credentials')
              console.error('3. 编辑 OAuth 2.0 客户端 ID')
              console.error('4. 在 "Authorized JavaScript origins" 中添加：')
              console.error(`   ${currentOrigin}`)
              console.error('5. 保存并等待 5-10 分钟生效')
              console.error('')
              console.error('详细文档: docs/guides/google-oauth-setup.md')
            }

            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

            if (import.meta.env.DEV) {
              const message = isLocalIP
                ? `Google 登录不支持局域网 IP\n请使用 ngrok 创建 HTTPS 隧道\n详见控制台说明`
                : `Google 登录配置错误\n请在控制台查看解决方案\n当前来源: ${currentOrigin}`

              console.error(message)
              alert(message)
            }
          }
        },
      })

      // 渲染按钮
      window.google.accounts.id.renderButton(element, buttonOptions)

      console.log('[Google Login] 按钮渲染成功')
    } catch (error) {
      console.error('[Google Login] 初始化失败:', error)
      // 加载失败时，隐藏整个 Google 登录区域（优雅降级）
      isAvailable.value = false

      // 如果是网络错误（如在中国大陆无法访问），静默处理
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes('网络错误') || errorMessage.includes('加载超时')) {
        console.warn('[Google Login] Google 服务不可用，已隐藏登录按钮（可能是网络环境限制）')
      } else {
        console.error('[Google Login] 初始化失败，已隐藏登录按钮')
      }
    }
  }

  /**
   * 清除 Google 账户记忆（登出时调用）
   * 这会禁用自动选择，让用户下次登录时不会看到"使用xxx的身份登录"
   */
  const clearGoogleSession = () => {
    try {
      if (window.google?.accounts?.id) {
        // 禁用自动选择已登录的账户
        window.google.accounts.id.disableAutoSelect()
        console.log('[Google Login] 已清除 Google 账户记忆')
      }
    } catch (error) {
      console.warn('[Google Login] 清除 Google 会话失败:', error)
    }
  }

  /**
   * 重置状态（用于重新尝试加载）
   */
  const reset = () => {
    isAvailable.value = true
    isLoaded.value = false
    isLoading.value = false
    loadFailed.value = false
  }

  return {
    // 状态
    isAvailable,
    isLoading,
    isLoaded,
    loadFailed,
    clientId,
    isNative: false,

    // 方法
    initButton,
    loadSDK,
    handleCredentialResponse,
    clearGoogleSession,
    reset,
  }
}
