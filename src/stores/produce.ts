import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import type { ProcessOption, WownowTemplate } from '@/types/template'
import { saveEncryptedData, loadEncryptedData } from '@/utils/encryption'

const PRODUCE_STORE_KEY = 'produceStore'

interface ProduceState {
  deviceId: number | null
  assetId: number | null
  styleId: number | null
  templateInfo: WownowTemplate | null
  productImageUrl: string
  price: number
  discountedPrice: number | undefined
  selectedProcessOption: ProcessOption | null
  quantity: number
  nfcContent: NFCContent | null
}

export interface NFCAgent {
  id: string
  name: string
  description: string
  icon: string
  coverUrl: string
  url: string
  metadata: string | null
  coverUrlError?: boolean
}

export interface NFCContent {
  id?: string
  type: 'link' | 'custom' | 'agent'
  link: string
  text: string
  attachments: Array<{
    name: string
    url: string
    contentType: string
  }>
  assetId?: number
  agent?: NFCAgent
}

export const useProduceStore = defineStore('produce', () => {
  const deviceId = ref<number | null>(null)
  const assetId = ref<number | null>(null)
  const styleId = ref<number | null>(null)
  const templateInfo = ref<WownowTemplate | null>(null)
  const productImageUrl = ref<string>('')
  const price = ref<number>(0)
  const discountedPrice = ref<number | undefined>(undefined)
  const selectedProcessOption = ref<ProcessOption | null>(null)
  const quantity = ref<number>(1)
  const nfcContent = ref<NFCContent | null>(null)

  // 异步恢复状态
  const initializeFromStorage = async () => {
    const savedState = await loadEncryptedData<ProduceState>(PRODUCE_STORE_KEY)
    if (savedState) {
      deviceId.value = savedState.deviceId ?? null
      assetId.value = savedState.assetId ?? null
      styleId.value = savedState.styleId ?? null
      templateInfo.value = savedState.templateInfo ?? null
      productImageUrl.value = savedState.productImageUrl ?? ''
      price.value = savedState.price ?? 0
      discountedPrice.value = savedState.discountedPrice ?? undefined
      selectedProcessOption.value = savedState.selectedProcessOption ?? null
      quantity.value = savedState.quantity ?? 1
      nfcContent.value = savedState.nfcContent ?? null
    }
  }
  initializeFromStorage()

  const totalPrice = computed(() => {
    const currentPrice = discountedPrice.value || price.value || 0
    return parseFloat((currentPrice * quantity.value).toFixed(2))
  })

  const hasNFC = computed(() => !!nfcContent.value)
  const isDeviceSelected = computed(() => deviceId.value !== null)
  const isAssetSelected = computed(() => assetId.value !== null)

  // 监听状态变化并自动保存到 localStorage
  watch(
    [
      deviceId,
      assetId,
      styleId,
      templateInfo,
      productImageUrl,
      price,
      discountedPrice,
      selectedProcessOption,
      quantity,
      nfcContent,
    ],
    async () => {
      const state: ProduceState = {
        deviceId: deviceId.value,
        assetId: assetId.value,
        styleId: styleId.value,
        templateInfo: templateInfo.value,
        productImageUrl: productImageUrl.value,
        price: price.value,
        discountedPrice: discountedPrice.value,
        selectedProcessOption: selectedProcessOption.value,
        quantity: quantity.value,
        nfcContent: nfcContent.value,
      }
      await saveEncryptedData(PRODUCE_STORE_KEY, state)
    },
    { deep: true },
  )

  function setDeviceId(id: number | null) {
    deviceId.value = id
  }

  function setAssetId(id: number | null) {
    assetId.value = id
  }

  function setStyleId(id: number | null) {
    styleId.value = id
  }

  function setTemplateInfo(template: WownowTemplate | null) {
    templateInfo.value = template
  }

  function setProductImageUrl(url: string) {
    productImageUrl.value = url
  }

  function setPrice(p: number) {
    price.value = p
  }

  function setDiscountedPrice(p?: number) {
    discountedPrice.value = p
  }

  function setSelectedProcessOption(option: ProcessOption | null) {
    selectedProcessOption.value = option
  }

  function setQuantity(qty: number) {
    quantity.value = Math.max(1, qty)
  }

  function setNfcContent(content: Partial<NFCContent>) {
    if (nfcContent.value) {
      nfcContent.value = { ...nfcContent.value, ...content }
    } else {
      nfcContent.value = content as NFCContent
    }
  }

  function clearNfc() {
    nfcContent.value = null
  }

  function clearAssetId() {
    assetId.value = null
  }

  function resetOrder() {
    nfcContent.value = null
    quantity.value = 1
  }

  function resetAll() {
    deviceId.value = null
    assetId.value = null
    styleId.value = null
    templateInfo.value = null
    productImageUrl.value = ''
    price.value = 0
    discountedPrice.value = undefined
    selectedProcessOption.value = null
    quantity.value = 1
    nfcContent.value = null
    // 清空 localStorage
    try {
      localStorage.removeItem(PRODUCE_STORE_KEY)
    } catch (error) {
      console.warn(`Failed to clear data for key ${PRODUCE_STORE_KEY}:`, error)
    }
  }

  return {
    // state
    deviceId,
    assetId,
    styleId,
    templateInfo,
    productImageUrl,
    price,
    discountedPrice,
    selectedProcessOption,
    quantity,
    nfcContent,
    // getters
    totalPrice,
    hasNFC,
    isDeviceSelected,
    isAssetSelected,
    // actions
    setDeviceId,
    setAssetId,
    setStyleId,
    setTemplateInfo,
    setProductImageUrl,
    setPrice,
    setDiscountedPrice,
    setSelectedProcessOption,
    setQuantity,
    setNfcContent,
    clearNfc,
    clearAssetId,
    resetOrder,
    resetAll,
    // utilities
    initializeFromStorage,
  }
})
