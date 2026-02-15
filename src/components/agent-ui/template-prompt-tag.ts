import { Node, mergeAttributes } from '@tiptap/core'

// 自定义 TemplatePromptTag 节点
export const TemplatePromptTag = Node.create({
  name: 'templatePromptTag',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
      },
      name: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="template-prompt-tag"]',
      },
    ]
  },

  renderText({ node }) {
    return `Template is 【${node.attrs.name}】`
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'template-prompt-tag',
        class: 'template-tag',
      }),
      `Template is 【${HTMLAttributes.name}】`,
    ]
  },
})
