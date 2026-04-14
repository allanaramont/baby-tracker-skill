import { NextResponse } from 'next/server';
import { getSessao } from '../../../lib/auth';
import { lerEstado, salvarEstado, gerarId } from '../../../lib/dynamodb';
import { RegistroRemedio } from '../../../lib/types';

export async function POST(request: Request) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });

  const { nome, dose, unidade } = await request.json();
  if (!nome || !dose || !unidade) {
    return NextResponse.json({ error: 'nome, dose e unidade sao obrigatorios' }, { status: 400 });
  }

  const registro: RegistroRemedio = {
    id: gerarId(),
    tipo: 'remedio',
    registradoEm: Date.now(),
    nome: String(nome).toLowerCase(),
    dose: Number(dose),
    unidade: String(unidade),
  };

  const estado = await lerEstado(sessao.sub);
  estado.ultimosRemedios = [registro, ...(estado.ultimosRemedios ?? [])].slice(0, 50);

  await salvarEstado(sessao.sub, estado);
  return NextResponse.json(registro, { status: 201 });
}
