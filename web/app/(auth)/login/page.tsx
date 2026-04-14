export default function LoginPage() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
      <div className="text-5xl mb-4">👶</div>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Diário do Bebê</h1>
      <p className="text-slate-500 text-sm mb-8">
        Registre amamentações, fraldas, sono e muito mais.
      </p>
      <a
        href="/api/auth/login"
        className="flex items-center justify-center gap-3 w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold py-3 px-6 rounded-xl transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"/>
        </svg>
        Entrar com Amazon
      </a>
      <p className="text-xs text-slate-400 mt-6">
        Use a mesma conta da Alexa — seus dados ficam sincronizados automaticamente.
      </p>
    </div>
  );
}
