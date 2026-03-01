import { JSONContent } from '@tiptap/react';

export default function extractTextFromTiptap(content: JSONContent | string | any): string {
  if (!content) return '';

  let parsedContent = content;

  if (typeof content === 'string') {
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      return content
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
  }

  function extract(node: any): string {
    if (!node) return '';
    let text = '';

    if (node.type === 'text' && node.text) {
      text += node.text;
    }

    if (node.content && Array.isArray(node.content)) {
      node.content.forEach((child: any) => {
        text += extract(child);
      });
    }

    const blockTypes = ['paragraph', 'heading', 'codeBlock', 'listItem'];
    if (blockTypes.includes(node.type || '') && text.length > 0) {
      text += ' ';
    }

    return text;
  }

  let extractedText = '';
  if (Array.isArray(parsedContent)) {
    extractedText = parsedContent.map((node) => extract(node)).join('');
  } else {
    extractedText = extract(parsedContent);
  }

  return extractedText.replace(/\s+/g, ' ').trim();
}
