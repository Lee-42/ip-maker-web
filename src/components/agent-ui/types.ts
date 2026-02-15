/**
 * 图像生成选项
 * 用于配置 AI 图像生成的各种参数
 */
export interface GenerateImageOptions {
  templateId?: number
  defaultPrompt?: string
  productType?: string
  width: number
  height: number
  stylePrompt?: string
  templatePrompt?: string
  negativePrompt?: string
  ratio?: string
  placeholderUrl?: string
}

export interface ChatRecord {
  record_id: string
  content: string | string[]
  toolCallList: ToolCall[]
  body: ChatBody | null
  role: 'user' | 'assistant'
  type?: 'text' | 'images'
}

export type ToolCallType =
  | 'generateImage'
  | 'generateText'
  | 'generateAudio'
  | 'generateVideo'
  | 'generateDocument'
  | 'generateSpreadsheet'
  | 'generatePresentation'
  | 'generateCode'

export interface ToolCall {
  toolCallId: string
  content: string
  name: ToolCallType
  callResult: string | null
  error: string | null
  callParams: string | null
  rawParams: string
  rawResult: string
}

/**
 * SSE 事件消息类型
 */
export enum MessageType {
  START = 'start',
  START_STEP = 'start-step',
  TEXT_STARTING = 'text-start',
  TEXT_DELTA = 'text-delta',
  TOOL_INPUT_START = 'tool-input-start',
  TOOL_INPUT_DELTA = 'tool-input-delta',
  TOOL_INPUT_AVAILABLE = 'tool-input-available',
  TOOL_OUTPUT_AVAILABLE = 'tool-output-available',
  TOOL_OUTPUT_ERROR = 'tool-output-error',
  FINISH_STEP = 'finish-step',
  FINISH = 'finish',
}

/**
 * SSE 事件数据
 * 从服务器接收的流式事件数据结构
 */
export interface EventData {
  type: string
  delta?: string
  toolCallId?: string
  toolName?: string
  inputTextDelta?: string
  input?: string | { prompt?: string }
  output?: string | { imageUrl?: string }
}

export interface ChatInterfaceProps {
  token: string
  apiUrl: string
  generateImageOptions: GenerateImageOptions
  starterPrompts?: { title: string; action: string }[]
  onChatRecordsChange?: (records: ChatRecord[]) => void
  onImageTap?: (imageUrl: string) => void
}

export enum Role {
  USER = 'user',
  ASSISTANT = 'assistant',
}

/**
 * 聊天请求体
 * 用于 SSE (Server-Sent Events) 接口的请求体
 */
export interface ChatBody {
  id: string
  message: Message
  selectedChatModel: string
  selectedVisibilityType: 'private' | 'public'
  generateImageOptions: GenerateImageOptions
}

/**
 * 消息结构
 */
export interface Message {
  id: string
  role: 'user' | 'assistant'
  parts: MessagePart[]
}

/**
 * 消息部分
 * 消息可以包含多个部分，支持文本、文件等类型
 */
export interface MessagePart {
  type: 'text' | 'file'
  text?: string
  url?: string[]
  mediaType?: 'image' | 'audio' | 'video'
}
