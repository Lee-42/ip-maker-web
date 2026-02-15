import { Node, mergeAttributes } from '@tiptap/core'

// 自定义 PromptTag 节点
export const PromptTag = Node.create({
  name: 'promptTag',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      name: {
        default: null,
      },
      prompt: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="prompt-tag"]',
      },
    ]
  },
  renderText({ node }) {
    return `【${node.attrs.name}】`
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, { 'data-type': 'prompt-tag', class: 'prompt-tag' }),
      `【${HTMLAttributes.name}】`,
    ]
  },
})
