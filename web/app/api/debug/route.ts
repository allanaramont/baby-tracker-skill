import { NextResponse } from 'next/server';

export async function GET() {
  const nextauthUrl = process.env.NEXTAUTH_URL;
  const redirectUri = `${nextauthUrl}/api/auth/callback`;
  const cognitoDomain = process.env.COGNITO_DOMAIN;
  const clientId = process.env.COGNITO_CLIENT_ID;

  const authorizeUrl = `${cognitoDomain}/oauth2/authorize?client_id=${clientId}&response_type=code&scope=openid+email+profile&redirect_uri=${encodeURIComponent(redirectUri)}&identity_provider=LoginWithAmazon`;

  return NextResponse.json({
    NEXTAUTH_URL: nextauthUrl,
    redirectUri,
    authorizeUrl,
  });
}
