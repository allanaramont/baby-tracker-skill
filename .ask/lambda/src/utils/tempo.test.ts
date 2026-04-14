import { formatarTempo, tempoDecorrido, formatarFralda, formatarHora } from './tempo';

describe('formatarTempo', () => {
  it('retorna "menos de 1 minuto" para 0 minutos', () => {
    expect(formatarTempo(0)).toBe('menos de 1 minuto');
  });

  it('retorna "1 minuto" para exatamente 1 minuto', () => {
    expect(formatarTempo(1)).toBe('1 minuto');
  });

  it('retorna plural para múltiplos minutos', () => {
    expect(formatarTempo(30)).toBe('30 minutos');
  });

  it('retorna "1 hora" para 60 minutos', () => {
    expect(formatarTempo(60)).toBe('1 hora');
  });

  it('retorna horas e minutos corretamente', () => {
    expect(formatarTempo(90)).toBe('1 hora e 30 minutos');
  });

  it('retorna plural de horas', () => {
    expect(formatarTempo(120)).toBe('2 horas');
  });

  it('retorna "2 horas e 1 minuto"', () => {
    expect(formatarTempo(121)).toBe('2 horas e 1 minuto');
  });
});

describe('formatarFralda', () => {
  it('formata xixi corretamente', () => {
    expect(formatarFralda('xixi')).toBe('só xixi');
  });

  it('formata coco corretamente', () => {
    expect(formatarFralda('coco')).toBe('cocô');
  });

  it('formata os_dois corretamente', () => {
    expect(formatarFralda('os_dois')).toBe('xixi e cocô');
  });

  it('retorna o valor original para tipo desconhecido', () => {
    expect(formatarFralda('desconhecido')).toBe('desconhecido');
  });
});

describe('formatarHora', () => {
  it('formata a hora corretamente', () => {
    // Fixa o timestamp para 14:35 no timezone local
    const date = new Date();
    date.setHours(14, 35, 0, 0);
    expect(formatarHora(date.getTime())).toBe('14h35');
  });

  it('adiciona zero à esquerda em hora e minuto menores que 10', () => {
    const date = new Date();
    date.setHours(9, 5, 0, 0);
    expect(formatarHora(date.getTime())).toBe('09h05');
  });
});

describe('tempoDecorrido', () => {
  it('retorna tempo decorrido corretamente', () => {
    const agora = Date.now();
    const trintaMinAtras = agora - 30 * 60 * 1000;
    expect(tempoDecorrido(trintaMinAtras)).toBe('30 minutos');
  });

  it('retorna "menos de 1 minuto" para timestamp recente', () => {
    const agora = Date.now();
    expect(tempoDecorrido(agora - 30000)).toBe('menos de 1 minuto');
  });
});
