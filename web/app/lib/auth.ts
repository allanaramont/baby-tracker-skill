import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { SessionPayload } from './types';

const SESSION_COOKIE = 'diario_session';
const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? 'dev-secret-change-in-production-please'
);

export async function criarSessao(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SECRET);
}

export async function verificarSessao(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSessao(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verificarSessao(token);
}

export function cognitoAuthorizeUrl(redirectUri: string): string {
  const domain = process.env.COGNITO_DOMAIN!.trim();
  const clientId = process.env.COGNITO_CLIENT_ID!.trim();
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    scope: 'openid email profile',
    redirect_uri: redirectUri,
    identity_provider: 'LoginWithAmazon',
  });
  return `${domain}/oauth2/authorize?${params}`;
}

export async function trocarCodePorTokens(code: string, redirectUri: string) {
  const domain = process.env.COGNITO_DOMAIN!.trim();
  const clientId = process.env.COGNITO_CLIENT_ID!.trim();
  const clientSecret = process.env.COGNITO_CLIENT_SECRET!.trim();
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(`${domain}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Falha ao trocar codigo por tokens: ${err}`);
  }

  return res.json() as Promise<{
    id_token: string;
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }>;
}

export function decodificarIdToken(idToken: string): SessionPayload {
  const parts = idToken.split('.');
  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name ?? payload['cognito:username'],
  };
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
