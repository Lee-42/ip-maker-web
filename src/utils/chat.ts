import type { Message } from "@/api/chat";
import type { ChatRecord, ToolCall, ToolCallType } from "@/components/agent-ui/types";

// 转换函数
export function mapToChatRecord(backendMsg: Message): ChatRecord {
  // 1. 提取文本内容
  const textParts = backendMsg.parts?.filter((p) => p.type === 'text') || [];
  const content = textParts.map((p) => p.text || '').join('\n');

  // 2. 提取图片/多模态文件
  const fileParts = backendMsg.parts?.filter((p) => p.type === 'file') || [];
  const hasImages = fileParts.length > 0;

  // 如果前端需要 content 是 string[] 的情况（比如存放多个图片 URL）
  if (hasImages) {
     // content = fileParts.map(p => Array.isArray(p.url) ? p.url.join(',') : p.url);
  }

  // 3. 提取 ToolCalls
  const toolCallList: ToolCall[] = [];
  const toolInvocationParts = backendMsg.parts?.filter((p) => p.type === 'tool-invocation') || [];

  toolInvocationParts.forEach((part: any) => {
    if (part.toolInvocation) {
      toolCallList.push({
        toolCallId: part.toolInvocation.toolCallId,
        content: '',
        name: part.toolInvocation.toolName as ToolCallType,
        callResult: part.toolInvocation.result ? JSON.stringify(part.toolInvocation.result) : null,
        error: null,
        callParams: JSON.stringify(part.toolInvocation.args),
        rawParams: JSON.stringify(part.toolInvocation.args),
        rawResult: JSON.stringify(part.toolInvocation.result || ''),
      });
    }
  });

  // 4. 返回前端所需的 ChatRecord
  return {
    record_id: backendMsg.id,
    content: content,
    toolCallList: toolCallList,
    body: null, // 根据业务组装
    role: backendMsg.role as 'user' | 'assistant',
    type: hasImages ? 'images' : 'text',
  };
}

// 使用方式：前端发请求后
// const chatRecords = res.data.map(mapToChatRecord);
