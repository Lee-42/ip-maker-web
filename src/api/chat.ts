import { APIClient, type APIResponse } from '@/utils/api-client'
import { IPMAKER_CHAT_URL } from '@/lib/constants'
export const apiClient = new APIClient(IPMAKER_CHAT_URL)

export interface Message {
  id: string
  chatId: string
  role: string
  attachments: unknown
  createdAt: string
  parts: Array<{ type: string; text?: string; url?: string | string[]; toolInvocation?: any }>
}

export interface MessageListReq {
  id: string
}

// 聊天列表
export function getChatMessageList(params: MessageListReq): Promise<APIResponse<Message[]>> {
  return apiClient.get<Message[]>(`/v1/chat/${params.id}`)
}
