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

function lwaClientId() { return process.env.LWA_CLIENT_ID!.trim(); }
function lwaClientSecret() { return process.env.LWA_CLIENT_SECRET!.trim(); }
function appUrl() { return process.env.NEXTAUTH_URL!.trim(); }

export function lwaAuthorizeUrl(): string {
  const params = new URLSearchParams({
    client_id: lwaClientId(),
    response_type: 'code',
    scope: 'profile',
    redirect_uri: `${appUrl()}/api/auth/callback`,
  });
  return `https://www.amazon.com/ap/oa?${params}`;
}

export async function trocarCodePorTokens(code: string) {
  const credentials = Buffer.from(`${lwaClientId()}:${lwaClientSecret()}`).toString('base64');

  const res = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${appUrl()}/api/auth/callback`,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Falha ao trocar tokens: ${err}`);
  }

  return res.json() as Promise<{ access_token: string; refresh_token: string; expires_in: number }>;
}

export async function obterPerfilAmazon(accessToken: string): Promise<SessionPayload> {
  const res = await fetch('https://api.amazon.com/user/profile', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error('Falha ao obter perfil Amazon');

  const profile = await res.json() as { user_id: string; email: string; name: string };
  return {
    sub: profile.user_id,
    email: profile.email,
    name: profile.name,
  };
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
