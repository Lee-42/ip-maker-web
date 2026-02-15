import { TemplateLabel } from '@/types/template'
import { v4 as uuidv4 } from 'uuid'

// 使用 uuid 库生成 UUID
export const generateUUID = (): string => {
  return uuidv4()
}

export const formatDurationBySecond = (second: number = 0) => {
  const hours = Math.floor(second / 3600)
  const minutes = Math.floor((second % 3600) / 60)
  const seconds = second % 60

  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  } else if (minutes > 0) {
    return `${minutes}分钟`
  } else {
    return `${seconds}秒`
  }
}

export const formatDistance = (meters: number | string) => {
  if (typeof meters === 'string') {
    meters = parseFloat(meters)
  }
  if (meters >= 1000) {
    const km = meters / 1000
    return `${km.toFixed(1)}km`
  }
  return `${Math.round(meters)}m`
}

export const generateRandomString = (length: number): string => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 目前后端返回的时间已经是洛杉矶时区的时间字符串，直接格式化即可，不需要进行时区转换
export const formatDateInUTC8 = (time: string) => {
  if (!time) return ''
  const date = new Date(time)
  if (Number.isNaN(date.getTime())) return time
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric', // 四位数年份 (如: 2025)
    month: 'short', // 缩写月份 (如: Jan, Feb)
    day: 'numeric', // 数字日期 (如: 10)
    hour: '2-digit', // 两位数小时 (如: 08, 14)
    minute: '2-digit', // 两位数分钟 (如: 05, 30)
    // timeZone: 'Etc/GMT+8',  // UTC-8时区
  }
  return new Intl.DateTimeFormat('en-US', options).format(date)
}

export const formatCouponDate = (time: string) => {
  if (!time) return ''
  const date = new Date(time)
  if (Number.isNaN(date.getTime())) return time
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
  return new Intl.DateTimeFormat('en-US', options).format(date)
}

export const getProductShape = ({ label }: { label?: TemplateLabel }) => {
  if (!label) return ''
  const circleLabels = [TemplateLabel.FlatCoin, TemplateLabel.ReliefCoin, TemplateLabel.UVCoin]
  const squareLabels = [
    TemplateLabel.FlatSquareCard,
    TemplateLabel.ReliefSquareCard,
    TemplateLabel.LuxuryFlatSquareCard,
    TemplateLabel.LuxuryReliefSquareCard,
  ]
  const rectLabels = [
    TemplateLabel.FlatCard,
    TemplateLabel.ReliefCard,
    TemplateLabel.NormalCard,
    TemplateLabel.RedEnvelopeCard,
  ]

  return circleLabels.includes(label)
    ? 'Circle'
    : squareLabels.includes(label)
      ? 'Square'
      : rectLabels.includes(label)
        ? 'Rectangle'
        : ''
}

/**
 * Compare two semantic version strings.
 * Returns:
 *   1 if v1 > v2
 *  -1 if v1 < v2
 *   0 if v1 === v2
 */
export const compareVersions = (v1: string, v2: string): number => {
  if (!v1 || !v2) return 0
  const parts1 = v1.split('.').map(Number)
  const parts2 = v2.split('.').map(Number)

  const maxLength = Math.max(parts1.length, parts2.length)

  for (let i = 0; i < maxLength; i++) {
    const num1 = parts1[i] || 0
    const num2 = parts2[i] || 0

    if (num1 > num2) return 1
    if (num1 < num2) return -1
  }

  return 0
}
