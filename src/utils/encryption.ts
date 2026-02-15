const ENCRYPTION_KEY = 'wn-encryption-key'

// 生成固定的加密密钥（基于域名和固定字符串）
async function getEncryptionKey(): Promise<CryptoKey> {
  const keyData = new TextEncoder().encode(ENCRYPTION_KEY + window.location.hostname)
  const hash = await crypto.subtle.digest('SHA-256', keyData)
  return crypto.subtle.importKey(
    'raw',
    hash,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  )
}

// 加密数据
export async function encryptData(data: string): Promise<string> {
  try {
    const key = await getEncryptionKey()
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encodedData = new TextEncoder().encode(data)
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    )
    
    // 将 IV 和加密数据组合并转换为 base64
    const combined = new Uint8Array(iv.length + encrypted.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(encrypted), iv.length)
    
    return btoa(String.fromCharCode(...combined))
  } catch (error) {
    console.warn('Encryption failed:', error)
    return data // 加密失败时返回原数据
  }
}

// 解密数据
export async function decryptData(encryptedData: string): Promise<string> {
  try {
    const key = await getEncryptionKey()
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    )
    
    const iv = combined.slice(0, 12)
    const encrypted = combined.slice(12)
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    )
    
    return new TextDecoder().decode(decrypted)
  } catch (error) {
    console.warn('Decryption failed:', error)
    return encryptedData // 解密失败时返回原数据
  }
}

// 通用的加密存储函数
export async function saveEncryptedData(key: string, data: unknown): Promise<void> {
  try {
    const jsonData = JSON.stringify(data)
    const encryptedData = await encryptData(jsonData)
    localStorage.setItem(key, encryptedData)
  } catch (error) {
    console.warn(`Failed to save encrypted data for key ${key}:`, error)
  }
}

// 通用的解密读取函数
export async function loadEncryptedData<T>(key: string): Promise<T | null> {
  try {
    const saved = localStorage.getItem(key)
    if (!saved) return null
    
    const decryptedData = await decryptData(saved)
    return JSON.parse(decryptedData)
  } catch (error) {
    console.warn(`Failed to load encrypted data for key ${key}:`, error)
    // 如果解密失败，可能是旧格式的数据，尝试直接解析
    try {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : null
    } catch (parseError) {
      console.warn(`Failed to parse saved data as fallback for key ${key}:`, parseError)
      return null
    }
  }
}
