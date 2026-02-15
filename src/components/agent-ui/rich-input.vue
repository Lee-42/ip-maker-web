<template>
  <editor-content :editor="editor" class="text-input" />
</template>

<script setup lang="ts">
import { watch, onBeforeUnmount, onMounted } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useChatStore } from '@/stores/chat'
import { storeToRefs } from 'pinia'
import type { PromptTagItem } from '@/types/template'
import { StyleTag } from './style-prompt-tag'
import { TemplatePromptTag } from './template-prompt-tag'
import { PromptTag } from './prompt-tag'

interface Props {
  placeholder?: string
  maxlength?: number
  rows?: number
}

interface Emits {
  (e: 'enter'): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Describe your creation',
  maxlength: 500,
  rows: 1,
})

const emit = defineEmits<Emits>()
const chatStore = useChatStore()
const { promptStyle, templatePrompt, richInput, prompts } = storeToRefs(chatStore)

// 标志位：是否正在批量插入 prompt 标签
let isInsertingPrompts = false

// 创建 tiptap 编辑器
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      // 禁用标题、代码块等不需要的功能
      heading: false,
      codeBlock: false,
      blockquote: false,
      horizontalRule: false,
      bulletList: false,
      orderedList: false,
      listItem: false,
      // 保留段落和文本功能
      paragraph: {
        HTMLAttributes: {
          class: 'editor-paragraph',
        },
      },
      // 允许硬换行 (Shift+Enter)
      hardBreak: {},
    }),
    Placeholder.configure({
      placeholder: props.placeholder,
    }),
    StyleTag,
    TemplatePromptTag,
    PromptTag,
  ],
  content: richInput.value.html || richInput.value.text,
  editorProps: {
    attributes: {
      class: 'editor-content',
    },
    handleKeyDown: (view, event) => {
      // 处理 Enter 键发送消息（不按 Shift）
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        emit('enter')
        return true
      }
      return false
    },
  },
  onUpdate: ({ editor }) => {
    const text = editor.getText()

    // 检查字符限制
    if (props.maxlength && text.length > props.maxlength) {
      // 如果超过限制，截断文本
      const truncatedText = text.slice(0, props.maxlength)
      editor.commands.setContent(truncatedText)
      return
    }

    // 检查 styleTag 是否被删除
    if (promptStyle.value) {
      let hasStyleTag = false

      // 使用 transaction 来检测，确保在文档变更后检查
      editor.state.doc.descendants((node) => {
        if (node.type.name === 'styleTag') {
          hasStyleTag = true
          return false
        }
      })

      if (!hasStyleTag) {
        // 如果标签不存在了，说明被用户删除了，清理 store
        chatStore.setPromptStyle(null)
      }
    }

    // 检查 templatePromptTag 是否被删除
    if (templatePrompt.value) {
      let hasTemplatePromptTag = false

      // 使用 transaction 来检测，确保在文档变更后检查
      editor.state.doc.descendants((node) => {
        if (node.type.name === 'templatePromptTag') {
          hasTemplatePromptTag = true
          return false
        }
      })

      if (!hasTemplatePromptTag) {
        // 如果标签不存在了，说明被用户删除了，清理 store
        chatStore.setTemplatePrompt(null)
      }
    }

    // 检查 promptTag 是否被删除（只在非插入状态下执行）
    if (!isInsertingPrompts && prompts.value.length > 0) {
      const existingPrompts: string[] = []

      // 收集编辑器中现有的 promptTag
      editor.state.doc.descendants((node) => {
        if (node.type.name === 'promptTag') {
          existingPrompts.push(node.attrs.prompt)
        }
      })

      // 找出被删除的 prompt
      const deletedPrompts = prompts.value.filter(
        (p: PromptTagItem) => !existingPrompts.includes(p.prompt),
      )

      // 如果有 prompt 被删除，更新 store
      if (deletedPrompts.length > 0) {
        chatStore.setPrompts(
          prompts.value.filter((p: PromptTagItem) => existingPrompts.includes(p.prompt)),
        )
      }
    }

    // 触发更新：同时保存纯文本和 HTML
    chatStore.setRichInput({ text, html: editor.getHTML() })
  },
})

// 监听 promptStyle 变化
watch(
  () => promptStyle.value,
  (newStyle) => {
    if (!editor.value) return

    // 查找现有的 styleTag 位置
    let existingPos = -1
    let existingNodeSize = 0

    editor.value.state.doc.descendants((node, position) => {
      if (node.type.name === 'styleTag') {
        existingPos = position
        existingNodeSize = node.nodeSize
        return false
      }
    })

    // 如果有新样式
    if (newStyle) {
      const content = {
        type: 'styleTag',
        attrs: {
          id: newStyle.id,
          name: newStyle.name,
        },
      }

      if (existingPos !== -1) {
        // 如果已存在标签，替换它
        editor.value.commands.command(({ tr, state }) => {
          const styleTag = state.schema.nodes.styleTag
          if (styleTag) {
            const node = styleTag.create(content.attrs)
            tr.replaceWith(existingPos, existingPos + existingNodeSize, node)
            return true
          }
          return false
        })
      } else {
        // 如果不存在，在文档末尾插入
        // 先将光标移到末尾，然后插入
        editor.value.commands.focus('end')
        editor.value.commands.insertContent(content)
        editor.value.commands.insertContent(' ')
      }

      // 触发更新
      chatStore.setRichInput({
        text: editor.value.getText(),
        html: editor.value.getHTML(),
      })
    } else {
      // 如果新样式为空，且存在旧标签，则删除它
      if (existingPos !== -1) {
        editor.value.commands.deleteRange({ from: existingPos, to: existingPos + existingNodeSize })
        chatStore.setRichInput({ html: editor.value.getHTML() })
      }
    }
  },
)

// 监听 richInput.html 变化，更新编辑器内容
watch(
  () => richInput.value.html,
  (newHtml, oldHtml) => {
    if (!editor.value) return

    // 如果 HTML 内容与编辑器当前内容不一致，才更新
    const currentHtml = editor.value.getHTML()
    if (currentHtml !== newHtml) {
      if (newHtml === '' || newHtml === '<p></p>') {
        // 清空编辑器，保留标签
        editor.value.commands.clearContent()
        if (promptStyle.value) {
          editor.value.commands.insertContent({
            type: 'styleTag',
            attrs: {
              id: promptStyle.value.id,
              name: promptStyle.value.name,
            },
          })
          editor.value.commands.insertContent(' ')
        }

        if (templatePrompt.value) {
          editor.value.commands.insertContent({
            type: 'templatePromptTag',
            attrs: {
              id: templatePrompt.value.id,
              name: templatePrompt.value.name,
            },
          })
          editor.value.commands.insertContent(' ')
        }

        // 恢复 prompts 标签
        if (prompts.value.length > 0) {
          prompts.value.forEach((prompt: PromptTagItem) => {
            editor.value?.commands.insertContent({
              type: 'promptTag',
              attrs: {
                name: prompt.name,
                prompt: prompt.prompt,
              },
            })
            editor.value?.commands.insertContent(' ')
          })
        }
      } else if (newHtml && oldHtml !== newHtml) {
        // 从外部恢复 HTML 内容（比如从其他页面返回）
        editor.value.commands.setContent(newHtml)
      }
    }
  },
)

watch(
  () => props.placeholder,
  (newPlaceholder) => {
    if (editor.value) {
      editor.value.extensionManager.extensions.forEach((extension) => {
        if (extension.name === 'placeholder') {
          extension.options.placeholder = newPlaceholder
        }
      })
    }
  },
)

// 监听 prompts 变化，同步更新编辑器中的 promptTag
watch(
  () => prompts.value,
  (newPrompts) => {
    if (!editor.value) return

    // 设置标志位，表示正在批量插入
    isInsertingPrompts = true

    // 收集编辑器中现有的 promptTag 位置
    const existingPrompts: Array<{ pos: number; size: number }> = []
    editor.value.state.doc.descendants((node, pos) => {
      if (node.type.name === 'promptTag') {
        existingPrompts.push({
          pos,
          size: node.nodeSize,
        })
      }
    })

    const hasExistingPrompts = existingPrompts.length > 0
    let insertPosition = 0

    if (hasExistingPrompts && existingPrompts[0]) {
      // 如果已有 promptTag，记录第一个的位置
      insertPosition = existingPrompts[0].pos

      // 删除所有现有的 promptTag（从后往前删除，避免位置偏移）
      existingPrompts.sort((a, b) => b.pos - a.pos)
      existingPrompts.forEach((p) => {
        editor.value?.commands.deleteRange({ from: p.pos, to: p.pos + p.size })
      })
    } else {
      // 如果没有 promptTag，插入到文档末尾
      insertPosition = editor.value.state.doc.content.size
    }

    // 在指定位置插入所有 prompt 标签
    if (newPrompts.length > 0) {
      // 将光标移到插入位置
      editor.value.commands.setTextSelection(insertPosition)

      newPrompts.forEach((prompt: PromptTagItem) => {
        editor.value?.commands.insertContent({
          type: 'promptTag',
          attrs: {
            name: prompt.name,
            prompt: prompt.prompt,
          },
        })
        editor.value?.commands.insertContent(' ')
      })
    }

    // 触发更新
    chatStore.setRichInput({
      text: editor.value.getText(),
      html: editor.value.getHTML(),
    })

    // 将光标移到文档末尾
    const docSize = editor.value.state.doc.content.size
    editor.value.commands.setTextSelection(docSize)
    // editor.value.commands.focus()

    // 插入完成，恢复标志位
    isInsertingPrompts = false
  },
  { deep: true },
)

// 暴露方法供父组件调用
defineExpose({
  focus: () => {
    editor.value?.commands.focus()
  },
  blur: () => {
    editor.value?.commands.blur()
  },
  clear: () => {
    editor.value?.commands.clearContent()
  },
  setContentWithTags: (
    parts: Array<{ type: string; content?: string; id?: number; name?: string; prompt?: string }>,
  ) => {
    if (!editor.value) return

    // 清空编辑器
    editor.value.commands.clearContent()

    // 按顺序插入内容
    parts.forEach((part) => {
      if (part.type === 'text') {
        // 插入普通文本
        editor.value?.commands.insertContent(part.content || '')
      } else if (part.type === 'styleTag') {
        // 插入风格标签节点
        editor.value?.commands.insertContent({
          type: 'styleTag',
          attrs: {
            id: part.id,
            name: part.name,
          },
        })
        // 更新 store
        const style = chatStore.promptStyles.find((s) => s.id === part.id)
        if (style) {
          chatStore.setPromptStyle(style)
        }
      } else if (part.type === 'templatePromptTag') {
        // 插入模板提示词标签节点
        editor.value?.commands.insertContent({
          type: 'templatePromptTag',
          attrs: {
            id: part.id,
            name: part.name,
          },
        })
        // 更新 store
        const template = chatStore.templatePrompts.find((t) => t.id === part.id)
        if (template) {
          chatStore.setTemplatePrompt(template)
        }
      } else if (part.type === 'promptTag') {
        // 插入提示词标签节点
        editor.value?.commands.insertContent({
          type: 'promptTag',
          attrs: {
            name: part.name,
            prompt: part.prompt,
          },
        })
      }
    })

    // 触发更新
    chatStore.setRichInput({
      text: editor.value.getText(),
      html: editor.value.getHTML(),
    })
  },
})

onMounted(() => {
  // 组件挂载时，同步所有标签（styleTag、templatePromptTag、promptTag）
  if (editor.value) {
    // 设置标志位，表示正在批量插入
    isInsertingPrompts = true

    // 检查并同步 styleTag
    if (promptStyle.value) {
      let hasStyleTag = false
      editor.value.state.doc.descendants((node) => {
        if (node.type.name === 'styleTag') {
          hasStyleTag = true
          return false
        }
      })

      if (!hasStyleTag) {
        // 如果 store 中有 styleTag 但编辑器中没有，在末尾插入它
        editor.value.commands.focus('end')
        editor.value.commands.insertContent({
          type: 'styleTag',
          attrs: {
            id: promptStyle.value.id,
            name: promptStyle.value.name,
          },
        })
        editor.value.commands.insertContent(' ')
      }
    }

    // 检查并同步 templatePromptTag
    if (templatePrompt.value) {
      let hasTemplatePromptTag = false
      let templateTagPos = -1
      let templateTagSize = 0

      editor.value.state.doc.descendants((node, pos) => {
        if (node.type.name === 'templatePromptTag') {
          hasTemplatePromptTag = true
          templateTagPos = pos
          templateTagSize = node.nodeSize
          return false
        }
      })

      if (!hasTemplatePromptTag) {
        console.log('hasTemplatePromptTag', templatePrompt.value)
        // 如果 store 中有 templatePromptTag 但编辑器中没有，在末尾插入它
        editor.value.commands.focus('end')
        editor.value.commands.insertContent({
          type: 'templatePromptTag',
          attrs: {
            id: templatePrompt.value.id,
            name: templatePrompt.value.name,
          },
        })
        editor.value.commands.insertContent(' ')
      } else if (templateTagPos !== -1) {
        // 编辑器已有标签时，直接用 store 当前模板覆盖，保证唯一且同步
        editor.value.commands.command(({ tr, state }) => {
          const templateTag = state.schema.nodes.templatePromptTag
          if (!templateTag) return false

          const node = templateTag.create({
            id: templatePrompt.value?.id,
            name: templatePrompt.value?.name,
          })
          tr.replaceWith(templateTagPos, templateTagPos + templateTagSize, node)
          return true
        })
      }
    }

    // 收集编辑器中现有的 promptTag 位置
    const existingPrompts: Array<{ pos: number; size: number }> = []
    editor.value.state.doc.descendants((node, pos) => {
      if (node.type.name === 'promptTag') {
        existingPrompts.push({
          pos,
          size: node.nodeSize,
        })
      }
    })

    const hasExistingPrompts = existingPrompts.length > 0
    let insertPosition = 0

    if (hasExistingPrompts && existingPrompts[0]) {
      // 如果已有 promptTag，记录第一个的位置
      insertPosition = existingPrompts[0].pos

      // 删除所有现有的 promptTag（从后往前删除，避免位置偏移）
      existingPrompts.sort((a, b) => b.pos - a.pos)
      existingPrompts.forEach((p) => {
        editor.value?.commands.deleteRange({ from: p.pos, to: p.pos + p.size })
      })
    } else {
      // 如果没有 promptTag，插入到文档末尾
      insertPosition = editor.value.state.doc.content.size
    }

    // 在指定位置插入所有 prompt 标签
    if (prompts.value.length > 0) {
      // 将光标移到插入位置
      editor.value.commands.setTextSelection(insertPosition)

      prompts.value.forEach((prompt: PromptTagItem) => {
        editor.value?.commands.insertContent({
          type: 'promptTag',
          attrs: {
            name: prompt.name,
            prompt: prompt.prompt,
          },
        })
        editor.value?.commands.insertContent(' ')
      })
    }

    // 触发更新
    chatStore.setRichInput({
      text: editor.value.getText(),
      html: editor.value.getHTML(),
    })

    // 将光标移到文档末尾
    const docSize = editor.value.state.doc.content.size
    editor.value.commands.setTextSelection(docSize)
    // editor.value.commands.focus()

    // 插入完成，恢复标志位
    isInsertingPrompts = false
  }
})

// 清理编辑器
onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style scoped>
.text-input {
  flex: 1;
  font-size: 16px;
  background: var(--input-bg-color);
  color: var(--text-color);
  border: none;
  outline: none;
  font-family: inherit;
}

/* Tiptap 编辑器样式 */
.text-input :deep(.ProseMirror) {
  padding: 4px 0;
  outline: none;
  min-height: 24px;
  max-height: 100px;
  overflow-y: auto;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.text-input :deep(.ProseMirror p) {
  margin: 0;
  line-height: 1.5;
}

.text-input :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: var(--text-color-secondary);
  pointer-events: none;
  height: 0;
}

/* 确保编辑器可以正确获得焦点 */
.text-input :deep(.ProseMirror:focus) {
  outline: none;
}

/* 滚动条样式优化 */
.text-input :deep(.ProseMirror)::-webkit-scrollbar {
  width: 4px;
}

.text-input :deep(.ProseMirror)::-webkit-scrollbar-track {
  background: transparent;
}

.text-input :deep(.ProseMirror)::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 2px;
}

.text-input :deep(.ProseMirror)::-webkit-scrollbar-thumb:hover {
  background: var(--text-color-secondary);
}

/* Style Tag */
.text-input :deep(.style-tag),
.text-input :deep(.template-tag),
.text-input :deep(.prompt-tag) {
  display: inline-flex;
  align-items: center;
  background-color: var(--tag-bg);
  color: var(--tag-text);
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 14px;
  white-space: nowrap;
  user-select: none;
  font-weight: 500;
  margin-bottom: 4px;
}

/* Template Tag 特殊样式 - 支持省略号 */
.text-input :deep(.template-tag) {
  display: inline-block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
}
</style>
