import { HandlerInput, RequestHandler } from 'ask-sdk-core';
import { EstadoSessao, Sono } from '../types';
import { gerarId, calcularDuracaoMinutos, formatarTempo, tempoDecorrido, formatarHoraNoFuso } from '../utils/tempo';
import { obterOuAtualizarTimeZoneUsuario } from '../utils/userTime';
import { supportsAPL, criarSonoIniciadoAPL, criarSonoFinalizadoAPL } from '../utils/apl';
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
    year: parseInt(parts.find((part) => part.type === 'year')?.value ?? '0', 10),
    month: parseInt(parts.find((part) => part.type === 'month')?.value ?? '0', 10),
    day: parseInt(parts.find((part) => part.type === 'day')?.value ?? '0', 10),
    hour: parseInt(parts.find((part) => part.type === 'hour')?.value ?? '0', 10),
    minute: parseInt(parts.find((part) => part.type === 'minute')?.value ?? '0', 10),
  };
}

function converterHorarioLocalParaTimestamp(horario: string, timeZone?: string, agora: number = Date.now()): number | undefined {
  const match = horario.match(/^(\d{2})(?::(\d{2}))?$/);
  if (!match) return undefined;

  const hora = parseInt(match[1], 10);
  const minuto = parseInt(match[2] ?? '0', 10);
  if (Number.isNaN(hora) || Number.isNaN(minuto) || hora > 23 || minuto > 59) {
    return undefined;
  }

  const localAgora = obterPartesLocais(agora, timeZone);
  const localTargetUtc = Date.UTC(localAgora.year, localAgora.month - 1, localAgora.day, hora, minuto);

  const partesDoGuess = obterPartesLocais(localTargetUtc, timeZone);
  const guessAsUtc = Date.UTC(
    partesDoGuess.year,
    partesDoGuess.month - 1,
    partesDoGuess.day,
    partesDoGuess.hour,
    partesDoGuess.minute
  );
  const offset = guessAsUtc - localTargetUtc;
  let timestamp = localTargetUtc - offset;

  if (timestamp > agora) {
    timestamp -= 24 * 60 * 60 * 1000;
  }

  return timestamp <= agora ? timestamp : undefined;
}

async function registrarSonoAtrasado(
  handlerInput: HandlerInput,
  estado: EstadoSessao,
  iniciadoEm: number
) {
  const nome = estado.nomeBebe ?? 'o bebê';
  const agora = Date.now();
  const duracaoMinutos = calcularDuracaoMinutos(iniciadoEm, agora);

  const sono: Sono = {
    id: gerarId(),
    tipo: 'sono',
    iniciadoEm,
    finalizadoEm: agora,
    duracaoMinutos,
    emAndamento: false,
  };

  if (!estado.ultimosSonos) estado.ultimosSonos = [];
  estado.ultimosSonos.unshift(sono);
  if (estado.ultimosSonos.length > 20) estado.ultimosSonos.pop();

  clearPendingAction(handlerInput);
  handlerInput.attributesManager.setPersistentAttributes(estado);
  await handlerInput.attributesManager.savePersistentAttributes();

  const timeZone = await obterOuAtualizarTimeZoneUsuario(handlerInput, estado);
  const horaAcordou = formatarHoraNoFuso(agora, timeZone);
  const speech = `Registrei esse sono atrasado. ${nome} dormiu por ${formatarTempo(duracaoMinutos)}. O que deseja registrar agora?`;

  const builder = handlerInput.responseBuilder
    .speak(speech)
    .reprompt('O que deseja registrar?')
    .withShouldEndSession(false);

  if (supportsAPL(handlerInput)) {
    builder.addDirective(criarSonoFinalizadoAPL({
      nome,
      duracao: formatarTempo(duracaoMinutos),
      hora: horaAcordou,
    }) as any);
  }

  return builder.getResponse();
}

export const IniciarSonoHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'IniciarSono'
    );
  },

  async handle(handlerInput: HandlerInput) {
    const attrManager = handlerInput.attributesManager;
    const estado = (await attrManager.getPersistentAttributes()) as EstadoSessao;
    const nome = estado.nomeBebe ?? 'o bebê';

    if (estado.sonoAtual?.emAndamento) {
      const decorrido = tempoDecorrido(estado.sonoAtual.iniciadoEm);
      const elapsedInicialMs = Math.max(0, Date.now() - estado.sonoAtual.iniciadoEm);
      const builder = handlerInput.responseBuilder
        .speak(`${nome} já está dormindo há ${decorrido}. Diga acordou quando despertar.`)
        .reprompt('Diga acordou quando despertar.')
        .withShouldEndSession(false);
      if (supportsAPL(handlerInput)) {
        builder.addDirective(criarSonoIniciadoAPL({ nome, elapsedInicialMs }) as any);
      }
      return builder.getResponse();
    }

    const sono: Sono = {
      id: gerarId(),
      tipo: 'sono',
      iniciadoEm: Date.now(),
      emAndamento: true,
    };

    estado.sonoAtual = sono;
    attrManager.setPersistentAttributes(estado);
    await attrManager.savePersistentAttributes();

    const builder = handlerInput.responseBuilder
      .speak(`Sono iniciado para ${nome}. Diga acordou quando despertar.`)
      .reprompt('Diga acordou quando despertar.')
      .withShouldEndSession(false);

    if (supportsAPL(handlerInput)) {
      builder.addDirective(criarSonoIniciadoAPL({ nome, elapsedInicialMs: 0 }) as any);
    }

    return builder.getResponse();
  },
};

export const FinalizarSonoHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'FinalizarSono'
    );
  },

  async handle(handlerInput: HandlerInput) {
    console.log('FinalizarSono chamado, intent:', (handlerInput.requestEnvelope.request as any).intent?.name);
    const attrManager = handlerInput.attributesManager;
    const estado = (await attrManager.getPersistentAttributes()) as EstadoSessao;
    const nome = estado.nomeBebe ?? 'o bebê';

    if (!estado.sonoAtual?.emAndamento) {
      setPendingAction(handlerInput, 'sono_registro_atrasado_confirmacao');
      return handlerInput.responseBuilder
        .speak('Não encontrei sono em andamento. Quer registrar esse sono atrasado?')
        .reprompt('Diga sim para registrar atrasado, ou não para cancelar.')
        .withShouldEndSession(false)
        .getResponse();
    }

    const agora = Date.now();
    const sono = estado.sonoAtual;
    const duracaoMinutos = calcularDuracaoMinutos(sono.iniciadoEm, agora);

    sono.finalizadoEm = agora;
    sono.duracaoMinutos = duracaoMinutos;
    sono.emAndamento = false;

    if (!estado.ultimosSonos) estado.ultimosSonos = [];
    estado.ultimosSonos.unshift(sono);
    if (estado.ultimosSonos.length > 20) estado.ultimosSonos.pop();

    estado.sonoAtual = undefined;
    attrManager.setPersistentAttributes(estado);
    await attrManager.savePersistentAttributes();

    const speech = `${nome} acordou. Dormiu por ${formatarTempo(duracaoMinutos)}.`;
    const timeZone = await obterOuAtualizarTimeZoneUsuario(handlerInput, estado);
    const horaAcordou = formatarHoraNoFuso(agora, timeZone);

    const builder = handlerInput.responseBuilder
      .speak(speech)
      .reprompt('O que deseja registrar?')
      .withShouldEndSession(false);

    if (supportsAPL(handlerInput)) {
      builder.addDirective(criarSonoFinalizadoAPL({
        nome,
        duracao: formatarTempo(duracaoMinutos),
        hora: horaAcordou,
      }) as any);
    }

    return builder.getResponse();
  },
};

export const ConfirmarRegistroSonoAtrasadoHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    if (handlerInput.requestEnvelope.request.type !== 'IntentRequest') return false;
    const intentName = (handlerInput.requestEnvelope.request as any).intent?.name;
    return intentName === 'AMAZON.YesIntent' && getPendingAction(handlerInput) === 'sono_registro_atrasado_confirmacao';
  },

  handle(handlerInput: HandlerInput) {
    setPendingAction(handlerInput, 'sono_registro_atrasado_inicio');
    return handlerInput.responseBuilder
      .speak('Pode dizer há quanto tempo começou, ou que horas começou. Por exemplo: há 40 minutos, ou começou às 9 e meia.')
      .reprompt('Diga há quanto tempo começou, ou que horas começou.')
      .withShouldEndSession(false)
      .getResponse();
  },
};

export const CancelarRegistroSonoAtrasadoHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    if (handlerInput.requestEnvelope.request.type !== 'IntentRequest') return false;
    const intentName = (handlerInput.requestEnvelope.request as any).intent?.name;
    return intentName === 'AMAZON.NoIntent' && getPendingAction(handlerInput) === 'sono_registro_atrasado_confirmacao';
  },

  handle(handlerInput: HandlerInput) {
    clearPendingAction(handlerInput);
    return handlerInput.responseBuilder
      .speak('Tudo bem. O que deseja registrar?')
      .reprompt('O que deseja registrar?')
      .withShouldEndSession(false)
      .getResponse();
  },
};

export const InformarInicioSonoAtrasadoHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    if (handlerInput.requestEnvelope.request.type !== 'IntentRequest') return false;
    const intentName = (handlerInput.requestEnvelope.request as any).intent?.name;
    return intentName === 'InformarInicioAtrasado' && getPendingAction(handlerInput) === 'sono_registro_atrasado_inicio';
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
      return registrarSonoAtrasado(handlerInput, estado, agora - duracaoMinutos * 60000);
    }

    const iniciadoEm = converterHorarioLocalParaTimestamp(horarioSlot ?? '', timeZone, agora);
    if (iniciadoEm != null) {
      return registrarSonoAtrasado(handlerInput, estado, iniciadoEm);
    }

    return handlerInput.responseBuilder
      .speak('Não entendi o início do sono. Pode dizer há quanto tempo começou, ou que horas começou.')
      .reprompt('Por exemplo: há 40 minutos, ou começou às 9 e meia.')
      .withShouldEndSession(false)
      .getResponse();
  },
};
