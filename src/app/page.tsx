import connectDB from '@/lib/db';

export default async function Home() {
  await connectDB();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">개발자 기술 블로그</h1>
      <p className="mt-4 text-gray-600">MongoDB 연결 테스트 중...</p>
    </main>
  );
}
