import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'ai.iwownow.app',
  appName: 'wownow-webapp',
  webDir: 'dist',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '417057820149-rngjecalnjffjt3c5pshbvvn50o06lee.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
    CapacitorUpdater: {
      autoUpdate: false,
      statsUrl: ''
    },
  },
}

export default config
