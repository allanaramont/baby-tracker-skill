'use client';

import { useState, useEffect } from 'react';
import { Mamada } from '../../lib/types';

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

export default function AlimentacaoPage() {
  const [mamadas, setMamadas] = useState<Mamada[]>([]);
  const [mamadaAtual, setMamadaAtual] = useState<Mamada | null>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [subtipo, setSubtipo] = useState<'peito' | 'mamadeira'>('peito');
  const [lado, setLado] = useState('esquerdo');
  const [duracao, setDuracao] = useState('');
  const [showForm, setShowForm] = useState(false);

  async function carregar() {
    const res = await fetch('/api/baby');
    const data = await res.json();
    setMamadas(data.ultimasMamadas ?? []);
    setMamadaAtual(data.mamadaAtual?.emAndamento ? data.mamadaAtual : null);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  async function iniciarMamada() {
    setSalvando(true);
    await fetch('/api/baby/mamada', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subtipo, lado: subtipo === 'peito' ? lado : undefined }),
    });
    await carregar();
    setShowForm(false);
    setSalvando(false);
  }

  async function finalizarMamada() {
    setSalvando(true);
    await fetch('/api/baby/mamada', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    await carregar();
    setSalvando(false);
  }

  async function registrarCompleta() {
    if (!duracao) return;
    setSalvando(true);
    await fetch('/api/baby/mamada', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subtipo, lado: subtipo === 'peito' ? lado : undefined, duracaoMinutos: parseInt(duracao) }),
    });
    await carregar();
    setShowForm(false);
    setDuracao('');
    setSalvando(false);
  }

  if (loading) return <p className="text-slate-400 text-center py-10">Carregando...</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">🍼 Alimentação</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-rose-500 text-white text-sm font-semibold px-4 py-2 rounded-xl">
          + Registrar
        </button>
      </div>

      {mamadaAtual && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <p className="font-semibold text-rose-700 mb-1">Amamentando agora</p>
          <p className="text-rose-500 text-sm mb-3">{mamadaAtual.lado ? `Lado ${mamadaAtual.lado} — ` : ''}iniciou {tempoDecorrido(mamadaAtual.iniciadaEm)}</p>
          <button onClick={finalizarMamada} disabled={salvando} className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50">
            Finalizar amamentação
          </button>
        </div>
      )}

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-4">
          <h2 className="font-semibold text-slate-700">Nova alimentação</h2>
          <div className="flex gap-2">
            {(['peito', 'mamadeira'] as const).map((t) => (
              <button key={t} onClick={() => setSubtipo(t)} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${subtipo === t ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-slate-600 border-slate-300'}`}>
                {t === 'peito' ? '🤱 Peito' : '🍼 Mamadeira'}
              </button>
            ))}
          </div>
          {subtipo === 'peito' && (
            <div className="flex gap-2">
              {['esquerdo', 'direito', 'ambos'].map((l) => (
                <button key={l} onClick={() => setLado(l)} className={`flex-1 py-2 rounded-lg text-sm font-medium border capitalize transition-colors ${lado === l ? 'bg-rose-100 text-rose-700 border-rose-300' : 'bg-white text-slate-600 border-slate-300'}`}>
                  {l}
                </button>
              ))}
            </div>
          )}
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Duração em minutos (opcional)</label>
            <input type="number" min="1" placeholder="ex: 15" value={duracao} onChange={(e) => setDuracao(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
          </div>
          <div className="flex gap-2">
            {!duracao && !mamadaAtual && (
              <button onClick={iniciarMamada} disabled={salvando} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 rounded-lg disabled:opacity-50">Iniciar agora</button>
            )}
            {duracao && (
              <button onClick={registrarCompleta} disabled={salvando} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 rounded-lg disabled:opacity-50">Salvar</button>
            )}
            <button onClick={() => { setShowForm(false); setDuracao(''); }} className="flex-1 bg-slate-100 text-slate-600 font-semibold py-2 rounded-lg">Cancelar</button>
          </div>
        </div>
      )}

      <section>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Histórico</h2>
        <div className="flex flex-col gap-2">
          {mamadas.length === 0 && <p className="text-slate-400 text-sm text-center py-4">Nenhuma alimentação registrada.</p>}
          {mamadas.map((m) => (
            <div key={m.id} className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-3">
              <span className="text-xl">{m.subtipo === 'mamadeira' ? '🍼' : '🤱'}</span>
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {m.subtipo === 'mamadeira' ? 'Mamadeira' : `Peito ${m.lado ?? ''}`}
                  {m.duracaoMinutos ? ` — ${formatarDuracao(m.duracaoMinutos)}` : ''}
                </p>
                <p className="text-xs text-slate-400">{tempoDecorrido(m.finalizadaEm ?? m.iniciadaEm)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
