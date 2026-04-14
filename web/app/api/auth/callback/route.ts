import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { trocarCodePorTokens, obterPerfilAmazon, criarSessao, SESSION_COOKIE_NAME } from '../../../lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const baseUrl = process.env.NEXTAUTH_URL!.trim();

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/login?error=${error ?? 'sem_codigo'}`);
  }

  try {
    const tokens = await trocarCodePorTokens(code);
    const perfil = await obterPerfilAmazon(tokens.access_token);
    const sessionToken = await criarSessao(perfil);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return NextResponse.redirect(`${baseUrl}/dashboard`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Erro no callback:', msg);
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(msg)}`);
  }
}
