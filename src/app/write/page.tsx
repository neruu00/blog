import TiptapEditor from '@/components/editor/TiptapEditor';

export default function WritePage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">새 글 작성</h1>
        <button className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors shadow-sm">
          출간하기
        </button>
      </div>

      <div className="space-y-6">
        {/* 제목 입력란 */}
        <input
          type="text"
          placeholder="제목을 입력하세요"
          className="w-full max-w-4xl dark:prose-invert mx-auto block text-4xl font-bold bg-transparent border-none outline-none placeholder-gray-300 text-gray-900"
        />
        <br />

        {/* Tiptap 에디터 */}
        <TiptapEditor />
      </div>
    </main>
  );
}
