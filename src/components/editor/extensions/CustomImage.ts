import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';

import ImageComponent from './ImageComponent';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customImage: {
      /**
       * Add an image
       */
      setImage: (options: {
        src: string;
        alt?: string;
        title?: string;
        uploading?: boolean;
      }) => ReturnType;
    };
  }
}

export const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      uploading: {
        default: false,
        renderHTML: (attributes) => {
          if (attributes.uploading) {
            return { 'data-uploading': attributes.uploading };
          }
          return {};
        },
        parseHTML: (element) => element.getAttribute('data-uploading') === 'true',
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageComponent);
  },
});
