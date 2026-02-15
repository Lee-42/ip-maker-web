/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WOWNOW_API_BASE?: string
  readonly VITE_WOWNOW_CHAT_BASE?: string
  readonly VITE_WOWNOW_NFC_BASE?: string
  readonly VITE_GOOGLE_CLIENT_ID?: string
  readonly VITE_BUILD_VERSION?: string
  readonly VITE_CAPGO_UPDATE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>
  export default component
}
