// URL 验证函数
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

// 从文本中提取链接
export function extractLink(text: string): string | null {
  if (!text) return null

  // 确保 text 是字符串类型
  const textStr = typeof text === 'string' ? text : String(text)
  if (!textStr) return null

  const matches = textStr.match(/\bhttps?:\/\/[^\s]+/i)
  if (!matches) return null

  const sanitized = matches[0].replace(/[\s)\]\}"'<>。。，，！？；：）】》]+$/u, '').trim()
  return isValidUrl(sanitized) ? sanitized : null
}
