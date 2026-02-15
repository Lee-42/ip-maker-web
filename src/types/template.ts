import type { OrientationType } from './asset'
import type { PageReq } from '@/api/asset'

export enum TemplateLabel {
  FlatCoin = 'FLat Engrave-Round Coin',
  ReliefCoin = 'Embossed-Round Coin',
  UVCoin = 'UV Print-Round Coin',
  FlatCard = 'FLat Engrave-Rectangle Card',
  ReliefCard = 'Embossed-Rectangle Card',
  NormalCard = 'UV Print-Rectangle Card',
  RedEnvelopeCard = 'Red Envelope Covers',
  FlatSquareCard = 'FLat Engrave-Square Card',
  ReliefSquareCard = 'Embossed-Square Card',
  LuxuryFlatSquareCard = 'FLat Engrave-Light Luxury Square Card',
  LuxuryReliefSquareCard = 'Embossed-Light Luxury Square Card',
}

export interface TemplateListReq extends PageReq {
  id?: number
  name?: string
  styleId?: number
  type?: string
  craftType?: string
  label?: string
  isRecommended?: number
  status?: number
  priceMin?: number
  priceMax?: number
  position?: 'chat_box' | 'home_page'
}

export interface ProcessOption {
  default: boolean
  duration: string
  price: number
  processType: 'Express Processing' | 'Premium Processing'
  taskType: string
  discount?: number
  discountedPrice?: number
}

export interface TemplateInfo {
  refPic: string[]
}

export interface WownowTemplate {
  id: number
  userId?: number
  name: string
  description: string
  styleId: number
  shapeSize: string
  materialDescription: string
  threeDimensionUrls: string[]
  sceneDescription: string
  coverUrl: string
  recommendCoverUrl: string
  prompt: string
  processOptions: ProcessOption[]
  type: string
  craftType: string
  taskType: string
  label: TemplateLabel
  isRecommended: boolean
  isDeleted: boolean
  status: number
  sort: number
  createdAt: Date
  updatedAt: Date
  categoryName: string
  styleName: string
  orientation: OrientationType
  aspectRatio: string
  position: 'chat_box' | 'home_page'
  info: TemplateInfo | null
}

export interface PromptStyleLstReq extends PageReq {
  id?: number
  name?: string
  nameEn?: string
  status?: number
}

export interface WownowPromptStyle {
  id: number
  name: string
  nameEn: string
  description: string
  prompt: string
  imageUrl: string
  thumbnail: string
  status: number
  isDeleted: number
  createdAt: Date
  updatedAt: Date
}

export interface TemplateTagOption {
  id: number
  value: string // 标签值
  label: string // 标签名称
}

export interface PromptTagItem {
  name: string
  prompt: string
}
