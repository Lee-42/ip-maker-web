export interface WownowBanner {
  id: number
  name: string
  imageUrl: string // 图片地址
  placement: string // 展示位置
  mode: string // 模式
  campaignUid: string // 关联活动ID
  campaignName?: string // 关联活动名称
  campaignDescription?: string // 关联活动描述
}

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ONLINE = 'online',
  PAUSED = 'paused',
  ENDED = 'ended',
}

export interface Campaign {
  id: number
  name: string
  status: CampaignStatus
  startTime: string
  endTime: string
  description: string
  claimedCount: number
  createdAt: string
  updatedAt: string
  content: string
  coverImageUrl: string
}

export type CouponType = 'cash' | 'discount' | 'free'
export type CouponStatus = 'unused' | 'used' | 'expired' | 'frozen'

export enum CouponGetable {
  NOT_GETABLE = 0,
  GETABLE = 1,
}

export type CampaignCoupon = {
  id: number
  name: string
  type: CouponType
  stackable: number
  description: string
  discountAmount: number
  discountRate: number
  thresholdAmount: number
  startTime: string
  endTime: string
  validityType: 'absolute' | 'relative'
  validDays: number
  userScope: string
  sendTimeEnd: string | null
  sendTimeStart: string | null
  getable: CouponGetable
}

export interface UserCouponRule {
  ruleType: 'inclusion' | 'exclusion' // 规则类型，inclusion-包含，exclusion-排除
  targetType: string // 目标类型，template-模板
  values: number[] // 目标值列表
}

export interface UserCoupon {
  id: number
  name: string
  type: CouponType // 优惠券类型
  validStart: string // 生效时间
  validEnd: string // 失效时间
  status: CouponStatus // 使用状态
  description: string
  discountAmount: number // 优惠金额
  discountRate: number // 折扣率
  thresholdAmount: number // 使用门槛
  stackable: number // 是否可叠加使用，0-不可叠加，1-可叠加
  scopeJson: { rules: UserCouponRule[] } | null // 使用范围规则
  unavailableReasons?: string[]
}

export interface CampaignDetail {
  campaign: Campaign
  Coupons: CampaignCoupon[]
}

export interface CouponListReq {
  page: number
  pageSize: number
  status?: CouponStatus
}

export interface CouponListResp {
  list: UserCoupon[]
  total: number
}

export interface ReceiveCouponReq {
  campaignId: number
  couponTemplateId: number
}

export interface ReceiveCouponResp {
  success: boolean
  msg: string
}
