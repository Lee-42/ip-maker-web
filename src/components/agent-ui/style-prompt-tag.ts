import { Node, mergeAttributes } from '@tiptap/core'

// 自定义 StyleTag 节点
export const StyleTag = Node.create({
  name: 'styleTag',
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
        tag: 'span[data-type="style-tag"]',
      },
    ]
  },
  renderText({ node }) {
    return `Creative style is 【${node.attrs.name}】`
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, { 'data-type': 'style-tag', class: 'style-tag' }),
      `Creative style is 【${HTMLAttributes.name}】`,
    ]
  },
})
