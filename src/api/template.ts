import { apiClient, type APIResponse } from '@/utils/api-client'
import type {
  TemplateListReq,
  PromptStyleLstReq,
  IpTemplate,
  WownowPromptStyle,
  TemplateTagOption,
  WownowTemplate, // Add WownowTemplate to the import list
} from '@/types/template'
import type { PageRes } from './asset'

// 获取模板列表
export function getTemplates(params: any): Promise<APIResponse<{ list: WownowTemplate[]; total: number }>> {
  return apiClient.get('/v1/template/list', { params })
}

// 获取模板详情
export function getTemplateDetail(id: number | string): Promise<APIResponse<WownowTemplate>> {
  return apiClient.get<WownowTemplate>(`/v1/template/detail/${id}`)
}

// 获取风格列表
export function getPromptStyles(
  params?: PromptStyleLstReq,
): Promise<APIResponse<PageRes<WownowPromptStyle[]>>> {
  return apiClient.get<PageRes<WownowPromptStyle[]>>('/v1/promptStyle/list', {
    params: { ...params },
    skipAuth: true,
  })
}

// 获取分类及模板列表
export function getCategoryWithTemplates(
  params?: TemplateListReq,
): Promise<APIResponse<PageRes<any[]>>> {
  return apiClient.get<PageRes<any[]>>('/v1/template/category-with-templates', {
    params: { ...params },
    skipAuth: true,
  })
}

// 获取模板标签选项
export function getTemplateTagOptions(): Promise<APIResponse<{ list: TemplateTagOption[] }>> {
  return apiClient.get('/v1/template/tag-options', {
    skipAuth: true,
  })
}
