import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '../../../lib/auth';

export async function GET(request: Request) {
  const baseUrl = process.env.NEXTAUTH_URL ?? new URL(request.url).origin;
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);

  const domain = process.env.COGNITO_DOMAIN!;
  const clientId = process.env.COGNITO_CLIENT_ID!;
  const logoutUri = encodeURIComponent(`${baseUrl}/login`);

  return NextResponse.redirect(`${domain}/logout?client_id=${clientId}&logout_uri=${logoutUri}`);
}
