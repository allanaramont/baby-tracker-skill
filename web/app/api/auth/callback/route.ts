import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { trocarCodePorTokens, decodificarIdToken, criarSessao, SESSION_COOKIE_NAME } from '../../../lib/auth';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(`${origin}/login?error=${error ?? 'sem_codigo'}`);
  }

  try {
    const baseUrl = process.env.NEXTAUTH_URL!.trim();
    const redirectUri = `${baseUrl}/api/auth/callback`;

    const tokens = await trocarCodePorTokens(code, redirectUri);
    const sessaoPayload = decodificarIdToken(tokens.id_token);
    const sessionToken = await criarSessao(sessaoPayload);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL!.trim()}/dashboard`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Erro no callback OAuth:', msg);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL!.trim()}/login?error=${encodeURIComponent(msg)}`
    );
  }
}
