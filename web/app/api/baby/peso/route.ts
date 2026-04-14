import { NextResponse } from 'next/server';
import { getSessao } from '../../../lib/auth';
import { lerEstado, salvarEstado, gerarId } from '../../../lib/dynamodb';
import { RegistroPeso } from '../../../lib/types';

export async function POST(request: Request) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });

  const { pesoGramas } = await request.json();
  if (!pesoGramas || typeof pesoGramas !== 'number' || pesoGramas <= 0) {
    return NextResponse.json({ error: 'pesoGramas invalido' }, { status: 400 });
  }

  const registro: RegistroPeso = {
    id: gerarId(),
    tipo: 'peso',
    registradoEm: Date.now(),
    pesoGramas: Math.round(pesoGramas),
  };

  const estado = await lerEstado(sessao.sub);
  estado.registrosPeso = [registro, ...(estado.registrosPeso ?? [])].slice(0, 50);

  await salvarEstado(sessao.sub, estado);
  return NextResponse.json(registro, { status: 201 });
}
