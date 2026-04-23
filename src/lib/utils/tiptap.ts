/**
 * @file tiptap.ts
 * @description Tiptap 에디터 콘텐츠에서 텍스트와 이미지 URL을 추출하는 유틸리티.
 */

import type { JSONContent } from '@tiptap/react';

/**
 * Tiptap JSONContent에서 순수 텍스트를 추출
 * @param content - Tiptap JSON 콘텐츠 또는 문자열
 * @returns 추출된 순수 텍스트
 */
export function extractTextFromTiptap(content: JSONContent | string | unknown): string {
  if (!content) return '';

  let parsedContent = content;

  if (typeof content === 'string') {
    try {
      parsedContent = JSON.parse(content);
    } catch {
      return content
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
  }

  function extract(node: Record<string, unknown>): string {
    if (!node) return '';
    let text = '';

    if (node.type === 'text' && typeof node.text === 'string') {
      text += node.text;
    }

    if (Array.isArray(node.content)) {
      node.content.forEach((child: Record<string, unknown>) => {
        text += extract(child);
      });
    }

    const blockTypes = ['paragraph', 'heading', 'codeBlock', 'listItem'];
    if (blockTypes.includes(node.type as string) && text.length > 0) {
      text += ' ';
    }

    return text;
  }

  let extractedText = '';
  if (Array.isArray(parsedContent)) {
    extractedText = parsedContent.map((node) => extract(node as Record<string, unknown>)).join('');
  } else {
    extractedText = extract(parsedContent as Record<string, unknown>);
  }

  return extractedText.replace(/\s+/g, ' ').trim();
}

/**
 * Tiptap JSONContent에서 이미지 URL 배열을 추출
 * @param node - Tiptap JSON 콘텐츠 노드
 * @returns 이미지 URL 배열
 */
export function extractImageUrlsFromTiptap(node: JSONContent | null | undefined): string[] {
  if (!node) return [];

  let urls: string[] = [];

  if (node.type === 'image' && node.attrs?.src) {
    urls.push(node.attrs.src as string);
  }

  if (node.content && Array.isArray(node.content)) {
    node.content.forEach((child) => {
      urls = urls.concat(extractImageUrlsFromTiptap(child));
    });
  }

  return urls;
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

/**
 * Tiptap JSON 데이터에서 heading 노드를 추출하여 목차 아이템 배열을 반환한다.
 */
export function extractTocFromTiptap(json: any): TocItem[] {
  if (!json || typeof json !== 'object') return [];

  const toc: TocItem[] = [];

  const traverse = (node: any) => {
    if (node.type === 'heading' && node.attrs?.level) {
      const text = node.content?.map((c: any) => c.text).join('') || '';
      if (text) {
        // ID 생성 규칙: 영문, 숫자, 한글만 남기고 공백은 하이픈으로 변경
        let id = text
          .toLowerCase()
          .replace(/[^a-z0-9가-힣\s]/g, '')
          .trim()
          .replace(/\s+/g, '-');
        if (!id) {
          // 특수문자만 있는 경우를 대비해 해시코드나 임의 문자열 사용
          id = `heading-${Math.random().toString(36).substr(2, 9)}`;
        }
        toc.push({ id, text, level: node.attrs.level });
      }
    }

    if (node.content && Array.isArray(node.content)) {
      node.content.forEach(traverse);
    }
  };

  traverse(json);
  return toc;
}
