import { HandlerInput, RequestHandler } from 'ask-sdk-core';
import { EstadoSessao } from '../types';
import { gerarId, formatarHoraNoFuso } from '../utils/tempo';
import { obterOuAtualizarTimeZoneUsuario } from '../utils/userTime';
import { supportsAPL, criarResumoMamadaAPL } from '../utils/apl';
import { clearPendingAction, getPendingAction, setPendingAction } from '../utils/sessionFlow';

function parseDurationToMinutes(raw?: string): number | undefined {
  if (!raw) return undefined;
  const match = raw.match(/^P(?:T(?:(\d+)H)?(?:(\d+)M)?)$/i);
  if (!match) return undefined;
  const horas = match[1] ? parseInt(match[1], 10) : 0;
  const minutos = match[2] ? parseInt(match[2], 10) : 0;
  const total = horas * 60 + minutos;
  return total > 0 ? total : undefined;
}

function obterPartesLocais(timestampMs: number, timeZone?: string): Record<string, number> {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(timestampMs));

  return {
    year: parseInt(parts.find((p) => p.type === 'year')?.value ?? '0', 10),
    month: parseInt(parts.find((p) => p.type === 'month')?.value ?? '0', 10),
    day: parseInt(parts.find((p) => p.type === 'day')?.value ?? '0', 10),
    hour: parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10),
    minute: parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0', 10),
  };
}

function converterHorarioLocalParaTimestamp(horario: string, timeZone?: string, agora: number = Date.now()): number | undefined {
  const match = horario.match(/^(\d{2})(?::(\d{2}))?$/);
  if (!match) return undefined;
  const hora = parseInt(match[1], 10);
  const minuto = parseInt(match[2] ?? '0', 10);
  if (Number.isNaN(hora) || Number.isNaN(minuto) || hora > 23 || minuto > 59) return undefined;

  const localAgora = obterPartesLocais(agora, timeZone);
  const localTargetUtc = Date.UTC(localAgora.year, localAgora.month - 1, localAgora.day, hora, minuto);
  const partesDoGuess = obterPartesLocais(localTargetUtc, timeZone);
  const guessAsUtc = Date.UTC(partesDoGuess.year, partesDoGuess.month - 1, partesDoGuess.day, partesDoGuess.hour, partesDoGuess.minute);
  const offset = guessAsUtc - localTargetUtc;
  let timestamp = localTargetUtc - offset;
  if (timestamp > agora) timestamp -= 24 * 60 * 60 * 1000;
  return timestamp <= agora ? timestamp : undefined;
}

async function registrarMamadeiraAtrasada(handlerInput: HandlerInput, estado: EstadoSessao, registradaEm: number) {
  const nome = estado.nomeBebe ?? 'o bebê';
  const agora = Date.now();
  const timeZone = await obterOuAtualizarTimeZoneUsuario(handlerInput, estado);
  const horaRegistradaTexto = formatarHoraNoFuso(registradaEm, timeZone);

  const mamada = {
    id: gerarId(),
    tipo: 'mamada' as const,
    subtipo: 'mamadeira' as const,
    iniciadaEm: registradaEm,
    finalizadaEm: registradaEm,
    emAndamento: false,
  };

  if (!estado.ultimasMamadas) estado.ultimasMamadas = [];
  estado.ultimasMamadas.unshift(mamada);
  if (estado.ultimasMamadas.length > 20) estado.ultimasMamadas.pop();

  clearPendingAction(handlerInput);
  handlerInput.attributesManager.setPersistentAttributes(estado);
  await handlerInput.attributesManager.savePersistentAttributes();

  const speech = `Mamadeira atrasada registrada para ${nome} às ${horaRegistradaTexto}. O que deseja registrar agora?`;
  return handlerInput.responseBuilder
    .speak(speech)
    .reprompt('O que deseja registrar?')
    .withShouldEndSession(false)
    .getResponse();
}

export const RegistrarMamadeiraHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'RegistrarMamadeira'
    );
  },

  async handle(handlerInput: HandlerInput) {
    const attrManager = handlerInput.attributesManager;
    const estado = (await attrManager.getPersistentAttributes()) as EstadoSessao;
    const nome = estado.nomeBebe ?? 'o bebê';
    const agora = Date.now();

    const mamada = {
      id: gerarId(),
      tipo: 'mamada' as const,
      subtipo: 'mamadeira' as const,
      iniciadaEm: agora,
      finalizadaEm: agora,
      emAndamento: false,
    };

    if (!estado.ultimasMamadas) estado.ultimasMamadas = [];
    estado.ultimasMamadas.unshift(mamada);
    if (estado.ultimasMamadas.length > 20) estado.ultimasMamadas.pop();

    attrManager.setPersistentAttributes(estado);
    await attrManager.savePersistentAttributes();

    const timeZone = await obterOuAtualizarTimeZoneUsuario(handlerInput, estado);
    const horaRegistradaTexto = formatarHoraNoFuso(agora, timeZone);

    const speech = `Mamadeira registrada para ${nome} às ${horaRegistradaTexto}. O que deseja registrar agora?`;
    const builder = handlerInput.responseBuilder
      .speak(speech)
      .reprompt('O que deseja registrar?')
      .withShouldEndSession(false);

    if (supportsAPL(handlerInput)) {
      builder.addDirective(criarResumoMamadaAPL({
        nome,
        duracaoMinutos: 0,
        duracaoSegundos: 0,
        lado: 'mamadeira' as any,
        horaRegistradaTexto,
      }) as any);
    }

    return builder.getResponse();
  },
};

export const RegistrarMamadeiraAtrasadaHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      (handlerInput.requestEnvelope.request as any).intent?.name === 'RegistrarMamadeiraAtrasada'
    );
  },

  handle(handlerInput: HandlerInput) {
    setPendingAction(handlerInput, 'mamadeira_atrasada_inicio');
    return handlerInput.responseBuilder
      .speak('Pode dizer há quanto tempo foi a mamadeira, ou que horas foi. Por exemplo: há 30 minutos, ou foi às 9 e meia.')
      .reprompt('Diga há quanto tempo foi, ou que horas foi.')
      .withShouldEndSession(false)
      .getResponse();
  },
};

export const InformarInicioMamadeiraAtrasadaHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    if (handlerInput.requestEnvelope.request.type !== 'IntentRequest') return false;
    const intentName = (handlerInput.requestEnvelope.request as any).intent?.name;
    return intentName === 'InformarInicioAtrasado' && getPendingAction(handlerInput) === 'mamadeira_atrasada_inicio';
  },

  async handle(handlerInput: HandlerInput) {
    const attrManager = handlerInput.attributesManager;
    const estado = (await attrManager.getPersistentAttributes()) as EstadoSessao;
    const request = handlerInput.requestEnvelope.request as any;
    const duracaoSlot = request.intent?.slots?.duracao?.value as string | undefined;
    const horarioSlot = request.intent?.slots?.horario?.value as string | undefined;
    const agora = Date.now();
    const timeZone = await obterOuAtualizarTimeZoneUsuario(handlerInput, estado);

    const duracaoMinutos = parseDurationToMinutes(duracaoSlot);
    if (duracaoMinutos != null) {
      return registrarMamadeiraAtrasada(handlerInput, estado, agora - duracaoMinutos * 60000);
    }

    const registradaEm = converterHorarioLocalParaTimestamp(horarioSlot ?? '', timeZone, agora);
    if (registradaEm != null) {
      return registrarMamadeiraAtrasada(handlerInput, estado, registradaEm);
    }

    return handlerInput.responseBuilder
      .speak('Não entendi quando foi a mamadeira. Pode dizer há quanto tempo foi, ou que horas foi.')
      .reprompt('Por exemplo: há 30 minutos, ou foi às 9 e meia.')
      .withShouldEndSession(false)
      .getResponse();
  },
};
