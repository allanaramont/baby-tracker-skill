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
        className="block w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
      >
        Entrar com sua conta
      </a>
      <p className="text-xs text-slate-400 mt-6">
        Ao entrar, seus dados são vinculados à skill Alexa automaticamente.
      </p>
    </div>
  );
}
