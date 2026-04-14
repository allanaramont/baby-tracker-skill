'use client';

import { useState, useEffect } from 'react';
import { RegistroPeso } from '../../lib/types';

function tempoDecorrido(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 60000);
  if (diff < 1) return 'agora';
  if (diff < 60) return `${diff} min atrás`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  return `${d} dia${d !== 1 ? 's' : ''} atrás`;
}

function formatarPeso(gramas: number): string {
  if (gramas >= 1000) return `${(gramas / 1000).toFixed(3).replace('.', ',')} kg`;
  return `${gramas} g`;
}

export default function PesoPage() {
  const [registros, setRegistros] = useState<RegistroPeso[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [quilos, setQuilos] = useState('');
  const [gramas, setGramas] = useState('');

  async function carregar() {
    const res = await fetch('/api/baby');
    const data = await res.json();
    setRegistros(data.registrosPeso ?? []);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  async function registrarPeso() {
    const totalGramas = (parseFloat(quilos || '0') * 1000) + parseFloat(gramas || '0');
    if (!totalGramas) return;
    setSalvando(true);
    await fetch('/api/baby/peso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pesoGramas: totalGramas }),
    });
    await carregar();
    setQuilos('');
    setGramas('');
    setSalvando(false);
  }

  const ultimoPeso = registros[0];
  const penultimoPeso = registros[1];
  const variacao = ultimoPeso && penultimoPeso ? ultimoPeso.pesoGramas - penultimoPeso.pesoGramas : null;

  if (loading) return <p className="text-slate-400 text-center py-10">Carregando...</p>;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-800">⚖️ Peso</h1>

      {ultimoPeso && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-4">
          <span className="text-3xl">⚖️</span>
          <div>
            <p className="text-xs text-emerald-500 font-medium">Último peso registrado</p>
            <p className="text-2xl font-bold text-emerald-700">{formatarPeso(ultimoPeso.pesoGramas)}</p>
            {variacao !== null && (
              <p className={`text-sm font-medium ${variacao >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {variacao >= 0 ? '+' : ''}{variacao}g desde o último
              </p>
            )}
            <p className="text-xs text-emerald-400">{tempoDecorrido(ultimoPeso.registradoEm)}</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-4">
        <h2 className="font-semibold text-slate-700">Registrar peso</h2>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">Quilos</label>
            <input type="number" min="0" step="1" placeholder="ex: 4" value={quilos} onChange={(e) => setQuilos(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
          </div>
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">Gramas</label>
            <input type="number" min="0" max="999" step="1" placeholder="ex: 350" value={gramas} onChange={(e) => setGramas(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
          </div>
        </div>
        {(quilos || gramas) && (
          <p className="text-sm text-slate-500 text-center">Total: {formatarPeso((parseFloat(quilos || '0') * 1000) + parseFloat(gramas || '0'))}</p>
        )}
        <button onClick={registrarPeso} disabled={salvando || (!quilos && !gramas)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50">
          {salvando ? 'Salvando...' : 'Salvar peso'}
        </button>
      </div>

      <section>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Histórico</h2>
        <div className="flex flex-col gap-2">
          {registros.length === 0 && <p className="text-slate-400 text-sm text-center py-4">Nenhum peso registrado.</p>}
          {registros.map((r, i) => {
            const anterior = registros[i + 1];
            const diff = anterior ? r.pesoGramas - anterior.pesoGramas : null;
            return (
              <div key={r.id} className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-3">
                <span className="text-xl">⚖️</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">{formatarPeso(r.pesoGramas)}</p>
                  <p className="text-xs text-slate-400">{tempoDecorrido(r.registradoEm)}</p>
                </div>
                {diff !== null && (
                  <span className={`text-xs font-medium ${diff >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                    {diff >= 0 ? '+' : ''}{diff}g
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
