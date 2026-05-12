import { redirect } from 'next/navigation';
import { getSessao } from '../../lib/auth';

export default async function LoginPage() {
  const sessao = await getSessao();
  if (sessao) redirect('/dashboard');

  return (
    <div
      className="rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
    >
      <div className="flex justify-center mb-4">
        <img src="/logo.png" alt="Diário do Bebê" className="w-20 h-20 rounded-full shadow-lg" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-1">Diário do Bebê</h1>
      <p className="text-white/50 text-sm mb-8">
        Registre amamentações, fraldas, sono e muito mais.
      </p>
      <a
        href="/api/auth/login"
        className="flex items-center justify-center gap-3 w-full font-semibold py-3 px-6 rounded-xl transition-opacity hover:opacity-90"
        style={{ background: '#f5c842', color: '#0f1e3a' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"/>
        </svg>
        Entrar com Amazon
      </a>
      <p className="text-xs text-white/30 mt-6">
        Use a mesma conta da Alexa — seus dados ficam sincronizados automaticamente.
      </p>
      <div className="flex justify-center gap-4 mt-6">
        <a href="/termos" className="text-white/20 hover:text-white/40 text-xs transition-colors">Termos de Uso</a>
        <a href="/privacidade" className="text-white/20 hover:text-white/40 text-xs transition-colors">Privacidade</a>
      </div>
    </div>
  );
}
