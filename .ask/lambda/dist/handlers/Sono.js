"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InformarInicioSonoAtrasadoHandler = exports.CancelarRegistroSonoAtrasadoHandler = exports.ConfirmarRegistroSonoAtrasadoHandler = exports.FinalizarSonoHandler = exports.IniciarSonoHandler = void 0;
const tempo_1 = require("../utils/tempo");
const userTime_1 = require("../utils/userTime");
const apl_1 = require("../utils/apl");
const sessionFlow_1 = require("../utils/sessionFlow");
function parseDurationToMinutes(raw) {
    if (!raw)
        return undefined;
    const match = raw.match(/^P(?:T(?:(\d+)H)?(?:(\d+)M)?)$/i);
    if (!match)
        return undefined;
    const horas = match[1] ? parseInt(match[1], 10) : 0;
    const minutos = match[2] ? parseInt(match[2], 10) : 0;
    const total = horas * 60 + minutos;
    return total > 0 ? total : undefined;
}
function obterPartesLocais(timestampMs, timeZone) {
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
function converterHorarioLocalParaTimestamp(horario, timeZone, agora = Date.now()) {
    const match = horario.match(/^(\d{2})(?::(\d{2}))?$/);
    if (!match)
        return undefined;
    const hora = parseInt(match[1], 10);
    const minuto = parseInt(match[2] ?? '0', 10);
    if (Number.isNaN(hora) || Number.isNaN(minuto) || hora > 23 || minuto > 59) {
        return undefined;
    }
    const localAgora = obterPartesLocais(agora, timeZone);
    const localTargetUtc = Date.UTC(localAgora.year, localAgora.month - 1, localAgora.day, hora, minuto);
    const partesDoGuess = obterPartesLocais(localTargetUtc, timeZone);
    const guessAsUtc = Date.UTC(partesDoGuess.year, partesDoGuess.month - 1, partesDoGuess.day, partesDoGuess.hour, partesDoGuess.minute);
    const offset = guessAsUtc - localTargetUtc;
    let timestamp = localTargetUtc - offset;
    if (timestamp > agora) {
        timestamp -= 24 * 60 * 60 * 1000;
    }
    return timestamp <= agora ? timestamp : undefined;
}
async function registrarSonoAtrasado(handlerInput, estado, iniciadoEm) {
    const nome = estado.nomeBebe ?? 'o bebê';
    const agora = Date.now();
    const duracaoMinutos = (0, tempo_1.calcularDuracaoMinutos)(iniciadoEm, agora);
    const sono = {
        id: (0, tempo_1.gerarId)(),
        tipo: 'sono',
        iniciadoEm,
        finalizadoEm: agora,
        duracaoMinutos,
        emAndamento: false,
    };
    if (!estado.ultimosSonos)
        estado.ultimosSonos = [];
    estado.ultimosSonos.unshift(sono);
    if (estado.ultimosSonos.length > 20)
        estado.ultimosSonos.pop();
    (0, sessionFlow_1.clearPendingAction)(handlerInput);
    handlerInput.attributesManager.setPersistentAttributes(estado);
    await handlerInput.attributesManager.savePersistentAttributes();
    const timeZone = await (0, userTime_1.obterOuAtualizarTimeZoneUsuario)(handlerInput, estado);
    const horaAcordou = (0, tempo_1.formatarHoraNoFuso)(agora, timeZone);
    const speech = `Registrei esse sono atrasado. ${nome} dormiu por ${(0, tempo_1.formatarTempo)(duracaoMinutos)}. O que deseja registrar agora?`;
    const builder = handlerInput.responseBuilder
        .speak(speech)
        .reprompt('O que deseja registrar?')
        .withShouldEndSession(false);
    if ((0, apl_1.supportsAPL)(handlerInput)) {
        builder.addDirective((0, apl_1.criarSonoFinalizadoAPL)({
            nome,
            duracao: (0, tempo_1.formatarTempo)(duracaoMinutos),
            hora: horaAcordou,
        }));
    }
    return builder.getResponse();
}
exports.IniciarSonoHandler = {
    canHandle(handlerInput) {
        return (handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'IniciarSono');
    },
    async handle(handlerInput) {
        const attrManager = handlerInput.attributesManager;
        const estado = (await attrManager.getPersistentAttributes());
        const nome = estado.nomeBebe ?? 'o bebê';
        if (estado.sonoAtual?.emAndamento) {
            const decorrido = (0, tempo_1.tempoDecorrido)(estado.sonoAtual.iniciadoEm);
            const elapsedInicialMs = Math.max(0, Date.now() - estado.sonoAtual.iniciadoEm);
            const builder = handlerInput.responseBuilder
                .speak(`${nome} já está dormindo há ${decorrido}. Diga acordou quando despertar.`)
                .reprompt('Diga acordou quando despertar.')
                .withShouldEndSession(false);
            if ((0, apl_1.supportsAPL)(handlerInput)) {
                builder.addDirective((0, apl_1.criarSonoIniciadoAPL)({ nome, elapsedInicialMs }));
            }
            return builder.getResponse();
        }
        const sono = {
            id: (0, tempo_1.gerarId)(),
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
        if ((0, apl_1.supportsAPL)(handlerInput)) {
            builder.addDirective((0, apl_1.criarSonoIniciadoAPL)({ nome, elapsedInicialMs: 0 }));
        }
        return builder.getResponse();
    },
};
exports.FinalizarSonoHandler = {
    canHandle(handlerInput) {
        return (handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'FinalizarSono');
    },
    async handle(handlerInput) {
        console.log('FinalizarSono chamado, intent:', handlerInput.requestEnvelope.request.intent?.name);
        const attrManager = handlerInput.attributesManager;
        const estado = (await attrManager.getPersistentAttributes());
        const nome = estado.nomeBebe ?? 'o bebê';
        if (!estado.sonoAtual?.emAndamento) {
            (0, sessionFlow_1.setPendingAction)(handlerInput, 'sono_registro_atrasado_confirmacao');
            return handlerInput.responseBuilder
                .speak('Não encontrei sono em andamento. Quer registrar esse sono atrasado?')
                .reprompt('Diga sim para registrar atrasado, ou não para cancelar.')
                .withShouldEndSession(false)
                .getResponse();
        }
        const agora = Date.now();
        const sono = estado.sonoAtual;
        const duracaoMinutos = (0, tempo_1.calcularDuracaoMinutos)(sono.iniciadoEm, agora);
        sono.finalizadoEm = agora;
        sono.duracaoMinutos = duracaoMinutos;
        sono.emAndamento = false;
        if (!estado.ultimosSonos)
            estado.ultimosSonos = [];
        estado.ultimosSonos.unshift(sono);
        if (estado.ultimosSonos.length > 20)
            estado.ultimosSonos.pop();
        estado.sonoAtual = undefined;
        attrManager.setPersistentAttributes(estado);
        await attrManager.savePersistentAttributes();
        const speech = `${nome} acordou. Dormiu por ${(0, tempo_1.formatarTempo)(duracaoMinutos)}.`;
        const timeZone = await (0, userTime_1.obterOuAtualizarTimeZoneUsuario)(handlerInput, estado);
        const horaAcordou = (0, tempo_1.formatarHoraNoFuso)(agora, timeZone);
        const builder = handlerInput.responseBuilder
            .speak(speech)
            .reprompt('O que deseja registrar?')
            .withShouldEndSession(false);
        if ((0, apl_1.supportsAPL)(handlerInput)) {
            builder.addDirective((0, apl_1.criarSonoFinalizadoAPL)({
                nome,
                duracao: (0, tempo_1.formatarTempo)(duracaoMinutos),
                hora: horaAcordou,
            }));
        }
        return builder.getResponse();
    },
};
exports.ConfirmarRegistroSonoAtrasadoHandler = {
    canHandle(handlerInput) {
        if (handlerInput.requestEnvelope.request.type !== 'IntentRequest')
            return false;
        const intentName = handlerInput.requestEnvelope.request.intent?.name;
        return intentName === 'AMAZON.YesIntent' && (0, sessionFlow_1.getPendingAction)(handlerInput) === 'sono_registro_atrasado_confirmacao';
    },
    handle(handlerInput) {
        (0, sessionFlow_1.setPendingAction)(handlerInput, 'sono_registro_atrasado_inicio');
        return handlerInput.responseBuilder
            .speak('Pode dizer há quanto tempo começou, ou que horas começou. Por exemplo: há 40 minutos, ou começou às 9 e meia.')
            .reprompt('Diga há quanto tempo começou, ou que horas começou.')
            .withShouldEndSession(false)
            .getResponse();
    },
};
exports.CancelarRegistroSonoAtrasadoHandler = {
    canHandle(handlerInput) {
        if (handlerInput.requestEnvelope.request.type !== 'IntentRequest')
            return false;
        const intentName = handlerInput.requestEnvelope.request.intent?.name;
        return intentName === 'AMAZON.NoIntent' && (0, sessionFlow_1.getPendingAction)(handlerInput) === 'sono_registro_atrasado_confirmacao';
    },
    handle(handlerInput) {
        (0, sessionFlow_1.clearPendingAction)(handlerInput);
        return handlerInput.responseBuilder
            .speak('Tudo bem. O que deseja registrar?')
            .reprompt('O que deseja registrar?')
            .withShouldEndSession(false)
            .getResponse();
    },
};
exports.InformarInicioSonoAtrasadoHandler = {
    canHandle(handlerInput) {
        if (handlerInput.requestEnvelope.request.type !== 'IntentRequest')
            return false;
        const intentName = handlerInput.requestEnvelope.request.intent?.name;
        return intentName === 'InformarInicioSonoAtrasado' && (0, sessionFlow_1.getPendingAction)(handlerInput) === 'sono_registro_atrasado_inicio';
    },
    async handle(handlerInput) {
        const attrManager = handlerInput.attributesManager;
        const estado = (await attrManager.getPersistentAttributes());
        const request = handlerInput.requestEnvelope.request;
        const duracaoSlot = request.intent?.slots?.duracao?.value;
        const horarioSlot = request.intent?.slots?.horario?.value;
        const agora = Date.now();
        const timeZone = await (0, userTime_1.obterOuAtualizarTimeZoneUsuario)(handlerInput, estado);
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
