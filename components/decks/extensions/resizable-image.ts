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
        parseHTML: element => element.style.width,
        renderHTML: attributes => {
          if (!attributes.width) {
            return {}
          }
          return {
            style: `width: ${attributes.width}`
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
  }
}) 