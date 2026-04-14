import { NextResponse } from 'next/server';
import { getSessao } from '../../../lib/auth';
import { lerEstado, salvarEstado, gerarId } from '../../../lib/dynamodb';
import { Sono } from '../../../lib/types';

export async function POST(request: Request) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });

  const body = await request.json().catch(() => ({}));

  const sono: Sono = {
    id: gerarId(),
    tipo: 'sono',
    iniciadoEm: body.iniciadoEm ?? Date.now(),
    emAndamento: true,
  };

  const estado = await lerEstado(sessao.sub);
  estado.sonoAtual = sono;

  await salvarEstado(sessao.sub, estado);
  return NextResponse.json(sono, { status: 201 });
}

export async function PATCH(request: Request) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const estado = await lerEstado(sessao.sub);

  if (!estado.sonoAtual?.emAndamento) {
    return NextResponse.json({ error: 'Nenhum sono em andamento' }, { status: 400 });
  }

  const agora = Date.now();
  const sonoFinalizado: Sono = {
    ...estado.sonoAtual,
    finalizadoEm: agora,
    emAndamento: false,
    duracaoMinutos: body.duracaoMinutos ?? Math.round((agora - estado.sonoAtual.iniciadoEm) / 60000),
  };

  estado.sonoAtual = undefined;
  estado.ultimosSonos = [sonoFinalizado, ...(estado.ultimosSonos ?? [])].slice(0, 20);

  await salvarEstado(sessao.sub, estado);
  return NextResponse.json(sonoFinalizado);
}
