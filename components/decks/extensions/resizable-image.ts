import { Node, mergeAttributes } from '@tiptap/core'
import Image from '@tiptap/extension-image'
import { Command } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resizableImage: {
      setImageWidth: (width: string) => ReturnType
    }
  }
}

export const ResizableImage = Image.extend({
  name: 'resizableImage',

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        parseHTML: element => element.style.width || element.getAttribute('width'),
        renderHTML: attributes => {
          if (!attributes.width) {
            return {}
          }
          // Convert numeric widths to pixels
          const width = /^\d+$/.test(attributes.width) 
            ? `${attributes.width}px` 
            : attributes.width
          return {
            style: `width: ${width}`,
            'data-resizable': 'true'
          }
        }
      },
      // Store original dimensions for aspect ratio
      originalWidth: {
        default: null,
        parseHTML: element => element instanceof HTMLImageElement ? element.naturalWidth : null,
        renderHTML: attributes => {
          if (!attributes.originalWidth) {
            return {}
          }
          return {
            'data-original-width': attributes.originalWidth
          }
        }
      },
      originalHeight: {
        default: null,
        parseHTML: element => element instanceof HTMLImageElement ? element.naturalHeight : null,
        renderHTML: attributes => {
          if (!attributes.originalHeight) {
            return {}
          }
          return {
            'data-original-height': attributes.originalHeight
          }
        }
      }
    }
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setImageWidth: (width: string): Command => ({ tr, dispatch }) => {
        const { selection } = tr;
        const node = tr.doc.nodeAt(selection.from);
        
        if (!node || node.type.name !== this.name) {
          return false;
        }

        if (dispatch) {
          tr.setNodeMarkup(selection.from, undefined, {
            ...node.attrs,
            width
          });
        }

        return true;
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: dom => {
          if (typeof dom === 'string') return {}
          const element = dom as HTMLImageElement
          return {
            src: element.getAttribute('src'),
            width: element.style.width || element.getAttribute('width'),
            originalWidth: element.naturalWidth,
            originalHeight: element.naturalHeight
          }
        }
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { width, originalWidth, originalHeight, ...rest } = HTMLAttributes
    return [
      'img',
      mergeAttributes(
        this.options.HTMLAttributes,
        {
          class: 'resizable-image',
          style: width ? `width: ${width}` : undefined,
          'data-original-width': originalWidth,
          'data-original-height': originalHeight,
          draggable: false
        },
        rest
      )
    ]
  }
}) 