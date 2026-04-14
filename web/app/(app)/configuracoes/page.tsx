'use client';

import { useState, useEffect } from 'react';

export default function ConfiguracoesPage() {
  const [nomeBebe, setNomeBebe] = useState('');
  const [nomeAtual, setNomeAtual] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/baby').then((r) => r.json()).then((data) => {
      setNomeAtual(data.nomeBebe ?? '');
      setNomeBebe(data.nomeBebe ?? '');
      setLoading(false);
    });
  }, []);

  async function salvarNome() {
    if (!nomeBebe.trim()) return;
    setSalvando(true);
    await fetch('/api/baby/bebe', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomeBebe: nomeBebe.trim() }),
    });
    setNomeAtual(nomeBebe.trim());
    setSucesso(true);
    setSalvando(false);
    setTimeout(() => setSucesso(false), 2000);
  }

  if (loading) return <p className="text-slate-400 text-center py-10">Carregando...</p>;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-800">⚙️ Configurações</h1>

      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-4">
        <h2 className="font-semibold text-slate-700">Nome do bebê</h2>
        {nomeAtual && <p className="text-sm text-slate-500">Nome atual: <span className="font-medium text-slate-700">{nomeAtual}</span></p>}
        <input type="text" placeholder="Nome do bebê" value={nomeBebe} onChange={(e) => setNomeBebe(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
        <button onClick={salvarNome} disabled={salvando || !nomeBebe.trim() || nomeBebe.trim() === nomeAtual} className="w-full bg-slate-700 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50">
          {sucesso ? 'Salvo!' : salvando ? 'Salvando...' : 'Salvar nome'}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h2 className="font-semibold text-blue-700 mb-2">Conexão com Alexa</h2>
        <p className="text-sm text-blue-600 mb-3">Para usar a skill com sua conta, vincule no app Alexa.</p>
        <div className="bg-white rounded-lg p-3 border border-blue-200">
          <p className="text-xs text-slate-500 font-medium mb-1">Passos:</p>
          <ol className="text-xs text-slate-600 list-decimal list-inside space-y-1">
            <li>Abra o app Alexa no celular</li>
            <li>Mais → Skills e Jogos → Dev → Diário do Bebê</li>
            <li>Configurações → Vincular conta</li>
            <li>Faça login com sua conta</li>
          </ol>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h2 className="font-semibold text-slate-700 mb-2">Conta</h2>
        <a href="/api/auth/logout" className="block w-full text-center text-red-500 border border-red-200 hover:bg-red-50 font-semibold py-3 rounded-xl transition-colors">
          Sair da conta
        </a>
      </div>
    </div>
  );
}
