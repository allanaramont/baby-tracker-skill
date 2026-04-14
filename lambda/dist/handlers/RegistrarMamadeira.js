"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InformarInicioMamadeiraAtrasadaHandler = exports.RegistrarMamadeiraAtrasadaHandler = exports.RegistrarMamadeiraHandler = void 0;
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
        year: parseInt(parts.find((p) => p.type === 'year')?.value ?? '0', 10),
        month: parseInt(parts.find((p) => p.type === 'month')?.value ?? '0', 10),
        day: parseInt(parts.find((p) => p.type === 'day')?.value ?? '0', 10),
        hour: parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10),
        minute: parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0', 10),
    };
}
function converterHorarioLocalParaTimestamp(horario, timeZone, agora = Date.now()) {
    const match = horario.match(/^(\d{2})(?::(\d{2}))?$/);
    if (!match)
        return undefined;
    const hora = parseInt(match[1], 10);
    const minuto = parseInt(match[2] ?? '0', 10);
    if (Number.isNaN(hora) || Number.isNaN(minuto) || hora > 23 || minuto > 59)
        return undefined;
    const localAgora = obterPartesLocais(agora, timeZone);
    const localTargetUtc = Date.UTC(localAgora.year, localAgora.month - 1, localAgora.day, hora, minuto);
    const partesDoGuess = obterPartesLocais(localTargetUtc, timeZone);
    const guessAsUtc = Date.UTC(partesDoGuess.year, partesDoGuess.month - 1, partesDoGuess.day, partesDoGuess.hour, partesDoGuess.minute);
    const offset = guessAsUtc - localTargetUtc;
    let timestamp = localTargetUtc - offset;
    if (timestamp > agora)
        timestamp -= 24 * 60 * 60 * 1000;
    return timestamp <= agora ? timestamp : undefined;
}
async function registrarMamadeiraAtrasada(handlerInput, estado, registradaEm) {
    const nome = estado.nomeBebe ?? 'o bebê';
    const agora = Date.now();
    const timeZone = await (0, userTime_1.obterOuAtualizarTimeZoneUsuario)(handlerInput, estado);
    const horaRegistradaTexto = (0, tempo_1.formatarHoraNoFuso)(registradaEm, timeZone);
    const mamada = {
        id: (0, tempo_1.gerarId)(),
        tipo: 'mamada',
        subtipo: 'mamadeira',
        iniciadaEm: registradaEm,
        finalizadaEm: registradaEm,
        emAndamento: false,
    };
    if (!estado.ultimasMamadas)
        estado.ultimasMamadas = [];
    estado.ultimasMamadas.unshift(mamada);
    if (estado.ultimasMamadas.length > 20)
        estado.ultimasMamadas.pop();
    (0, sessionFlow_1.clearPendingAction)(handlerInput);
    handlerInput.attributesManager.setPersistentAttributes(estado);
    await handlerInput.attributesManager.savePersistentAttributes();
    const speech = `Mamadeira atrasada registrada para ${nome} às ${horaRegistradaTexto}. O que deseja registrar agora?`;
    return handlerInput.responseBuilder
        .speak(speech)
        .reprompt('O que deseja registrar?')
        .withShouldEndSession(false)
        .getResponse();
}
exports.RegistrarMamadeiraHandler = {
    canHandle(handlerInput) {
        return (handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'RegistrarMamadeira');
    },
    async handle(handlerInput) {
        const attrManager = handlerInput.attributesManager;
        const estado = (await attrManager.getPersistentAttributes());
        const nome = estado.nomeBebe ?? 'o bebê';
        const agora = Date.now();
        const mamada = {
            id: (0, tempo_1.gerarId)(),
            tipo: 'mamada',
            subtipo: 'mamadeira',
            iniciadaEm: agora,
            finalizadaEm: agora,
            emAndamento: false,
        };
        if (!estado.ultimasMamadas)
            estado.ultimasMamadas = [];
        estado.ultimasMamadas.unshift(mamada);
        if (estado.ultimasMamadas.length > 20)
            estado.ultimasMamadas.pop();
        attrManager.setPersistentAttributes(estado);
        await attrManager.savePersistentAttributes();
        const timeZone = await (0, userTime_1.obterOuAtualizarTimeZoneUsuario)(handlerInput, estado);
        const horaRegistradaTexto = (0, tempo_1.formatarHoraNoFuso)(agora, timeZone);
        const speech = `Mamadeira registrada para ${nome} às ${horaRegistradaTexto}. O que deseja registrar agora?`;
        const builder = handlerInput.responseBuilder
            .speak(speech)
            .reprompt('O que deseja registrar?')
            .withShouldEndSession(false);
        if ((0, apl_1.supportsAPL)(handlerInput)) {
            builder.addDirective((0, apl_1.criarResumoMamadaAPL)({
                nome,
                duracaoMinutos: 0,
                duracaoSegundos: 0,
                lado: 'mamadeira',
                horaRegistradaTexto,
            }));
        }
        return builder.getResponse();
    },
};
exports.RegistrarMamadeiraAtrasadaHandler = {
    canHandle(handlerInput) {
        return (handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent?.name === 'RegistrarMamadeiraAtrasada');
    },
    handle(handlerInput) {
        (0, sessionFlow_1.setPendingAction)(handlerInput, 'mamadeira_atrasada_inicio');
        return handlerInput.responseBuilder
            .speak('Pode dizer há quanto tempo foi a mamadeira, ou que horas foi. Por exemplo: há 30 minutos, ou foi às 9 e meia.')
            .reprompt('Diga há quanto tempo foi, ou que horas foi.')
            .withShouldEndSession(false)
            .getResponse();
    },
};
exports.InformarInicioMamadeiraAtrasadaHandler = {
    canHandle(handlerInput) {
        if (handlerInput.requestEnvelope.request.type !== 'IntentRequest')
            return false;
        const intentName = handlerInput.requestEnvelope.request.intent?.name;
        return intentName === 'InformarInicioAtrasado' && (0, sessionFlow_1.getPendingAction)(handlerInput) === 'mamadeira_atrasada_inicio';
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
