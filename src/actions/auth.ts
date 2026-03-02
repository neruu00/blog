'use server';

import { cookies } from 'next/headers';
import * as OTPAuth from 'otpauth';

export async function verifyOTP(otpCode: string) {
  const secret = process.env.OTP_SECRET;
  const sessionSecret = process.env.SESSION_SECRET;

  if (!secret || !sessionSecret) {
    throw new Error('must set environment variables for OTP verification');
  }

  // USAGE https://hectorm.github.io/otpauth/classes/TOTP.html
  const totp = new OTPAuth.TOTP({
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });

  const delta = totp.validate({ token: otpCode, window: 1 });

  if (delta !== null) {
    const encodedSecret = Buffer.from(sessionSecret).toString('base64');

    (await cookies()).set('admin_session', encodedSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/',
    });
    return { success: true };
  } else {
    return { success: false, error: 'invalid OTP code' };
  }
}

export async function logout() {
  (await cookies()).delete('admin_session');
}
