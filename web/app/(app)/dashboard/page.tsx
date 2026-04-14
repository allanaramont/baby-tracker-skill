import { getSessao } from '../../lib/auth';
import { lerEstado } from '../../lib/dynamodb';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Mamada, Fralda, Sono } from '../../lib/types';

function tempoDecorrido(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 60000);
  if (diff < 1) return 'agora';
  if (diff < 60) return `${diff} min atrás`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return m === 0 ? `${h}h atrás` : `${h}h ${m}min atrás`;
}

function formatarDuracao(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

function formatarPeso(gramas: number): string {
  if (gramas >= 1000) return `${(gramas / 1000).toFixed(3).replace('.', ',')} kg`;
  return `${gramas} g`;
}

function CardResumo({ icon, cor, titulo, valor, subtitulo, href }: {
  icon: string; cor: string; titulo: string; valor: string; subtitulo?: string; href: string;
}) {
  return (
    <Link href={href} className="block">
      <div className={`rounded-xl p-4 ${cor}`}>
        <div className="flex items-start justify-between mb-2">
          <span className="text-2xl">{icon}</span>
          <span className="text-xs text-white/70 font-medium">{titulo}</span>
        </div>
        <p className="text-white font-bold text-lg leading-tight">{valor}</p>
        {subtitulo && <p className="text-white/80 text-xs mt-0.5">{subtitulo}</p>}
      </div>
    </Link>
  );
}

export default async function DashboardPage() {
  const sessao = await getSessao();
  if (!sessao) redirect('/login');

  const estado = await lerEstado(sessao.sub);

  const hoje = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const inicioHoje = new Date(hoje.split('/').reverse().join('-') + 'T00:00:00-03:00').getTime();

  const mamadasHoje = [
    ...(estado.ultimasMamadas ?? []),
    ...(estado.mamadaAtual?.emAndamento ? [estado.mamadaAtual] : []),
  ].filter((m: Mamada) => m.iniciadaEm >= inicioHoje);

  const fraldas = (estado.ultimasFraldas ?? []).filter((f: Fralda) => f.registradaEm >= inicioHoje);

  const sonos = [
    ...(estado.ultimosSonos ?? []),
    ...(estado.sonoAtual?.emAndamento ? [estado.sonoAtual] : []),
  ].filter((s: Sono) => s.iniciadoEm >= inicioHoje);

  const totalSonoMinutos = sonos
    .filter((s: Sono) => s.duracaoMinutos)
    .reduce((acc: number, s: Sono) => acc + (s.duracaoMinutos ?? 0), 0);

  const ultimaMamada = estado.mamadaAtual?.emAndamento ? estado.mamadaAtual : estado.ultimasMamadas?.[0];
  const ultimaFralda = estado.ultimasFraldas?.[0];
  const ultimoSono = estado.sonoAtual?.emAndamento ? estado.sonoAtual : estado.ultimosSonos?.[0];
  const ultimoPeso = estado.registrosPeso?.[0];
  const nomeBebe = estado.nomeBebe ?? 'Bebê';

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Olá! Hoje é dia de cuidar de {nomeBebe} 💕</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Sao_Paulo' })}
        </p>
      </div>

      <section>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Resumo de hoje</h2>
        <div className="grid grid-cols-2 gap-3">
          <CardResumo icon="🍼" cor="bg-rose-400" titulo="Alimentações" valor={`${mamadasHoje.length} vez${mamadasHoje.length !== 1 ? 'es' : ''}`} href="/alimentacao" />
          <CardResumo icon="🩲" cor="bg-amber-400" titulo="Fraldas" valor={`${fraldas.length} troca${fraldas.length !== 1 ? 's' : ''}`} href="/fraldas" />
          <CardResumo icon="🌙" cor="bg-indigo-400" titulo="Sono" valor={totalSonoMinutos > 0 ? formatarDuracao(totalSonoMinutos) : '—'} subtitulo={`${sonos.length} período${sonos.length !== 1 ? 's' : ''}`} href="/sono" />
          <CardResumo icon="⚖️" cor="bg-emerald-400" titulo="Último peso" valor={ultimoPeso ? formatarPeso(ultimoPeso.pesoGramas) : '—'} subtitulo={ultimoPeso ? tempoDecorrido(ultimoPeso.registradoEm) : undefined} href="/peso" />
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Status atual</h2>
        <div className="flex flex-col gap-2">
          {estado.mamadaAtual?.emAndamento && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">🍼</span>
              <div>
                <p className="font-semibold text-rose-700 text-sm">Amamentando</p>
                <p className="text-rose-500 text-xs">{estado.mamadaAtual.lado ?? ''} — iniciou {tempoDecorrido(estado.mamadaAtual.iniciadaEm)}</p>
              </div>
              <Link href="/alimentacao" className="ml-auto text-xs bg-rose-500 text-white px-3 py-1.5 rounded-lg">Finalizar</Link>
            </div>
          )}
          {estado.sonoAtual?.emAndamento && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">💤</span>
              <div>
                <p className="font-semibold text-indigo-700 text-sm">Dormindo</p>
                <p className="text-indigo-500 text-xs">Começou {tempoDecorrido(estado.sonoAtual.iniciadoEm)}</p>
              </div>
              <Link href="/sono" className="ml-auto text-xs bg-indigo-500 text-white px-3 py-1.5 rounded-lg">Acordou</Link>
            </div>
          )}
          {!estado.mamadaAtual?.emAndamento && !estado.sonoAtual?.emAndamento && (
            <p className="text-slate-400 text-sm text-center py-2">Nenhuma atividade em andamento.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Últimas atividades</h2>
        <div className="flex flex-col gap-2">
          {ultimaMamada && (
            <div className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-3">
              <span className="text-xl">🍼</span>
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {ultimaMamada.subtipo === 'mamadeira' ? 'Mamadeira' : 'Amamentação'}{ultimaMamada.lado ? ` — ${ultimaMamada.lado}` : ''}
                  {ultimaMamada.duracaoMinutos ? ` — ${formatarDuracao(ultimaMamada.duracaoMinutos)}` : ''}
                </p>
                <p className="text-xs text-slate-400">{tempoDecorrido(ultimaMamada.finalizadaEm ?? ultimaMamada.iniciadaEm)}</p>
              </div>
            </div>
          )}
          {ultimaFralda && (
            <div className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-3">
              <span className="text-xl">🩲</span>
              <div>
                <p className="text-sm font-medium text-slate-700">Fralda de {ultimaFralda.tipoBaixo === 'os_dois' ? 'xixi e cocô' : ultimaFralda.tipoBaixo}</p>
                <p className="text-xs text-slate-400">{tempoDecorrido(ultimaFralda.registradaEm)}</p>
              </div>
            </div>
          )}
          {ultimoSono && !ultimoSono.emAndamento && (
            <div className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-3">
              <span className="text-xl">🌙</span>
              <div>
                <p className="text-sm font-medium text-slate-700">Dormiu{ultimoSono.duracaoMinutos ? ` ${formatarDuracao(ultimoSono.duracaoMinutos)}` : ''}</p>
                <p className="text-xs text-slate-400">{tempoDecorrido(ultimoSono.finalizadoEm ?? ultimoSono.iniciadoEm)}</p>
              </div>
            </div>
          )}
          {!ultimaMamada && !ultimaFralda && !ultimoSono && (
            <p className="text-slate-400 text-sm text-center py-4">Nenhum registro ainda.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Ação rápida</h2>
        <div className="grid grid-cols-3 gap-2">
          {[
            { href: '/alimentacao', label: 'Alimentação', icon: '🍼', cor: 'bg-rose-50 text-rose-700 border-rose-200' },
            { href: '/fraldas', label: 'Fralda', icon: '🩲', cor: 'bg-amber-50 text-amber-700 border-amber-200' },
            { href: '/sono', label: 'Sono', icon: '🌙', cor: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
            { href: '/peso', label: 'Peso', icon: '⚖️', cor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
            { href: '/remedios', label: 'Remédio', icon: '💊', cor: 'bg-orange-50 text-orange-700 border-orange-200' },
            { href: '/configuracoes', label: 'Config', icon: '⚙️', cor: 'bg-slate-50 text-slate-700 border-slate-200' },
          ].map((item) => (
            <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 p-3 rounded-xl border ${item.cor} text-center`}>
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
