export function formatarTempo(minutos: number): string {
  if (minutos < 1) return 'menos de 1 minuto';
  if (minutos === 1) return '1 minuto';
  if (minutos < 60) return `${minutos} minutos`;

  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;

  const parteHoras = horas === 1 ? '1 hora' : `${horas} horas`;
  if (mins === 0) return parteHoras;
  const parteMins = mins === 1 ? '1 minuto' : `${mins} minutos`;
  return `${parteHoras} e ${parteMins}`;
}

export function tempoDecorrido(timestampMs: number): string {
  const agora = Date.now();
  const diffMs = agora - timestampMs;
  const minutos = Math.floor(diffMs / 60000);
  return formatarTempo(minutos);
}

export function calcularDuracaoMinutos(inicioMs: number, fimMs: number): number {
  return Math.round((fimMs - inicioMs) / 60000);
}

export function calcularDuracaoSegundos(inicioMs: number, fimMs: number): number {
  return Math.max(0, Math.round((fimMs - inicioMs) / 1000));
}

export function gerarId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatarHora(timestampMs: number): string {
  const data = new Date(timestampMs);
  const horas = data.getHours().toString().padStart(2, '0');
  const minutos = data.getMinutes().toString().padStart(2, '0');
  return `${horas}h${minutos}`;
}

export function formatarHoraNoFuso(timestampMs: number, timeZone?: string): string {
  const partes = new Intl.DateTimeFormat('pt-BR', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(timestampMs));

  const horas = partes.find((parte) => parte.type === 'hour')?.value ?? '00';
  const minutos = partes.find((parte) => parte.type === 'minute')?.value ?? '00';
  return `${horas}h${minutos}`;
}

export function obterChaveDataNoFuso(timestampMs: number, timeZone?: string): string {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(timestampMs));

  const ano = partes.find((parte) => parte.type === 'year')?.value ?? '0000';
  const mes = partes.find((parte) => parte.type === 'month')?.value ?? '00';
  const dia = partes.find((parte) => parte.type === 'day')?.value ?? '00';
  return `${ano}-${mes}-${dia}`;
}

export function formatarDuracaoCronometro(totalSegundos: number): string {
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;
  return `${minutos}:${segundos.toString().padStart(2, '0')}`;
}

export function ladoOposto(lado: 'esquerdo' | 'direito' | 'ambos'): string {
  if (lado === 'esquerdo') return 'direito';
  if (lado === 'direito') return 'esquerdo';
  return 'esquerdo';
}

export function formatarLado(lado: string): string {
  const mapa: Record<string, string> = {
    esquerdo: 'peito esquerdo',
    direito: 'peito direito',
    ambos: 'ambos os peitos',
  };
  return mapa[lado] ?? lado;
}

export function formatarFralda(tipo: string): string {
  const mapa: Record<string, string> = {
    xixi: 'só xixi',
    coco: 'cocô',
    os_dois: 'xixi e cocô',
  };
  return mapa[tipo] ?? tipo;
}
