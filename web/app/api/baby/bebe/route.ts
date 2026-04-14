import { NextResponse } from 'next/server';
import { getSessao } from '../../../lib/auth';
import { lerEstado, salvarEstado } from '../../../lib/dynamodb';

export async function PATCH(request: Request) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });

  const { nomeBebe } = await request.json();
  if (!nomeBebe || typeof nomeBebe !== 'string') {
    return NextResponse.json({ error: 'nomeBebe obrigatorio' }, { status: 400 });
  }

  const nomeFormatado = nomeBebe.charAt(0).toUpperCase() + nomeBebe.slice(1).toLowerCase();
  const estado = await lerEstado(sessao.sub);
  estado.nomeBebe = nomeFormatado;

  await salvarEstado(sessao.sub, estado);
  return NextResponse.json({ nomeBebe: nomeFormatado });
}
