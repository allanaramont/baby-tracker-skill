import { HandlerInput, RequestHandler } from 'ask-sdk-core';
import { EstadoSessao, Fralda, TipoFralda } from '../types';
import { gerarId, formatarFralda, formatarHoraNoFuso, obterChaveDataNoFuso, tempoDecorrido } from '../utils/tempo';
import { obterOuAtualizarTimeZoneUsuario } from '../utils/userTime';
import { clearPendingAction, getPendingAction, setPendingAction } from '../utils/sessionFlow';
import { supportsAPL, criarTrocaFraldaAPL } from '../utils/apl';

function resolverTipoFralda(slot: any): TipoFralda | undefined {
  const resolvido = slot?.resolutions?.resolutionsPerAuthority?.[0]?.values?.[0]?.value?.id as TipoFralda | undefined;
  if (resolvido) return resolvido;

  const raw = (slot?.value as string | undefined)
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  if (!raw) return undefined;

  const temXixi = raw.includes('xixi') || raw.includes('urina') || raw.includes('mijo');
  const temCoco = raw.includes('coc') || raw.includes('fez') || raw.includes('evacu');
  const temAmbos = raw.includes('os dois') || raw.includes('ambos') || raw.includes('tambem');

  if ((temXixi && temCoco) || (temXixi && temAmbos) || (temCoco && temAmbos)) return 'os_dois';
  if (temCoco) return 'coco';
  if (temXixi) return 'xixi';
  return undefined;
}

async function registrarFralda(
  handlerInput: HandlerInput,
  estado: EstadoSessao,
  tipoSlot: TipoFralda
) {
  const agora = Date.now();
  const timeZoneUsuario = await obterOuAtualizarTimeZoneUsuario(handlerInput, estado);
  const fralda: Fralda = {
    id: gerarId(),
    tipo: 'fralda',
    registradaEm: agora,
    tipoBaixo: tipoSlot,
  };

  if (!estado.ultimasFraldas) estado.ultimasFraldas = [];
  estado.ultimasFraldas.unshift(fralda);
  if (estado.ultimasFraldas.length > 30) estado.ultimasFraldas.pop();

  clearPendingAction(handlerInput);
  handlerInput.attributesManager.setPersistentAttributes(estado);
  await handlerInput.attributesManager.savePersistentAttributes();

  const tipoFormatado = formatarFralda(tipoSlot);
  const hora = formatarHoraNoFuso(agora, timeZoneUsuario);

  const chaveHoje = obterChaveDataNoFuso(agora, timeZoneUsuario);
  const totalHoje = estado.ultimasFraldas.filter(
    (f) => obterChaveDataNoFuso(f.registradaEm, timeZoneUsuario) === chaveHoje
  ).length;

  const fraldaAnterior = estado.ultimasFraldas[1];
  const ultimaFralda = fraldaAnterior
    ? {
        haQuanto: tempoDecorrido(fraldaAnterior.registradaEm),
        tipo: formatarFralda(fraldaAnterior.tipoBaixo),
      }
    : undefined;

  const builder = handlerInput.responseBuilder
    .speak(`Fralda com ${tipoFormatado} registrada às ${hora}.`)
    .reprompt('O que deseja registrar?')
    .withShouldEndSession(false);

  if (supportsAPL(handlerInput)) {
    builder.addDirective(criarTrocaFraldaAPL({
      tipoBaixo: tipoSlot,
      hora,
      ultimaFralda,
      totalHoje,
    }) as any);
  }

  return builder.getResponse();
}

export const TrocarFraldaHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'TrocarFralda'
    );
  },

  async handle(handlerInput: HandlerInput) {
    const attrManager = handlerInput.attributesManager;
    const estado = (await attrManager.getPersistentAttributes()) as EstadoSessao;

    const intent = handlerInput.requestEnvelope.request as any;
    const tipoSlot = resolverTipoFralda(intent.intent?.slots?.tipoBaixo);

    if (!tipoSlot) {
      setPendingAction(handlerInput, 'fralda_tipo');
      return handlerInput.responseBuilder
        .speak('Diga: xixi, cocô ou os dois.')
        .reprompt('Xixi, cocô ou os dois?')
        .withShouldEndSession(false)
        .getResponse();
    }

    return registrarFralda(handlerInput, estado, tipoSlot);
  },
};

export const InformarTipoFraldaHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    if (handlerInput.requestEnvelope.request.type !== 'IntentRequest') return false;
    const intentName = (handlerInput.requestEnvelope.request as any).intent?.name;
    if (intentName !== 'InformarTipoFralda') return false;
    return getPendingAction(handlerInput) === 'fralda_tipo';
  },

  async handle(handlerInput: HandlerInput) {
    const request = handlerInput.requestEnvelope.request as any;
    const tipoSlot = resolverTipoFralda(request.intent?.slots?.tipoBaixo);

    if (!tipoSlot) {
      return handlerInput.responseBuilder
        .speak('Responda só: xixi, cocô ou os dois.')
        .reprompt('Pode responder: xixi, cocô ou os dois.')
        .withShouldEndSession(false)
        .getResponse();
    }

    const attrManager = handlerInput.attributesManager;
    const estado = (await attrManager.getPersistentAttributes()) as EstadoSessao;
    return registrarFralda(handlerInput, estado, tipoSlot);
  },
};
