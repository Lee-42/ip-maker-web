import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import type { WownowTemplate, WownowPromptStyle, PromptTagItem } from '@/types/template'
import type { ChatBody, ChatRecord } from '@/components/agent-ui/types'
import { generateUUID } from '@/utils/common'
import {
  getChatRecords,
  setChatRecords,
  getChatTemplate,
  setChatTemplate as saveChatTemplate,
  getChatOutputList,
  setChatOutputList as saveChatOutputList,
  getChatRichInput,
  setChatRichInput as saveChatRichInput,
  getChatUploadImages,
  setChatUploadImages as saveChatUploadImages,
} from '@/utils/storage'

export interface ChatOutput {
  id: string
  content: string
  imageUrl: string
  styleId: number | null
}

export interface Attachment {
  name: string
  url: string
  contentType: string
}

export interface CategoryWithTemplates {
  category: {
    id: number
    name: string
    coverUrl?: string
  }
  subCategories: Array<{
    templates: WownowTemplate
    category: {
      id: number
      name: string
    }
  }>
}

export const useChatStore = defineStore('chat', () => {
  const category = ref<CategoryWithTemplates | null>(null)
  const prompts = ref<PromptTagItem[]>([])
  // 从 localStorage 初始化聊天模板
  const CHAT_ID = ref<string>(generateUUID())
  const chatTemplate = ref<WownowTemplate | null>(getChatTemplate())
  const promptStyle = ref<WownowPromptStyle | null>(null)
  const templatePrompt = ref<WownowTemplate | null>(null)
  const attachment = ref<Attachment | null>(null)
  // 从 localStorage 初始化聊天输出列表
  const outputList = ref<ChatOutput[]>(getChatOutputList() || [])
  // 从 localStorage 初始化聊天记录
  const chatRecords = ref<ChatRecord[]>(getChatRecords() || [])
  const assetStyleId = ref<number | null>(null)

  // 缓存风格和模板列表
  const promptStyles = ref<WownowPromptStyle[]>([])
  const templatePrompts = ref<WownowTemplate[]>([])

  // 缓存输入框内容（包含纯文本和 HTML）
  // 从 localStorage 初始化富文本输入内容
  const richInput = ref(getChatRichInput() || { text: '', html: '' })

  // 缓存上传的图片
  // 从 localStorage 初始化上传的图片列表
  const uploadImages = ref<string[]>(getChatUploadImages() || [])

  // 最后一次发送的body请求
  const lastSSEBody = ref<ChatBody | null>(null)
  // 最后一次发送的style
  const lastStyle = ref<WownowPromptStyle | null>(null)

  // 监听 uploadImages 变化，自动保存到 localStorage
  watch(
    uploadImages,
    (newImages) => {
      saveChatUploadImages(newImages)
    },
    { deep: true },
  )

  // 监听 richInput 变化，自动保存到 localStorage
  watch(
    richInput,
    (newRichInput) => {
      saveChatRichInput(newRichInput)
    },
    { deep: true },
  )

  const hasChatTemplate = computed(() => !!chatTemplate.value)
  const hasOutput = computed(() => outputList.value.length > 0)

  function setPrompts(promptsList: PromptTagItem[]) {
    prompts.value = promptsList
  }

  function setChatRecord(chatRecord: ChatRecord[]) {
    chatRecords.value = chatRecord
    setChatRecords(chatRecord)
  }

  function setCategory(categoryData: CategoryWithTemplates | null) {
    category.value = categoryData
  }

  function setChatTemplate(template: WownowTemplate | null) {
    chatTemplate.value = template
    saveChatTemplate(template)
  }

  function setPromptStyle(style: WownowPromptStyle | null) {
    promptStyle.value = style
    if (style) {
      setLastStyle(style)
    }
  }

  function setTemplatePrompt(prompt: WownowTemplate | null) {
    templatePrompt.value = prompt
  }

  function setAttachment(attach: Attachment | null) {
    attachment.value = attach
  }

  function setOutputList(list: ChatOutput[]) {
    outputList.value = list
    saveChatOutputList(list)
  }

  function setAssetStyleId(styleId: number | null) {
    assetStyleId.value = styleId
  }

  function setPromptStyles(styles: WownowPromptStyle[]) {
    promptStyles.value = styles
  }

  function setTemplatePrompts(templates: WownowTemplate[]) {
    templatePrompts.value = templates
  }

  function setRichInput(input: { text?: string; html?: string }) {
    if (input.text !== undefined) {
      richInput.value.text = input.text
    }
    if (input.html !== undefined) {
      richInput.value.html = input.html
    }
    // 保存到 localStorage
    saveChatRichInput(richInput.value)
  }

  function setUploadImages(images: string[]) {
    uploadImages.value = images
    saveChatUploadImages(images)
  }

  function setLastSSEBody(body: ChatBody | null) {
    lastSSEBody.value = body
  }
  function setLastStyle(style: WownowPromptStyle | null) {
    lastStyle.value = style
  }

  function resetChatStore() {
    CHAT_ID.value = generateUUID()
    chatTemplate.value = null
    saveChatTemplate(null) // 清除 localStorage 中的聊天模板
    promptStyle.value = null
    attachment.value = null
    outputList.value = []
    saveChatOutputList([]) // 清除 localStorage 中的聊天输出列表
    prompts.value = []
    chatRecords.value = []
    setChatRecords([]) // 清除 localStorage 中的聊天记录
    category.value = null
    assetStyleId.value = null
    richInput.value = { text: '', html: '' }
    saveChatRichInput({ text: '', html: '' }) // 清除 localStorage 中的富文本输入内容
    uploadImages.value = []
    saveChatUploadImages([]) // 清除 localStorage 中的上传图片列表
  }

  return {
    // state
    category,
    prompts,
    CHAT_ID,
    chatTemplate,
    promptStyle,
    templatePrompt,
    attachment,
    outputList,
    chatRecords,
    assetStyleId,
    promptStyles,
    templatePrompts,
    richInput,
    uploadImages,
    lastSSEBody,
    lastStyle,
    // getters
    hasChatTemplate,
    hasOutput,
    // actions
    setPrompts,
    setChatRecord,
    setCategory,
    setChatTemplate,
    setPromptStyle,
    setTemplatePrompt,
    setAttachment,
    setOutputList,
    setAssetStyleId,
    setPromptStyles,
    setTemplatePrompts,
    setRichInput,
    setUploadImages,
    setLastSSEBody,
    setLastStyle,
    resetChatStore,
  }
})
