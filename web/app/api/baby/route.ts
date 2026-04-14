import { NextResponse } from 'next/server';
import { getSessao } from '../../lib/auth';
import { lerEstado } from '../../lib/dynamodb';

export async function GET() {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
  const estado = await lerEstado(sessao.sub);
  return NextResponse.json(estado);
}
