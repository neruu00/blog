import TiptapEditor from '@/components/editor/TiptapEditor';

export default function WritePage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto mb-6 flex max-w-4xl items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">새 글 작성</h1>
        <button className="rounded-xl bg-orange-500 px-6 py-2 font-medium text-white shadow-sm transition-colors hover:bg-orange-600">
          출간하기
        </button>
      </div>

      <div className="space-y-6">
        {/* 제목 입력란 */}
        <input
          type="text"
          placeholder="제목을 입력하세요"
          className="dark:prose-invert mx-auto block w-full max-w-4xl border-none bg-transparent text-4xl font-bold text-gray-900 placeholder-gray-300 outline-none"
        />
        <br />

        {/* Tiptap 에디터 */}
        <TiptapEditor />
      </div>
    </main>
  );
}
