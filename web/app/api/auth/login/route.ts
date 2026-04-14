import { NextResponse } from 'next/server';
import { cognitoAuthorizeUrl } from '../../../lib/auth';

export async function GET(request: Request) {
  const baseUrl = process.env.NEXTAUTH_URL ?? new URL(request.url).origin;
  const redirectUri = `${baseUrl}/api/auth/callback`;
  const url = cognitoAuthorizeUrl(redirectUri);
  return NextResponse.redirect(url);
}
