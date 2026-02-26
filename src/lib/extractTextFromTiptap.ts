// Tiptap JSON 구조에서 순수 텍스트만 재귀적으로 추출하여 미리보기를 만드는 헬퍼 함수
const extractTextFromTiptap = (node: any): string => {
  if (!node) return '';
  if (node.type === 'text') return node.text || '';
  if (node.content && Array.isArray(node.content)) {
    return node.content.map(extractTextFromTiptap).join(' ');
  }
  return '';
};

export default extractTextFromTiptap;
