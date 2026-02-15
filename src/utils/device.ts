/**
 * 设备检测工具函数
 */

/**
 * 检测是否为iOS设备
 */
export const isIOS = (): boolean => {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

/**
 * 检测是否为iOS Safari浏览器
 */
export const isIOSSafari = (): boolean => {
  const ua = navigator.userAgent
  const isIOSDevice = /iPhone|iPad|iPod/i.test(ua)
  const isSafari = /Safari/i.test(ua) && !/Chrome|CriOS|FxiOS/i.test(ua)
  return isIOSDevice && isSafari
}

/**
 * 获取iOS版本号
 */
export const getIOSVersion = (): number | null => {
  const match = navigator.userAgent.match(/OS (\d+)_/)
  return match && match[1] ? parseInt(match[1], 10) : null
}
