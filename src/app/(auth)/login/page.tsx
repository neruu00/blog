'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';

import { verifyOTP } from '@/actions/auth';
import ConfettiParticles from '@/components/ConfettiParticles';

export default function LoginPage() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleVerify = useCallback(
    async (currentOtp: string) => {
      if (currentOtp.length !== 6 || isLoading || isSuccess) return;

      setIsLoading(true);
      setError('');

      try {
        /**
         * NOTE - 구라 스피너
         * 실제 OTP 검증은 서버에서 매우 빠르게 처리되지만,
         * 인증 시 사용자 경험을 위해 최소 0.5초는 로딩 스피너가 돌아가도록 강제합니다.
         * 반드시 필요한 기능이 아니므로 나중에 필요없다면 제거하세요.
         */
        const [result] = await Promise.all([
          verifyOTP(currentOtp),
          new Promise((resolve) => setTimeout(resolve, 500)),
        ]);

        if (result.success) {
          setIsLoading(false);
          setIsSuccess(true);

          /**
           * NOTE - 구라 컨페티
           * OTP 인증이 성공하면 축하하는 의미로 잠깐 컨페티 애니메이션을 보여줍니다.
           * 실제로는 인증이 성공하자마자 홈으로 리다이렉트해도 무방하지만,
           * 사용자에게 '인증이 완료되었다'는 시각적 피드백을 주기 위해 1.5초 후에 리다이렉트합니다.
           * 꼭 필요한 기능은 아니므로 나중에 필요없다면 제거하세요.
           */
          setTimeout(() => {
            router.push('/');
          }, 1500);
        } else {
          setError(result.error || '인증 실패');
          setOtp('');
          setIsLoading(false);
          inputRef.current?.focus();
        }
      } catch (err) {
        setError('서버 오류가 발생했습니다.');
        setOtp('');
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [isLoading, isSuccess, router],
  );

  useEffect(() => {
    if (otp.length === 6) handleVerify(otp);
  }, [otp, handleVerify]);

  return (
    <>
      {isSuccess && <ConfettiParticles /> /* 인증 성공 시 컨페티 보여줌 */}

      <main className="flex min-h-screen font-sans items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-2xl border-t-8 border-brand bg-white p-8 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 transform -rotate-1">
          <h1 className="mb-8 font-marker text-center text-4xl font-extrabold text-brand dark:text-white">
            Admin Login
          </h1>

          <div className="flex flex-col items-center">
            {/**
             * 사용자에게는 6개의 칸으로 보이도록 디자인되어 있습니다.
             * 사용자가 입력할 때마다 6개의 칸이 각각 채워지는 것처럼 보이지만,
             * 실제로는 하나의 인풋에서 6자리 숫자를 입력받습니다.
             */}
            <div className="relative flex w-full justify-between gap-2">
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0"
                autoFocus
                disabled={isLoading || isSuccess}
              />

              {/* 사용자에게 보여줄 가짜 6칸 입력 필드 */}
              <div
                className={`flex w-full justify-between gap-2 transition-opacity duration-300 ${
                  isLoading || isSuccess ? 'opacity-30' : 'opacity-100'
                }`}
              >
                {[0, 1, 2, 3, 4, 5].map((index) => {
                  const char = otp[index];
                  const isActive = otp.length === index;

                  return (
                    <div
                      key={`otp-char-${index}`}
                      className={`flex h-14 w-10 items-center justify-center border-b-2 font-mono text-3xl transition-colors sm:w-12 ${
                        isActive && !isLoading && !isSuccess
                          ? 'border-brand text-brand'
                          : char
                            ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white'
                            : 'border-slate-300 dark:border-slate-700'
                      } `}
                    >
                      {char || ''}
                    </div>
                  );
                })}
              </div>

              {/* 로딩 스피너 오버레이 */}
              {isLoading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-brand" />
                </div>
              )}
            </div>

            <div className="mt-8 flex h-6 w-full items-center justify-center">
              {isSuccess ? (
                <p className="animate-bounce font-marker text-2xl text-center font-bold text-brand">
                  🎉 AUTHENTICATION SUCCESSFUL!
                </p>
              ) : error ? (
                <p className="text-center text-sm font-medium text-red-500">{error}</p>
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
