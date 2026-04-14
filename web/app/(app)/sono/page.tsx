'use client';

import { useState, useEffect } from 'react';
import { Sono } from '../../lib/types';

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

export default function SonoPage() {
  const [sonos, setSonos] = useState<Sono[]>([]);
  const [sonoAtual, setSonoAtual] = useState<Sono | null>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    const res = await fetch('/api/baby');
    const data = await res.json();
    setSonos(data.ultimosSonos ?? []);
    setSonoAtual(data.sonoAtual?.emAndamento ? data.sonoAtual : null);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  async function iniciarSono() {
    setSalvando(true);
    await fetch('/api/baby/sono', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    await carregar();
    setSalvando(false);
  }

  async function finalizarSono() {
    setSalvando(true);
    await fetch('/api/baby/sono', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    await carregar();
    setSalvando(false);
  }

  if (loading) return <p className="text-slate-400 text-center py-10">Carregando...</p>;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-800">🌙 Sono</h1>

      {sonoAtual ? (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 text-center">
          <p className="text-3xl mb-2">💤</p>
          <p className="font-semibold text-indigo-700 mb-1">Dormindo agora</p>
          <p className="text-indigo-500 text-sm mb-4">Começou {tempoDecorrido(sonoAtual.iniciadoEm)}</p>
          <button onClick={finalizarSono} disabled={salvando} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50">
            Bebê acordou
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-5 text-center">
          <p className="text-3xl mb-2">🌙</p>
          <p className="text-slate-600 text-sm mb-4">Bebê não está dormindo agora.</p>
          <button onClick={iniciarSono} disabled={salvando} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50">
            {salvando ? 'Salvando...' : 'Bebê foi dormir'}
          </button>
        </div>
      )}

      <section>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Histórico</h2>
        <div className="flex flex-col gap-2">
          {sonos.length === 0 && <p className="text-slate-400 text-sm text-center py-4">Nenhum sono registrado.</p>}
          {sonos.map((s) => (
            <div key={s.id} className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-3">
              <span className="text-xl">🌙</span>
              <div>
                <p className="text-sm font-medium text-slate-700">{s.duracaoMinutos ? formatarDuracao(s.duracaoMinutos) : 'Duração desconhecida'}</p>
                <p className="text-xs text-slate-400">{tempoDecorrido(s.finalizadoEm ?? s.iniciadoEm)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
