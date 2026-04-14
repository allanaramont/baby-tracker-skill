import { HandlerInput, RequestHandler } from 'ask-sdk-core';
import { EstadoSessao } from '../types';
import { tempoDecorrido, formatarTempo, formatarLado } from '../utils/tempo';
import { supportsAPL, criarUltimaMamadaAPL } from '../utils/apl';

export const UltimaMamadaHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'UltimaAmamentacao'
    );
  },

  async handle(handlerInput: HandlerInput) {
    const attrManager = handlerInput.attributesManager;
    const estado = (await attrManager.getPersistentAttributes()) as EstadoSessao;
    const nome = estado.nomeBebe ?? 'o bebê';

    if (estado.mamadaAtual?.emAndamento) {
      const decorrido = tempoDecorrido(estado.mamadaAtual.iniciadaEm);
      const ladoFormatado = estado.mamadaAtual.lado ? formatarLado(estado.mamadaAtual.lado) : undefined;
      const ladoStr = ladoFormatado ? ` no ${ladoFormatado}` : '';
      const speech = `${nome} está mamando há ${decorrido}${ladoStr}.`;
      const builder = handlerInput.responseBuilder
        .speak(speech)
        .reprompt('O que deseja registrar?')
        .withShouldEndSession(false);
      if (supportsAPL(handlerInput)) {
        builder.addDirective(criarUltimaMamadaAPL({
          nome,
          emAndamento: true,
          haQuanto: decorrido,
          lado: ladoFormatado,
        }) as any);
      }
      return builder.getResponse();
    }

    const mamadas = estado.ultimasMamadas ?? [];
    if (mamadas.length === 0) {
      return handlerInput.responseBuilder
        .speak(`Nenhuma amamentação de ${nome} registrada ainda.`)
        .reprompt('O que deseja registrar?')
        .withShouldEndSession(false)
        .getResponse();
    }

    const ultima = mamadas[0];
    const haQuanto = tempoDecorrido(ultima.finalizadaEm ?? ultima.iniciadaEm);
    const ladoFormatado = ultima.lado ? formatarLado(ultima.lado) : undefined;
    const ladoStr = ladoFormatado ? ` no ${ladoFormatado}` : '';
    const duracaoStr = ultima.duracaoMinutos ? `, e durou ${formatarTempo(ultima.duracaoMinutos)}` : '';
    const duracaoFormatado = ultima.duracaoMinutos ? formatarTempo(ultima.duracaoMinutos) : undefined;

    const speech = `A última amamentação de ${nome} foi há ${haQuanto}${ladoStr}${duracaoStr}.`;
    const builder = handlerInput.responseBuilder
      .speak(speech)
      .reprompt('O que deseja registrar?')
      .withShouldEndSession(false);

    if (supportsAPL(handlerInput)) {
      builder.addDirective(criarUltimaMamadaAPL({
        nome,
        emAndamento: false,
        haQuanto,
        lado: ladoFormatado,
        duracao: duracaoFormatado,
      }) as any);
    }

    return builder.getResponse();
  },
};
