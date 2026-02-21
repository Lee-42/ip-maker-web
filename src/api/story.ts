import { apiClient, type APIResponse } from '@/utils/api-client'
import type { Story } from '@/types/story'

export interface PageReq {
  page?: number
  pageSize?: number
  pagination?: boolean
}

export interface StoryListReq extends PageReq {
  ipId: number
  title?: string
}

export interface StoryListRes {
  list: Story[]
  total: number
}

// 列表查询
export function getStoryList(params: StoryListReq): Promise<APIResponse<StoryListRes>> {
  return apiClient.get<StoryListRes>('/story/list', { params: { ...params } })
}

// 创建 Story
export function createStory(
  data: Omit<Story, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<APIResponse<Story>> {
  return apiClient.post<Story>('/story/create', data)
}

// 更新 Story
export function updateStory(data: Partial<Story> & { id: number }): Promise<APIResponse<Story>> {
  return apiClient.post<Story>('/story/update', data)
}

// 删除 Story
export function deleteStory(id: number): Promise<APIResponse<{ id: number }>> {
  return apiClient.post<{ id: number }>('/story/delete', { id })
}
