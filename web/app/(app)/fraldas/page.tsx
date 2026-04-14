'use client';

import { useState, useEffect } from 'react';
import { Fralda } from '../../lib/types';

function tempoDecorrido(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 60000);
  if (diff < 1) return 'agora';
  if (diff < 60) return `${diff} min atrás`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return m === 0 ? `${h}h atrás` : `${h}h ${m}min atrás`;
}

const TIPOS: { value: Fralda['tipoBaixo']; label: string; icon: string }[] = [
  { value: 'xixi', label: 'Xixi', icon: '💛' },
  { value: 'coco', label: 'Cocô', icon: '💩' },
  { value: 'os_dois', label: 'Os dois', icon: '🌈' },
];

export default function FraldasPage() {
  const [fraldas, setFraldas] = useState<Fralda[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [tipoBaixo, setTipoBaixo] = useState<Fralda['tipoBaixo']>('xixi');

  async function carregar() {
    const res = await fetch('/api/baby');
    const data = await res.json();
    setFraldas(data.ultimasFraldas ?? []);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  async function registrarFralda() {
    setSalvando(true);
    await fetch('/api/baby/fralda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipoBaixo }),
    });
    await carregar();
    setSalvando(false);
  }

  if (loading) return <p className="text-slate-400 text-center py-10">Carregando...</p>;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-800">🩲 Fraldas</h1>

      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-4">
        <h2 className="font-semibold text-slate-700">Trocar fralda</h2>
        <div className="flex gap-2">
          {TIPOS.map((t) => (
            <button key={t.value} onClick={() => setTipoBaixo(t.value)} className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border text-sm font-medium transition-colors ${tipoBaixo === t.value ? 'bg-amber-100 border-amber-400 text-amber-700' : 'bg-white border-slate-300 text-slate-600'}`}>
              <span className="text-xl">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={registrarFralda} disabled={salvando} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50">
          {salvando ? 'Salvando...' : 'Registrar troca'}
        </button>
      </div>

      <section>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Histórico</h2>
        <div className="flex flex-col gap-2">
          {fraldas.length === 0 && <p className="text-slate-400 text-sm text-center py-4">Nenhuma troca registrada.</p>}
          {fraldas.map((f) => {
            const tipo = TIPOS.find((t) => t.value === f.tipoBaixo);
            return (
              <div key={f.id} className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-3">
                <span className="text-xl">{tipo?.icon}</span>
                <div>
                  <p className="text-sm font-medium text-slate-700">{tipo?.label}</p>
                  <p className="text-xs text-slate-400">{tempoDecorrido(f.registradaEm)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
