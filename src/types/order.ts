import type { Asset } from './asset'
import type { WownowTemplate } from './template'

export interface DiscountRecordItem {
  desc?: string
  name?: number | string
}

export interface Device {
  id: number
  deviceCode: string
  deviceName: string
  location: string
  address: string
  adcode?: string
  apiKey?: string
  apiUrl?: string
  cncDeviceStatus?: string
  createdAt?: string
  createdBy?: number
  lastStatusCheck?: string
  remark?: string
  sort?: number
  status?: number
  updatedAt?: string
  updatedBy?: number
  uvDeviceStatus?: string
  contact?: string // 联系人
  contactName?: string // 联系人姓名
  contactAddress?: string // 联系人地址
  distance?: number | string
  icon?: string // 设备图标
}

export interface Order {
  id: number
  memberId?: number
  orderSn: string
  productName: string
  productDesc?: string
  amount: number
  payAmount: number
  status: OrderStatus
  payAt: string
  completeAt?: string
  remark?: string
  createdAt?: string
  updatedAt?: string
  quantity: number
  pickupCode?: string
  asset: Asset
  device: Device
  deviceId?: number
  assetId?: number
  discountRecord?: DiscountRecordItem[]
  template?: Partial<WownowTemplate>
}

export interface PayStatus {
  payStatus: number
  orderStatus: number
  payAt: string
}

export enum OrderStatus {
  PENDING = 1, // 待支付
  PAID = 2, // 排单中
  PROCESSING = 3, // 生产中
  READY_FOR_PICKUP = 4, // 待取货
  COMPLETED = 5, // 订单完成
  CLOSED = 6, // 订单关闭
  ERROR = 7, // 订单异常
  DETAIN = 8, // 订单滞留
}

export interface OrderCreateReq {
  amount: number
  assetId: number
  deviceId: number | null
  productDesc?: string
  productName: string
  quantity: number
  taskType: string
  userCouponId: number[]
}

export interface OrderCreateResponse {
  orderId?: number
  orderSn: string
  payData: string
  payAmount: number
}

export interface OrderPayReq {
  orderSn: string
  payType: string
  tradeType: string
}

export interface OrderPayRes {
  orderSn: string
  payData: string
  payAmount: number
  tradeType: string
}

export interface OrderRefundReq {
  amount: number
  orderSn: string
  reason: string
  refundSn?: string
}

export interface OrderRefundRes {
  refundSn?: string
  status?: string
}

export interface OrderDeleteRes {
  isSuccess: boolean
  msg: string
}

export enum OrderPreviewType {
  Preview = 'preview',
  Tracking = 'tracking',
}

// 订单跟踪步骤
export interface OrderTrackingStep {
  id: number
  type: OrderPreviewType
  createTime: string
  remark: string
  duration?: number | string
  description?: string
}

// 订单跟踪响应
export interface OrderTrackingRes {
  order: Order
  tracking: OrderTrackingStep[]
  preview: OrderTrackingStep[]
}
