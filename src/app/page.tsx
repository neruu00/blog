import Link from 'next/link';
import { Github, Mail } from 'lucide-react';
import Tooltip from '@/components/Tooltip';
import MusicPlayer from '@/components/MusicPlayer';
import WriteLinkButton from '@/components/WriteLinkButton';

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gray-50 dark:bg-[#0a0a0a]">
      <WriteLinkButton />
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-12">
        <header className="mb-12 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            .Blog
          </h1>
          <MusicPlayer size={52} className="rounded-full! p-2! md:hidden" />
        </header>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <aside className="flex flex-col gap-6 md:flex-row lg:col-span-1 lg:flex-col">
            <div className="flex flex-1 flex-col justify-center rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div>
                <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">우재현</h2>
                <p className="mb-2 text-sm text-gray-600 dark:text-neutral-400">
                  Dong-eui University <br />
                  Applied Software
                </p>
              </div>

              <div className="mt-auto flex gap-4 space-y-2 border-t border-gray-100 pt-4 dark:border-neutral-800">
                <Tooltip content="dnwogus4260@naver.com">
                  <a
                    href="mailto:dnwogus4260@naver.com"
                    className="block text-sm text-gray-700 hover:text-orange-500 hover:underline dark:text-neutral-300"
                  >
                    <Mail />
                  </a>
                </Tooltip>
                <Tooltip content="neruu00">
                  <a
                    href="https://github.com/neruu00"
                    target="_blank"
                    rel="noreferrer"
                    className="block text-sm text-gray-700 hover:text-orange-500 hover:underline dark:text-neutral-300"
                  >
                    <Github />
                  </a>
                </Tooltip>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {['Next.js', 'React', 'TypeScript', 'Supabase', 'Tailwind'].map((tech) => (
                  <span
                    key={tech}
                    className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-neutral-800 dark:text-neutral-300"
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
            <div className="mb-6 flex items-end justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">최신 포스트</h2>
              <Link
                href="/posts"
                className="text-sm font-medium text-orange-500 hover:text-orange-600"
              >
                전체 보기 &rarr;
              </Link>
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <article
                  key={item}
                  className="group cursor-pointer rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:border-orange-400 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-orange-500"
                >
                  <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-orange-500 dark:text-white">
                    서버 사이드 렌더링(SSR)과 Tiptap 에디터 트러블슈팅
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-neutral-400">
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
