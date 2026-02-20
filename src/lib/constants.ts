export const COIN_NEGATIVE_PROMPT = 'no gradients, no lighting, no drop shadow, no glow,'

const resolveBaseUrl = (value: string | undefined, fallback: string) => {
  const trimmed = (value ?? '').trim()
  if (!trimmed) {
    return fallback
  }
  return trimmed.replace(/\/+$/, '')
}

export const IPMAKER_API_URL = resolveBaseUrl(import.meta.env.VITE_IPMAKER_API_BASE, '')

export const IPMAKER_NFC_URL = resolveBaseUrl(import.meta.env.VITE_IPMAKER_NFC_BASE, '')

export const IPMAKER_CHAT_URL = resolveBaseUrl(import.meta.env.VITE_IPMAKER_CHAT_BASE, '')

export const CAPGO_UPDATE_URL = resolveBaseUrl(import.meta.env.VITE_CAPGO_UPDATE_URL, '')

export const MIME_TYPE_MAP: Record<string, string> = {
  // 图片
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  // 视频
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.wmv': 'video/x-ms-wmv',
  '.flv': 'video/x-flv',
  '.mkv': 'video/x-matroska',
  '.3gp': 'video/3gpp',
  '.m4v': 'video/x-m4v',
  '.ogv': 'video/ogg',
  '.rmvb': 'application/vnd.rn-realmedia-vbr',
}

export const productTypeOptions = [
  {
    label: '平雕-圆形纪念币',
    value: 'FLat Engrave-Round Coin',
    materialDescription: 'Zinc Alloy',
    craftType: 'FLat Engrave',
    shapeSize: '46*46*3mm',
  },
  {
    label: '浮雕-圆形纪念币',
    value: 'Embossed-Round Coin',
    materialDescription: 'Zinc Alloy',
    craftType: 'Embossed',
    shapeSize: '46*46*3mm',
  },
  {
    label: 'UV-圆形纪念币',
    value: 'UV Print-Round Coin',
    materialDescription: 'Zinc Alloy',
    craftType: 'UV Print',
    shapeSize: '46*46*3mm',
  },
  {
    label: '平雕-纪念卡',
    value: 'FLat Engrave-Rectangle Card',
    materialDescription: 'Zinc Alloy',
    craftType: 'FLat Engrave',
    shapeSize: '54*85.6*3mm',
  },
  {
    label: '浮雕-纪念卡',
    value: 'Embossed-Rectangle Card',
    materialDescription: 'Zinc Alloy',
    craftType: 'Embossed',
    shapeSize: '54*85.6*3mm',
  },
  {
    label: '普通卡片',
    value: 'UV Print-Rectangle Card',
    materialDescription: 'Stainless Steel',
    craftType: 'UV Print',
    shapeSize: '54*85.6*1.0mm',
  },
  {
    label: '红包卡片',
    value: 'Red Envelope Covers',
    materialDescription: 'Stainless Steel',
    craftType: 'UV Print',
    shapeSize: '54*85.6*1.0mm',
  },
  {
    label: '平雕-正方形金属卡片',
    value: 'FLat Engrave-Square Card',
    materialDescription: 'Zinc Alloy',
    craftType: 'FLat Engrave',
    shapeSize: '50*50*3mm',
  },
  {
    label: '浮雕-正方形金属卡片',
    value: 'Embossed-Square Card',
    materialDescription: 'Zinc Alloy',
    craftType: 'Embossed',
    shapeSize: '50*50*3mm',
  },
  {
    label: '轻奢-平雕-正方形金属卡片',
    value: 'FLat Engrave-Light Luxury Square Card',
    materialDescription: 'Zinc Alloy',
    craftType: 'FLat Engrave',
    shapeSize: '50*50*3mm',
  },
  {
    label: '轻奢-浮雕-正方形金属卡片',
    value: 'Embossed-Light Luxury Square Card',
    materialDescription: 'Zinc Alloy',
    craftType: 'Embossed',
    shapeSize: '50*50*3mm',
  },
]
