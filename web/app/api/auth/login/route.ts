import { NextResponse } from 'next/server';
import { cognitoAuthorizeUrl } from '../../../lib/auth';

export async function GET() {
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback`;
  const url = cognitoAuthorizeUrl(redirectUri);
  return NextResponse.redirect(url);
}
