import { NextResponse } from 'next/server';
import { getSessao } from '../../../lib/auth';
import { lerEstado, salvarEstado, gerarId } from '../../../lib/dynamodb';
import { Mamada } from '../../../lib/types';

export async function POST(request: Request) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });

  const body = await request.json();
  const { subtipo = 'peito', lado, duracaoMinutos, iniciadaEm, finalizadaEm } = body;

  const agora = Date.now();
  const inicio = iniciadaEm ?? (duracaoMinutos ? agora - duracaoMinutos * 60 * 1000 : agora);
  const fim = finalizadaEm ?? (duracaoMinutos ? agora : undefined);

  const mamada: Mamada = {
    id: gerarId(),
    tipo: 'mamada',
    subtipo,
    lado,
    iniciadaEm: inicio,
    finalizadaEm: fim,
    duracaoMinutos,
    emAndamento: !fim,
  };

  const estado = await lerEstado(sessao.sub);

  if (mamada.emAndamento) {
    estado.mamadaAtual = mamada;
  } else {
    estado.ultimasMamadas = [mamada, ...(estado.ultimasMamadas ?? [])].slice(0, 20);
    if (lado) estado.ultimoLadoMamada = lado as Mamada['lado'];
  }

  await salvarEstado(sessao.sub, estado);
  return NextResponse.json(mamada, { status: 201 });
}

export async function PATCH(request: Request) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { duracaoMinutos } = body;

  const estado = await lerEstado(sessao.sub);
  if (!estado.mamadaAtual?.emAndamento) {
    return NextResponse.json({ error: 'Nenhuma mamada em andamento' }, { status: 400 });
  }

  const agora = Date.now();
  const mamadaFinalizada: Mamada = {
    ...estado.mamadaAtual,
    finalizadaEm: agora,
    emAndamento: false,
    duracaoMinutos: duracaoMinutos ?? Math.round((agora - estado.mamadaAtual.iniciadaEm) / 60000),
  };

  estado.mamadaAtual = undefined;
  estado.ultimasMamadas = [mamadaFinalizada, ...(estado.ultimasMamadas ?? [])].slice(0, 20);
  if (mamadaFinalizada.lado) estado.ultimoLadoMamada = mamadaFinalizada.lado;

  await salvarEstado(sessao.sub, estado);
  return NextResponse.json(mamadaFinalizada);
}
