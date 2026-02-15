import { apiClient, type APIResponse } from '@/utils/api-client'
import type {
  WownowBanner,
  CouponListReq,
  CouponListResp,
  CampaignDetail,
  ReceiveCouponReq,
  ReceiveCouponResp,
} from '@/types/promotion'
import type { PageRes } from '@/api/asset'

// 获取 Banner 列表
export function getBannerList(placement: string): Promise<APIResponse<PageRes<WownowBanner[]>>> {
  return apiClient.get<PageRes<WownowBanner[]>>('/v1/banner/list', {
    params: { placement },
    skipAuth: true,
  })
}

// 获取活动详情
export function getCampaignDetail(campaignUid: string): Promise<APIResponse<CampaignDetail>> {
  return apiClient.get<CampaignDetail>(`/v1/campaign/info?campaignUid=${campaignUid}`)
}

// 获取用户优惠券列表
export function getCouponList(params: CouponListReq): Promise<APIResponse<CouponListResp>> {
  return apiClient.get<CouponListResp>('/v1/user/coupon', {
    params: { ...params },
  })
}

// 领取优惠券
export function receiveCoupon(body: ReceiveCouponReq): Promise<APIResponse<ReceiveCouponResp>> {
  return apiClient.post<ReceiveCouponResp>('/v1/campaign/getCoupon', body)
}

// 通过兑换码兑换优惠券
export function receiveCouponByCode(code: string): Promise<APIResponse<ReceiveCouponResp>> {
  return apiClient.post<ReceiveCouponResp>('/v1/campaign/getCouponByCode', { code })
}
