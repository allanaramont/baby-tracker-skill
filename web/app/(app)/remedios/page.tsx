'use client';

import { useState, useEffect } from 'react';
import { RegistroRemedio } from '../../lib/types';

function tempoDecorrido(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 60000);
  if (diff < 1) return 'agora';
  if (diff < 60) return `${diff} min atrás`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  return `${d} dia${d !== 1 ? 's' : ''} atrás`;
}

const UNIDADES = ['ml', 'mg', 'gotas', 'comprimido'];

export default function RemediosPage() {
  const [remedios, setRemedios] = useState<RegistroRemedio[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [nome, setNome] = useState('');
  const [dose, setDose] = useState('');
  const [unidade, setUnidade] = useState('ml');

  async function carregar() {
    const res = await fetch('/api/baby');
    const data = await res.json();
    setRemedios(data.ultimosRemedios ?? []);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  async function registrarRemedio() {
    if (!nome || !dose) return;
    setSalvando(true);
    await fetch('/api/baby/remedio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, dose: parseFloat(dose), unidade }),
    });
    await carregar();
    setNome('');
    setDose('');
    setSalvando(false);
  }

  if (loading) return <p className="text-slate-400 text-center py-10">Carregando...</p>;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-800">💊 Remédios</h1>

      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-4">
        <h2 className="font-semibold text-slate-700">Registrar remédio</h2>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Nome do remédio</label>
          <input type="text" placeholder="ex: paracetamol" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">Dose</label>
            <input type="number" min="0" step="0.1" placeholder="ex: 5" value={dose} onChange={(e) => setDose(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">Unidade</label>
            <select value={unidade} onChange={(e) => setUnidade(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
              {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <button onClick={registrarRemedio} disabled={salvando || !nome || !dose} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50">
          {salvando ? 'Salvando...' : 'Registrar'}
        </button>
      </div>

      <section>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Histórico</h2>
        <div className="flex flex-col gap-2">
          {remedios.length === 0 && <p className="text-slate-400 text-sm text-center py-4">Nenhum remédio registrado.</p>}
          {remedios.map((r) => (
            <div key={r.id} className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-3">
              <span className="text-xl">💊</span>
              <div>
                <p className="text-sm font-medium text-slate-700 capitalize">{r.nome} — {r.dose} {r.unidade}</p>
                <p className="text-xs text-slate-400">{tempoDecorrido(r.registradoEm)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
