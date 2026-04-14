import { HandlerInput, RequestHandler } from 'ask-sdk-core';
import { EstadoSessao, RegistroRemedio } from '../types';
import { gerarId, formatarHoraNoFuso, tempoDecorrido } from '../utils/tempo';
import { obterOuAtualizarTimeZoneUsuario } from '../utils/userTime';
import { supportsAPL, criarRemedioAPL, criarUltimoRemedioAPL } from '../utils/apl';

export const RegistrarRemedioHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'RegistrarRemedio'
    );
  },

  async handle(handlerInput: HandlerInput) {
    const attrManager = handlerInput.attributesManager;
    const estado = (await attrManager.getPersistentAttributes()) as EstadoSessao;

    const intent = handlerInput.requestEnvelope.request as any;
    const nomeSlot = intent.intent?.slots?.nomeRemedio?.value as string | undefined;
    const doseSlot = intent.intent?.slots?.dose?.value as string | undefined;
    const unidadeSlot = intent.intent?.slots?.unidadeDose?.resolutions?.resolutionsPerAuthority?.[0]?.values?.[0]?.value?.id as string | undefined;

    if (!nomeSlot) {
      return handlerInput.responseBuilder
        .speak('Qual é o remédio? Se quiser, diga ajuda.')
        .addElicitSlotDirective('nomeRemedio', intent.intent)
        .withShouldEndSession(false)
        .getResponse();
    }

    if (!doseSlot) {
      return handlerInput.responseBuilder
        .speak(`Qual é a dose do ${nomeSlot}? Se quiser, diga ajuda.`)
        .addElicitSlotDirective('dose', intent.intent)
        .withShouldEndSession(false)
        .getResponse();
    }

    const agora = Date.now();
    const timeZoneUsuario = await obterOuAtualizarTimeZoneUsuario(handlerInput, estado);
    const unidade = unidadeSlot ?? 'ml';

    const registro: RegistroRemedio = {
      id: gerarId(),
      tipo: 'remedio',
      registradoEm: agora,
      nome: nomeSlot,
      dose: parseFloat(doseSlot),
      unidade,
    };

    if (!estado.ultimosRemedios) estado.ultimosRemedios = [];
    estado.ultimosRemedios.unshift(registro);
    if (estado.ultimosRemedios.length > 50) estado.ultimosRemedios.pop();

    attrManager.setPersistentAttributes(estado);
    await attrManager.savePersistentAttributes();

    const hora = formatarHoraNoFuso(agora, timeZoneUsuario);
    const speech = `${nomeSlot}: ${doseSlot} ${unidade}, às ${hora}.`;

    const builder = handlerInput.responseBuilder
      .speak(speech)
      .reprompt('O que deseja registrar?')
      .withShouldEndSession(false);

    if (supportsAPL(handlerInput)) {
      builder.addDirective(criarRemedioAPL({
        nome: nomeSlot,
        dose: doseSlot,
        unidade,
        hora,
      }) as any);
    }

    return builder.getResponse();
  },
};

export const UltimoRemedioHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'UltimoRemedio'
    );
  },

  async handle(handlerInput: HandlerInput) {
    const attrManager = handlerInput.attributesManager;
    const estado = (await attrManager.getPersistentAttributes()) as EstadoSessao;

    const intent = handlerInput.requestEnvelope.request as any;
    const nomeSlot = intent.intent?.slots?.nomeRemedio?.value as string | undefined;

    const remedios = estado.ultimosRemedios ?? [];

    if (remedios.length === 0) {
      return handlerInput.responseBuilder
        .speak('Nenhum remédio registrado ainda.')
        .reprompt('O que deseja registrar?')
        .withShouldEndSession(false)
        .getResponse();
    }

    const lista = nomeSlot
      ? remedios.filter((r) => r.nome.toLowerCase().includes(nomeSlot.toLowerCase()))
      : remedios;

    if (lista.length === 0) {
      return handlerInput.responseBuilder
        .speak(`Não encontrei registro para ${nomeSlot}.`)
        .reprompt('O que deseja registrar?')
        .withShouldEndSession(false)
        .getResponse();
    }

    const ultimo = lista[0];
    const haQuanto = tempoDecorrido(ultimo.registradoEm);
    const speech = `Último ${ultimo.nome}: ${ultimo.dose} ${ultimo.unidade}, há ${haQuanto}.`;

    const builder = handlerInput.responseBuilder
      .speak(speech)
      .reprompt('O que deseja registrar?')
      .withShouldEndSession(false);

    if (supportsAPL(handlerInput)) {
      builder.addDirective(criarUltimoRemedioAPL({
        nome: ultimo.nome,
        dose: String(ultimo.dose),
        unidade: ultimo.unidade,
        haQuanto,
      }) as any);
    }

    return builder.getResponse();
  },
};
