import type { Message } from '@/api/chat'
import type { ChatRecord, ToolCall, ToolCallType } from '@/components/agent-ui/types'

// 转换函数
export function mapToChatRecord(backendMsg: Message): ChatRecord {
  // 1. 提取文本内容
  const textParts = backendMsg.parts?.filter((p) => p.type === 'text') || []
  const content = textParts.map((p) => p.text || '').join('\n')

  // 2. 提取图片/多模态文件
  const fileParts = backendMsg.parts?.filter((p) => p.type === 'file') || []
  const hasImages = fileParts.length > 0

  // 如果前端需要 content 是 string[] 的情况（比如存放多个图片 URL）
  if (hasImages) {
    // content = fileParts.map(p => Array.isArray(p.url) ? p.url.join(',') : p.url);
  }

  // 3. 提取 ToolCalls
  // 实际格式：type 为 "tool-{toolName}"，如 "tool-generateImage"
  // 只保留成功的调用（output-available），跳过失败重试（output-error）
  // callResult 直接存 imageUrl 字符串供 UI 渲染，callParams 存 prompt 文本
  const toolCallList: ToolCall[] = []
  const toolInvocationParts =
    backendMsg.parts?.filter(
      (p: any) => p.type?.startsWith('tool-') && p.state === 'output-available',
    ) || []

  toolInvocationParts.forEach((part: any) => {
    // 从 type 中提取工具名，例如 "tool-generateImage" => "generateImage"
    const toolName = part.type?.replace(/^tool-/, '') as ToolCallType

    // callResult：UI 直接当 imageUrl 用，取 output.imageUrl 纯字符串
    const callResult = part.output?.imageUrl || null

    // callParams：取 prompt 描述文本
    const callParams =
      (typeof part.input?.prompt === 'object' ? part.input.prompt.content : part.input?.prompt) ||
      (typeof part.input === 'string' ? part.input : null)

    toolCallList.push({
      toolCallId: part.toolCallId,
      content: '',
      name: toolName,
      callResult,
      error: null,
      callParams: callParams || '',
      rawParams: callParams || '',
      rawResult: callResult || '',
    })
  })

  // 4. 返回前端所需的 ChatRecord
  return {
    record_id: backendMsg.id,
    content: content,
    toolCallList: toolCallList,
    body: null, // 根据业务组装
    role: backendMsg.role as 'user' | 'assistant',
    type: hasImages ? 'images' : 'text',
  }
}

// 使用方式：前端发请求后
// const chatRecords = res.data.map(mapToChatRecord);
