import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verificarSessao, SESSION_COOKIE_NAME } from './app/lib/auth';

const ROTAS_PUBLICAS_EXATAS = ['/'];
const ROTAS_PUBLICAS_PREFIXO = ['/login', '/termos', '/privacidade', '/api/auth', '/api/debug'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublica =
    ROTAS_PUBLICAS_EXATAS.includes(pathname) ||
    ROTAS_PUBLICAS_PREFIXO.some((r) => pathname.startsWith(r));

  if (isPublica || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const sessao = await verificarSessao(token);
  if (!sessao) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
