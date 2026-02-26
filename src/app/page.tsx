import Link from 'next/link';
import { Github, Mail } from 'lucide-react';
import Tooltip from '@/components/Tooltip';
import MusicPlayer from '@/components/MusicPlayer';
import WriteLinkButton from '@/components/WriteLinkButton';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] relative overflow-hidden">
      <WriteLinkButton />
      <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        {/* 🔥 상단 헤더 영역: flex justify-between으로 양끝 정렬 */}
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            .Blog
          </h1>
          <MusicPlayer size={52} className="md:hidden p-2! rounded-full!" />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* 좌측 사이드바: 기본(모바일/태블릿)은 flex-col(세로) -> md에서 flex-row(가로) -> lg에서 다시 flex-col(세로) */}
          <aside className="lg:col-span-1 flex flex-col md:flex-row lg:flex-col gap-6">
            {/* 개발자 정보 카드 (가로 정렬 시 1:1 비율을 위해 flex-1 추가) */}
            <div className="flex-1 bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-neutral-800 flex flex-col justify-center">
              <div>
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">우재현</h2>
                <p className="text-sm text-gray-600 dark:text-neutral-400 mb-2">
                  Dong-eui University <br />
                  Applied Software
                </p>
              </div>

              <div className="pt-4 mt-auto border-t border-gray-100 dark:border-neutral-800 space-y-2 flex gap-4">
                <Tooltip content="dnwogus4260@naver.com">
                  <a
                    href="mailto:dnwogus4260@naver.com"
                    className="block text-sm hover:text-orange-500 hover:underline text-gray-700 dark:text-neutral-300"
                  >
                    <Mail />
                  </a>
                </Tooltip>
                <Tooltip content="neruu00">
                  <a
                    href="https://github.com/neruu00"
                    target="_blank"
                    rel="noreferrer"
                    className="block text-sm hover:text-orange-500 hover:underline text-gray-700 dark:text-neutral-300"
                  >
                    <Github />
                  </a>
                </Tooltip>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {['Next.js', 'React', 'TypeScript', 'Supabase', 'Tailwind'].map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-1 bg-gray-100 dark:bg-neutral-800 text-xs text-gray-700 dark:text-neutral-300 rounded-md"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <MusicPlayer className="hidden md:flex" />
          </aside>

          {/* 우측 메인 영역 (최신 게시물) */}
          <section className="lg:col-span-2">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">최신 포스트</h2>
              <Link
                href="/posts"
                className="text-sm text-orange-500 hover:text-orange-600 font-medium"
              >
                전체 보기 &rarr;
              </Link>
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <article
                  key={item}
                  className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-neutral-800 hover:border-orange-400 dark:hover:border-orange-500 transition-colors group cursor-pointer"
                >
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors">
                    서버 사이드 렌더링(SSR)과 Tiptap 에디터 트러블슈팅
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400 line-clamp-2">
                    Next.js App Router 환경에서 Tiptap 에디터를 도입할 때 발생하는 Hydration 에러를
                    해결하고, 성능을 최적화하는 방법에 대해 알아봅니다.
                  </p>
                  <div className="mt-4 text-xs text-gray-500 dark:text-neutral-500">
                    2026. 02. 25
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
