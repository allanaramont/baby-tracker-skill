import { NextResponse } from 'next/server';
import { getSessao } from '../../../lib/auth';
import { lerEstado, salvarEstado, gerarId } from '../../../lib/dynamodb';
import { Fralda } from '../../../lib/types';

export async function POST(request: Request) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });

  const { tipoBaixo } = await request.json();
  if (!['xixi', 'coco', 'os_dois'].includes(tipoBaixo)) {
    return NextResponse.json({ error: 'tipoBaixo invalido' }, { status: 400 });
  }

  const fralda: Fralda = {
    id: gerarId(),
    tipo: 'fralda',
    registradaEm: Date.now(),
    tipoBaixo,
  };

  const estado = await lerEstado(sessao.sub);
  estado.ultimasFraldas = [fralda, ...(estado.ultimasFraldas ?? [])].slice(0, 30);

  await salvarEstado(sessao.sub, estado);
  return NextResponse.json(fralda, { status: 201 });
}
