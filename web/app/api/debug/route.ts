import { NextResponse } from 'next/server';
import { lwaAuthorizeUrl, lwaRedirectUri } from '../../lib/auth';

export async function GET() {
  const nextauthUrl = process.env.NEXTAUTH_URL;
  const redirectUri = lwaRedirectUri();
  const authorizeUrl = lwaAuthorizeUrl();

  return NextResponse.json({
    NEXTAUTH_URL: nextauthUrl,
    redirectUri,
    authorizeUrl,
  });
}
