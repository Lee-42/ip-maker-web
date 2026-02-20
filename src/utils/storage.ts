/**
 * 本地存储工具类
 * 封装 localStorage 操作，提供类型安全的方法
 */
import type { ChatRecord } from '@/components/agent-ui/types'
import type { WownowTemplate } from '@/types/template'

// 定义 ChatOutput 接口，避免循环依赖
export interface ChatOutput {
  id: string
  content: string
  imageUrl: string
  styleId: number | null
}

// 定义 RichInput 接口
export interface RichInput {
  text: string
  html: string
}

const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  IS_LOGGED_IN: 'isLoggedIn',
  COUPON_SELECTOR_KEY: 'showCouponSelector',
  CHAT_RECORDS: 'chatRecords',
  CHAT_TEMPLATE: 'chatTemplate',
  CHAT_OUTPUT_LIST: 'chatOutputList',
  CHAT_RICH_INPUT: 'chatRichInput',
  CHAT_UPLOAD_IMAGES: 'chatUploadImages',
  ACTIVE_TAB: 'homeActiveTab',
} as const

export interface StoredUserInfo {
  id: number
  nickname: string
  avatar: string
  mobile?: string
  email?: string
}

/**
 * 存储 Token
 */
export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token)
  } else {
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
  }
}

/**
 * 获取 Token
 */
export function getToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.TOKEN)
}

/**
 * 存储用户信息
 */
export function setUserInfo(userInfo: StoredUserInfo | null): void {
  if (userInfo) {
    localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo))
  } else {
    localStorage.removeItem(STORAGE_KEYS.USER_INFO)
  }
}

/**
 * 获取用户信息
 */
export function getUserInfo(): StoredUserInfo | null {
  const userInfoStr = localStorage.getItem(STORAGE_KEYS.USER_INFO)
  if (!userInfoStr) {
    return null
  }

  try {
    return JSON.parse(userInfoStr) as StoredUserInfo
  } catch (error) {
    console.error('Failed to parse user info from localStorage:', error)
    return null
  }
}

/**
 * 设置登录状态
 */
export function setLoggedIn(isLoggedIn: boolean): void {
  if (isLoggedIn) {
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true')
  } else {
    localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN)
  }
}

/**
 * 获取登录状态
 */
export function getLoggedIn(): boolean {
  return localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true'
}

/**
 * 清除所有认证相关的存储
 */
export function clearAuth(): void {
  localStorage.removeItem(STORAGE_KEYS.TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER_INFO)
  localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN)
}

/**
 * 获取优惠券选择器显示状态
 */
export const getCouponSelectorState = (): boolean => {
  const saved = localStorage.getItem(STORAGE_KEYS.COUPON_SELECTOR_KEY)
  return saved === 'true'
}

/**
 * 设置优惠券选择器显示状态
 */
export const setCouponSelectorState = (show: boolean): void => {
  localStorage.setItem(STORAGE_KEYS.COUPON_SELECTOR_KEY, show.toString())
}

/**
 * 存储聊天记录
 */
export function setChatRecords(chatRecords: ChatRecord[]): void {
  if (chatRecords && chatRecords.length > 0) {
    localStorage.setItem(STORAGE_KEYS.CHAT_RECORDS, JSON.stringify(chatRecords))
  } else {
    localStorage.removeItem(STORAGE_KEYS.CHAT_RECORDS)
  }
}

/**
 * 获取聊天记录
 */
export function getChatRecords(): ChatRecord[] | null {
  const chatRecordsStr = localStorage.getItem(STORAGE_KEYS.CHAT_RECORDS)
  if (!chatRecordsStr) {
    return null
  }

  try {
    return JSON.parse(chatRecordsStr) as ChatRecord[]
  } catch (error) {
    console.error('Failed to parse chat records from localStorage:', error)
    return null
  }
}

/**
 * 存储聊天模板
 */
export function setChatTemplate(template: WownowTemplate | null): void {
  if (template) {
    localStorage.setItem(STORAGE_KEYS.CHAT_TEMPLATE, JSON.stringify(template))
  } else {
    localStorage.removeItem(STORAGE_KEYS.CHAT_TEMPLATE)
  }
}

/**
 * 获取聊天模板
 */
export function getChatTemplate(): WownowTemplate | null {
  const templateStr = localStorage.getItem(STORAGE_KEYS.CHAT_TEMPLATE)
  if (!templateStr) {
    return null
  }

  try {
    return JSON.parse(templateStr) as WownowTemplate
  } catch (error) {
    console.error('Failed to parse chat template from localStorage:', error)
    return null
  }
}

/**
 * 存储聊天输出列表
 */
export function setChatOutputList(outputList: ChatOutput[]): void {
  if (outputList && outputList.length > 0) {
    localStorage.setItem(STORAGE_KEYS.CHAT_OUTPUT_LIST, JSON.stringify(outputList))
  } else {
    localStorage.removeItem(STORAGE_KEYS.CHAT_OUTPUT_LIST)
  }
}

/**
 * 获取聊天输出列表
 */
export function getChatOutputList(): ChatOutput[] | null {
  const outputListStr = localStorage.getItem(STORAGE_KEYS.CHAT_OUTPUT_LIST)
  if (!outputListStr) {
    return null
  }

  try {
    return JSON.parse(outputListStr) as ChatOutput[]
  } catch (error) {
    console.error('Failed to parse chat output list from localStorage:', error)
    return null
  }
}

/**
 * 存储富文本输入内容
 */
export function setChatRichInput(richInput: RichInput): void {
  if (richInput && (richInput.text || richInput.html)) {
    localStorage.setItem(STORAGE_KEYS.CHAT_RICH_INPUT, JSON.stringify(richInput))
  } else {
    localStorage.removeItem(STORAGE_KEYS.CHAT_RICH_INPUT)
  }
}

/**
 * 获取富文本输入内容
 */
export function getChatRichInput(): RichInput | null {
  const richInputStr = localStorage.getItem(STORAGE_KEYS.CHAT_RICH_INPUT)
  if (!richInputStr) {
    return null
  }

  try {
    return JSON.parse(richInputStr) as RichInput
  } catch (error) {
    console.error('Failed to parse chat rich input from localStorage:', error)
    return null
  }
}

/**
 * 存储上传的图片列表
 */
export function setChatUploadImages(images: string[]): void {
  if (images && images.length > 0) {
    localStorage.setItem(STORAGE_KEYS.CHAT_UPLOAD_IMAGES, JSON.stringify(images))
  } else {
    localStorage.removeItem(STORAGE_KEYS.CHAT_UPLOAD_IMAGES)
  }
}

/**
 * 获取上传的图片列表
 */
export function getChatUploadImages(): string[] | null {
  const imagesStr = localStorage.getItem(STORAGE_KEYS.CHAT_UPLOAD_IMAGES)
  if (!imagesStr) {
    return null
  }

  try {
    return JSON.parse(imagesStr) as string[]
  } catch (error) {
    console.error('Failed to parse chat upload images from localStorage:', error)
    return null
  }
}

/**
 * 存储当前激活的标签页
 */
export function setActiveTab(tabId: number): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, tabId.toString())
}

/**
 * 获取当前激活的标签页
 */
export function getActiveTab(): number | null {
  const tabIdStr = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB)
  if (!tabIdStr) {
    return null
  }

  const tabId = parseInt(tabIdStr, 10)
  return isNaN(tabId) ? null : tabId
}

/**
 * 清除所有存储
 */
export function clearAll(): void {
  localStorage.clear()
}
