import { JSONContent } from '@tiptap/react';

export default function extractImageUrlsFromTiptap(node: JSONContent | null | undefined): string[] {
  if (!node) return [];

  let urls: string[] = [];

  if (node.type === 'image' && node.attrs?.src) {
    urls.push(node.attrs.src);
  }

  if (node.content && Array.isArray(node.content)) {
    node.content.forEach((child) => {
      urls = urls.concat(extractImageUrlsFromTiptap(child));
    });
  }

  return urls;
}
