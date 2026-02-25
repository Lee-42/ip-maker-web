import { apiClient, type APIResponse } from '@/utils/api-client'
import type { IP } from '@/types/ip'

export interface PageReq {
  page?: number
  pageSize?: number
  pagination?: boolean
}

export interface IPListReq extends PageReq {
  name?: string
}

export interface IPListRes {
  list: IP[]
  total: number
}

// 列表查询
export function getIpList(params: IPListReq): Promise<APIResponse<IPListRes>> {
  return apiClient.get<IPListRes>('/ip/list', { params: { ...params } })
}

// 创建 IP
export function createIp(
  data: Omit<IP, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<APIResponse<IP>> {
  return apiClient.post<IP>('/ip/create', data)
}

// 更新 IP
export function updateIp(data: Partial<IP> & { id: number }): Promise<APIResponse<IP>> {
  return apiClient.post<IP>('/ip/update', data)
}

// 删除 IP
export function deleteIp(id: number): Promise<APIResponse<{ id: number }>> {
  return apiClient.post<{ id: number }>('/ip/delete', { id })
}

