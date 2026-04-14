import Link from 'next/link';
import { getSessao } from '../lib/auth';
import { redirect } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Início', icon: '🏠' },
  { href: '/alimentacao', label: 'Alimentação', icon: '🍼' },
  { href: '/fraldas', label: 'Fraldas', icon: '🩲' },
  { href: '/sono', label: 'Sono', icon: '🌙' },
  { href: '/peso', label: 'Peso', icon: '⚖️' },
  { href: '/remedios', label: 'Remédios', icon: '💊' },
  { href: '/como-usar', label: 'Guia', icon: '📖' },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const sessao = await getSessao();
  if (!sessao) redirect('/login');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">👶</span>
            <span className="font-bold text-slate-800 text-sm">Diário do Bebê</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/configuracoes" className="text-slate-500 hover:text-slate-700 text-sm">⚙️</Link>
            <a href="/api/auth/logout" className="text-xs text-slate-400 hover:text-slate-600">Sair</a>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6">{children}</main>

      <nav className="bg-white border-t border-slate-200 sticky bottom-0">
        <div className="max-w-2xl mx-auto px-2 flex justify-around">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 py-2 px-2 text-slate-500 hover:text-rose-500 transition-colors"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
