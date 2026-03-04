import { apiClient, type APIResponse } from '@/utils/api-client'

export interface PageReq {
  page?: number
  size?: number
}

export interface InspoListReq extends PageReq {
  status?: number
  keyword?: string // 假设后端支持关键字搜索
}

export interface Inspo {
  id: number
  title: string
  type: 'text' | 'image'
  content: string
  status: number
  createdAt: string
  updatedAt: string
}

export interface InspoListRes {
  total: number
  list: Inspo[]
}

// 获取灵感列表
export function getInspoList(params: InspoListReq): Promise<APIResponse<InspoListRes>> {
  return apiClient.get<InspoListRes>('/inspo', { params: { ...params } })
}

// 获取单条灵感详情
export function getInspoDetail(id: number): Promise<APIResponse<Inspo>> {
  return apiClient.get<Inspo>(`/inspo/${id}`)
}

// 创建灵感
export function createInspo(
  data: Pick<Inspo, 'title' | 'type' | 'content'>,
): Promise<APIResponse<{ id: number }>> {
  return apiClient.post<{ id: number }>('/inspo', data)
}

// 更新灵感（修改内容或状态）
export function updateInspo(
  data: Partial<Pick<Inspo, 'title' | 'type' | 'content' | 'status'>> & { id: number },
): Promise<APIResponse<Record<string, never>>> {
  return apiClient.put<Record<string, never>>(`/inspo/${data.id}`, data)
}

// 删除灵感
export function deleteInspo(id: number): Promise<APIResponse<Record<string, never>>> {
  return apiClient.delete<Record<string, never>>(`/inspo/${id}`)
}
