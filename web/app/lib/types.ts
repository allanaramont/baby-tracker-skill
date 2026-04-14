export interface Mamada {
  id: string;
  tipo: 'mamada';
  subtipo?: 'peito' | 'mamadeira';
  iniciadaEm: number;
  finalizadaEm?: number;
  duracaoMinutos?: number;
  lado?: 'esquerdo' | 'direito' | 'ambos';
  emAndamento: boolean;
}

export interface Fralda {
  id: string;
  tipo: 'fralda';
  registradaEm: number;
  tipoBaixo: 'xixi' | 'coco' | 'os_dois';
}

export interface Sono {
  id: string;
  tipo: 'sono';
  iniciadoEm: number;
  finalizadoEm?: number;
  duracaoMinutos?: number;
  emAndamento: boolean;
}

export interface RegistroPeso {
  id: string;
  tipo: 'peso';
  registradoEm: number;
  pesoGramas: number;
}

export interface RegistroRemedio {
  id: string;
  tipo: 'remedio';
  registradoEm: number;
  nome: string;
  dose: number;
  unidade: string;
}

export interface EstadoBebe {
  nomeBebe?: string;
  timeZoneUsuario?: string;
  mamadaAtual?: Mamada;
  sonoAtual?: Sono;
  ultimasMamadas: Mamada[];
  ultimasFraldas: Fralda[];
  ultimosSonos: Sono[];
  registrosPeso: RegistroPeso[];
  ultimosRemedios: RegistroRemedio[];
  ultimoLadoMamada?: 'esquerdo' | 'direito' | 'ambos';
}

export interface SessionPayload {
  sub: string;
  email: string;
  name?: string;
}
