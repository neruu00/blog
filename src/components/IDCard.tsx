import { Github, Mail } from 'lucide-react';

import Tooltip from '@/components/Tooltip';

export default function IDCard() {
  return (
    <aside className="relative flex flex-col items-center lg:col-span-1">
      {/* Lanyard String */}
      <div className="bg-brand absolute -top-[1000px] left-1/2 z-0 ml-[-12px] h-[1000px] w-6 shadow-sm"></div>

      {/* ID Card Wrapper */}
      <div className="relative z-10 flex w-full max-w-xs flex-col pt-4">
        {/* ID Card Clip */}
        <div className="absolute top-0 left-1/2 z-20 -ml-6 flex h-6 w-12 items-end justify-center rounded-b-xl border-2 border-slate-300 bg-slate-200 pb-1 shadow-inner dark:border-slate-600 dark:bg-slate-700">
          <div className="bg-brand h-3 w-6 rounded-t-md"></div>
        </div>

        {/* ID Card Body */}
        <div className="flip-card mt-2 h-[420px] w-full">
          <div className="flip-card-inner relative h-full w-full rounded-md border border-slate-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
            {/* FRONT */}
            <div className="flip-card-front flex flex-col items-center overflow-hidden rounded-md bg-white dark:bg-neutral-900">
              <div className="flex w-full shrink-0 flex-col">
                <div className="bg-brand relative flex h-12 w-full items-start justify-center pt-2">
                  <div className="h-3 w-20 rounded-full border-[1.5px] border-[#4a859a]/20 bg-white opacity-90 shadow-inner dark:bg-neutral-900"></div>
                </div>
                <div className="h-4 w-full bg-[#4a859a]"></div>
              </div>

              <div className="flex w-full grow flex-col items-center justify-center p-6">
                <img
                  src="https://avatars.githubusercontent.com/u/71242138?v=4"
                  alt="Jaehyeon Woo Profile"
                  className="size-32 object-cover"
                />
                <div className="mt-2 flex flex-col items-center text-center">
                  <p className="mb-1 font-sans text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
                    Developer
                  </p>
                  <h2 className="mb-1 font-serif text-2xl font-black tracking-widest text-slate-800 uppercase dark:text-slate-100">
                    우재현
                  </h2>
                  <p className="font-mono text-[10px] tracking-widest text-slate-400">neruu00</p>
                </div>
              </div>

              <div className="flex h-10 w-full shrink-0 items-center justify-between bg-[#4a4f54] px-4 dark:bg-slate-800">
                <span className="text-[11px] font-bold tracking-widest text-white uppercase">
                  OFFICIAL
                </span>
                <div className="flex h-5 items-center gap-[3px] opacity-90">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
                    <div
                      key={i}
                      className={`h-full bg-white`}
                      style={{ width: i % 3 === 0 ? '3px' : '1.5px' }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* BACK */}
            <div className="flip-card-back flex flex-col items-center overflow-hidden rounded-md bg-white dark:bg-neutral-900">
              <div className="flex w-full shrink-0 flex-col">
                <div className="bg-brand relative flex h-12 w-full items-start justify-center pt-2">
                  <div className="h-3 w-20 rounded-full border-[1.5px] border-[#4a859a]/20 bg-white opacity-90 shadow-inner dark:bg-neutral-900"></div>
                </div>
                <div className="h-4 w-full bg-[#4a859a]"></div>
              </div>

              <div className="flex w-full grow flex-col items-center justify-center gap-6 p-8">
                <div className="z-10 flex w-[80%] flex-col gap-3 py-4">
                  <Tooltip content="neruu00">
                    <a
                      href="https://github.com/neruu00"
                      target="_blank"
                      rel="noreferrer"
                      className="flex w-full items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-bold text-slate-600 transition-colors hover:border-[#5bc2c8] hover:bg-[#5bc2c8] hover:text-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-slate-300 dark:hover:bg-[#5bc2c8]"
                    >
                      <Github className="mr-2 h-4 w-4" /> GITHUB
                    </a>
                  </Tooltip>

                  <Tooltip content="dnwogus4260@naver.com">
                    <a
                      href="mailto:dnwogus4260@naver.com"
                      className="flex w-full items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-bold text-slate-600 transition-colors hover:border-[#5bc2c8] hover:bg-[#5bc2c8] hover:text-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-slate-300 dark:hover:bg-[#5bc2c8]"
                    >
                      <Mail className="mr-2 h-4 w-4" /> EMAIL
                    </a>
                  </Tooltip>
                </div>
              </div>

              <div className="flex h-10 w-full shrink-0 items-center justify-center bg-[#4a4f54] px-2 dark:bg-slate-800">
                <span className="font-sans text-[8px] tracking-wider text-white opacity-70 sm:text-[9px]">
                  ®&© 2026 neruu00. All Rights Reserved.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
