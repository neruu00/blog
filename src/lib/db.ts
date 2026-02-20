import mongoose from 'mongoose';

// TypeScript에서 global 객체에 mongoose 속성을 추가하기 위한 선언
declare global {
  // eslint-disable-next-line no-unused-vars
  var mongoose: {
    conn: typeof import('mongoose') | null;
    promise: Promise<typeof import('mongoose')> | null;
  };
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('환경 변수 설정 오류: .env.local 파일에 MONGODB_URI를 정의해 주세요.');
}

// 글로벌 객체에 캐시된 커넥션이 있으면 가져오고, 없으면 초기화합니다.
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// DB 연결 싱글톤 패턴 적용
async function connectDB() {
  // 1. 이미 연결된 커넥션이 있다면 재사용합니다.
  if (cached.conn) {
    return cached.conn;
  }

  // 2. 연결 진행 중인 프로미스가 없다면 새로 연결을 시도합니다.
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Mongoose가 연결 전 명령을 버퍼링하지 않도록 설정
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      // eslint-disable-next-line no-console
      console.log('Connected MongoDB! 🚀');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
