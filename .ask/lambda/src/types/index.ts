export type TipoMamada = 'esquerdo' | 'direito' | 'ambos';
export type TipoFralda = 'xixi' | 'coco' | 'os_dois';
export type TipoEvento = 'mamada' | 'fralda' | 'sono' | 'peso' | 'remedio';

export interface Mamada {
  id: string;
  tipo: TipoEvento;
  iniciadaEm: number;
  finalizadaEm?: number;
  duracaoMinutos?: number;
  lado?: TipoMamada;
  emAndamento: boolean;
}

export interface Fralda {
  id: string;
  tipo: TipoEvento;
  registradaEm: number;
  tipoBaixo: TipoFralda;
}

export interface Sono {
  id: string;
  tipo: TipoEvento;
  iniciadoEm: number;
  finalizadoEm?: number;
  duracaoMinutos?: number;
  emAndamento: boolean;
}

export interface RegistroPeso {
  id: string;
  tipo: TipoEvento;
  registradoEm: number;
  pesoGramas: number;
}

export interface RegistroRemedio {
  id: string;
  tipo: TipoEvento;
  registradoEm: number;
  nome: string;
  dose: number;
  unidade: string;
}

export interface EstadoSessao {
  nomeBebe?: string;
  timeZoneUsuario?: string;
  mamadaAtual?: Mamada;
  sonoAtual?: Sono;
  ultimasMamadas: Mamada[];
  ultimasFraldas: Fralda[];
  ultimosSonos: Sono[];
  registrosPeso: RegistroPeso[];
  ultimosRemedios: RegistroRemedio[];
  ultimoLadoMamada?: TipoMamada;
}
