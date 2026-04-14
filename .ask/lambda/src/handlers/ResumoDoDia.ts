import { HandlerInput, RequestHandler } from 'ask-sdk-core';
import { EstadoSessao } from '../types';
import { formatarTempo, obterChaveDataNoFuso, tempoDecorrido } from '../utils/tempo';
import { obterOuAtualizarTimeZoneUsuario } from '../utils/userTime';
import { supportsAPL, criarResumoDoDiaAPL } from '../utils/apl';

export const ResumoDoDiaHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'ResumoDoDia'
    );
  },

  async handle(handlerInput: HandlerInput) {
    const attrManager = handlerInput.attributesManager;
    const estado = (await attrManager.getPersistentAttributes()) as EstadoSessao;
    const nome = estado.nomeBebe ?? 'o bebê';
    const timeZoneUsuario = await obterOuAtualizarTimeZoneUsuario(handlerInput, estado);
    const chaveHoje = obterChaveDataNoFuso(Date.now(), timeZoneUsuario);

    const mamadas = (estado.ultimasMamadas ?? []).filter(
      (m) => obterChaveDataNoFuso(m.finalizadaEm ?? m.iniciadaEm, timeZoneUsuario) === chaveHoje
    );
    const fraldas = (estado.ultimasFraldas ?? []).filter(
      (f) => obterChaveDataNoFuso(f.registradaEm, timeZoneUsuario) === chaveHoje
    );
    const sonos = (estado.ultimosSonos ?? []).filter(
      (s) => obterChaveDataNoFuso(s.finalizadoEm ?? s.iniciadoEm, timeZoneUsuario) === chaveHoje
    );

    const partes: string[] = [];

    if (mamadas.length > 0) {
      const totalMinutos = mamadas.reduce((acc, m) => acc + (m.duracaoMinutos ?? 0), 0);
      const ultimaMamada = mamadas[0];
      const haQuanto = tempoDecorrido(ultimaMamada.finalizadaEm ?? ultimaMamada.iniciadaEm);
      const totalStr = totalMinutos > 0 ? `, total de ${formatarTempo(totalMinutos)}` : '';
      partes.push(`${mamadas.length} amamentação${mamadas.length > 1 ? 'ões' : ''}${totalStr}, última há ${haQuanto}`);
    } else {
      partes.push('nenhuma amamentação registrada hoje');
    }

    if (fraldas.length > 0) {
      const cocos = fraldas.filter((f) => f.tipoBaixo === 'coco' || f.tipoBaixo === 'os_dois').length;
      const xixis = fraldas.length - cocos;
      const detalhe = cocos > 0 ? ` (${xixis} xixi, ${cocos} cocô)` : '';
      partes.push(`${fraldas.length} troca${fraldas.length > 1 ? 's' : ''} de fralda${detalhe}`);
    } else {
      partes.push('nenhuma troca de fralda hoje');
    }

    if (sonos.length > 0) {
      const totalSonoMin = sonos.reduce((acc, s) => acc + (s.duracaoMinutos ?? 0), 0);
      const totalSonoStr = totalSonoMin > 0 ? `, total de ${formatarTempo(totalSonoMin)}` : '';
      partes.push(`${sonos.length} período${sonos.length > 1 ? 's' : ''} de sono${totalSonoStr}`);
    }

    const emAndamento: string[] = [];
    if (estado.mamadaAtual?.emAndamento) {
      emAndamento.push(`amamentação em andamento há ${tempoDecorrido(estado.mamadaAtual.iniciadaEm)}`);
    }
    if (estado.sonoAtual?.emAndamento) {
      emAndamento.push(`${nome} dormindo há ${tempoDecorrido(estado.sonoAtual.iniciadoEm)}`);
    }

    const emAndamentoStr = emAndamento.length > 0 ? ` Agora: ${emAndamento.join(' e ')}.` : '';

    const speech = `Resumo de hoje de ${nome}: ${partes.join('. ')}.${emAndamentoStr}`;

    const cocos = fraldas.filter((f) => f.tipoBaixo === 'coco' || f.tipoBaixo === 'os_dois').length;
    const xixis = fraldas.length - cocos;
    const totalMamadaMin = mamadas.reduce((acc, m) => acc + (m.duracaoMinutos ?? 0), 0);
    const totalSonoMin = sonos.reduce((acc, s) => acc + (s.duracaoMinutos ?? 0), 0);

    const builder = handlerInput.responseBuilder
      .speak(speech)
      .reprompt('O que deseja registrar?')
      .withShouldEndSession(false);

    if (supportsAPL(handlerInput)) {
      builder.addDirective(criarResumoDoDiaAPL({
        nome,
        mamadas: mamadas.length,
        totalMamadaMin,
        fraldas: fraldas.length,
        cocos,
        xixis,
        sonos: sonos.length,
        totalSonoMin,
        mamadaEmAndamento: estado.mamadaAtual?.emAndamento ?? false,
        sonoEmAndamento: estado.sonoAtual?.emAndamento ?? false,
      }) as any);
    }

    return builder.getResponse();
  },
};
