"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InformarInicioAmamentacaoAtrasadaHandler = exports.CancelarRegistroAmamentacaoAtrasadaHandler = exports.ConfirmarRegistroAmamentacaoAtrasadaHandler = exports.FinalizarMamadaHandler = void 0;
const tempo_1 = require("../utils/tempo");
const apl_1 = require("../utils/apl");
const userTime_1 = require("../utils/userTime");
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
async function registrarAmamentacaoAtrasada(handlerInput, estado, iniciadoEm, ladoFinal) {
    const nome = estado.nomeBebe ?? 'o bebê';
    const agora = Date.now();
    const timeZoneUsuario = await (0, userTime_1.obterOuAtualizarTimeZoneUsuario)(handlerInput, estado);
    const horaRegistradaTexto = (0, tempo_1.formatarHoraNoFuso)(agora, timeZoneUsuario);
    const duracaoMinutos = (0, tempo_1.calcularDuracaoMinutos)(iniciadoEm, agora);
    const duracaoSegundos = (0, tempo_1.calcularDuracaoSegundos)(iniciadoEm, agora);
    const mamada = {
        id: (0, tempo_1.gerarId)(),
        tipo: 'mamada',
        iniciadaEm: iniciadoEm,
        finalizadaEm: agora,
        duracaoMinutos,
        lado: ladoFinal,
        emAndamento: false,
    };
    if (!estado.ultimasMamadas)
        estado.ultimasMamadas = [];
    estado.ultimasMamadas.unshift(mamada);
    if (estado.ultimasMamadas.length > 20)
        estado.ultimasMamadas.pop();
    estado.ultimoLadoMamada = ladoFinal;
    (0, sessionFlow_1.clearPendingAction)(handlerInput);
    handlerInput.attributesManager.setPersistentAttributes(estado);
    await handlerInput.attributesManager.savePersistentAttributes();
    const speech = `Registrei essa amamentação atrasada. ${(0, tempo_1.formatarTempo)(duracaoMinutos)} no ${(0, tempo_1.formatarLado)(ladoFinal)}. O que deseja registrar agora?`;
    const builder = handlerInput.responseBuilder
        .speak(speech)
        .reprompt('O que deseja registrar?')
        .withShouldEndSession(false);
    if ((0, apl_1.supportsAPL)(handlerInput)) {
        builder.addDirective((0, apl_1.criarResumoMamadaAPL)({
            nome,
            duracaoMinutos,
            duracaoSegundos,
            lado: ladoFinal,
            horaRegistradaTexto,
        }));
    }
    return builder.getResponse();
}
exports.FinalizarMamadaHandler = {
    canHandle(handlerInput) {
        return (handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'FinalizarAmamentacao');
    },
    async handle(handlerInput) {
        console.log('FinalizarAmamentacao chamado');
        const attrManager = handlerInput.attributesManager;
        const estado = (await attrManager.getPersistentAttributes());
        const nome = estado.nomeBebe ?? 'o bebê';
        const intent = handlerInput.requestEnvelope.request;
        const ladoSlot = intent.intent?.slots?.lado?.resolutions?.resolutionsPerAuthority?.[0]?.values?.[0]?.value?.id;
        const duracaoSlot = intent.intent?.slots?.duracaoMinutos?.value;
        const agora = Date.now();
        const timeZoneUsuario = await (0, userTime_1.obterOuAtualizarTimeZoneUsuario)(handlerInput, estado);
        const horaRegistradaTexto = (0, tempo_1.formatarHoraNoFuso)(agora, timeZoneUsuario);
        if (!estado.mamadaAtual?.emAndamento) {
            if (duracaoSlot) {
                const duracaoMinutos = parseInt(duracaoSlot, 10);
                const duracaoSegundos = duracaoMinutos * 60;
                const ladoFinal = ladoSlot ?? estado.ultimoLadoMamada ?? 'esquerdo';
                const inicioEstimado = agora - duracaoMinutos * 60000;
                const mamada = {
                    id: (0, tempo_1.gerarId)(),
                    tipo: 'mamada',
                    iniciadaEm: inicioEstimado,
                    finalizadaEm: agora,
                    duracaoMinutos,
                    lado: ladoFinal,
                    emAndamento: false,
                };
                if (!estado.ultimasMamadas)
                    estado.ultimasMamadas = [];
                estado.ultimasMamadas.unshift(mamada);
                if (estado.ultimasMamadas.length > 20)
                    estado.ultimasMamadas.pop();
                estado.ultimoLadoMamada = ladoFinal;
                attrManager.setPersistentAttributes(estado);
                await attrManager.savePersistentAttributes();
                const speech = `Amamentação registrada: ${(0, tempo_1.formatarTempo)(duracaoMinutos)} no ${(0, tempo_1.formatarLado)(ladoFinal)}. O que deseja registrar agora?`;
                const builder = handlerInput.responseBuilder.speak(speech).reprompt('O que deseja registrar?').withShouldEndSession(false);
                if ((0, apl_1.supportsAPL)(handlerInput)) {
                    builder.addDirective((0, apl_1.criarResumoMamadaAPL)({
                        nome,
                        duracaoMinutos,
                        duracaoSegundos,
                        lado: ladoFinal,
                        horaRegistradaTexto,
                    }));
                }
                return builder.getResponse();
            }
            (0, sessionFlow_1.setPendingAction)(handlerInput, 'amamentacao_registro_atrasado_confirmacao', {
                lado: ladoSlot,
            });
            return handlerInput.responseBuilder
                .speak(`Não encontrei amamentação em andamento para ${nome}. Quer registrar essa amamentação atrasada?`)
                .reprompt('Diga sim para registrar atrasado, ou não para cancelar.')
                .withShouldEndSession(false)
                .getResponse();
        }
        const mamada = estado.mamadaAtual;
        const ladoFinal = ladoSlot ?? mamada.lado ?? 'esquerdo';
        const duracaoMinutos = (0, tempo_1.calcularDuracaoMinutos)(mamada.iniciadaEm, agora);
        const duracaoSegundos = (0, tempo_1.calcularDuracaoSegundos)(mamada.iniciadaEm, agora);
        mamada.finalizadaEm = agora;
        mamada.duracaoMinutos = duracaoMinutos;
        mamada.lado = ladoFinal;
        mamada.emAndamento = false;
        if (!estado.ultimasMamadas)
            estado.ultimasMamadas = [];
        estado.ultimasMamadas.unshift(mamada);
        if (estado.ultimasMamadas.length > 20)
            estado.ultimasMamadas.pop();
        estado.mamadaAtual = undefined;
        estado.ultimoLadoMamada = ladoFinal;
        attrManager.setPersistentAttributes(estado);
        await attrManager.savePersistentAttributes();
        const speech = `Amamentação finalizada. ${(0, tempo_1.formatarTempo)(duracaoMinutos)} no ${(0, tempo_1.formatarLado)(ladoFinal)}. O que deseja registrar agora?`;
        const builder = handlerInput.responseBuilder.speak(speech).reprompt('O que deseja registrar?').withShouldEndSession(false);
        if ((0, apl_1.supportsAPL)(handlerInput)) {
            builder.addDirective((0, apl_1.criarResumoMamadaAPL)({
                nome,
                duracaoMinutos,
                duracaoSegundos,
                lado: ladoFinal,
                horaRegistradaTexto,
            }));
        }
        return builder.getResponse();
    },
};
exports.ConfirmarRegistroAmamentacaoAtrasadaHandler = {
    canHandle(handlerInput) {
        if (handlerInput.requestEnvelope.request.type !== 'IntentRequest')
            return false;
        const intentName = handlerInput.requestEnvelope.request.intent?.name;
        return intentName === 'AMAZON.YesIntent' && (0, sessionFlow_1.getPendingAction)(handlerInput) === 'amamentacao_registro_atrasado_confirmacao';
    },
    handle(handlerInput) {
        const pendingData = (0, sessionFlow_1.getPendingData)(handlerInput);
        (0, sessionFlow_1.setPendingAction)(handlerInput, 'amamentacao_registro_atrasado_inicio', pendingData);
        return handlerInput.responseBuilder
            .speak('Pode dizer há quanto tempo começou, ou que horas começou. Por exemplo: há 20 minutos, ou começou às 8 e quinze.')
            .reprompt('Diga há quanto tempo começou, ou que horas começou.')
            .withShouldEndSession(false)
            .getResponse();
    },
};
exports.CancelarRegistroAmamentacaoAtrasadaHandler = {
    canHandle(handlerInput) {
        if (handlerInput.requestEnvelope.request.type !== 'IntentRequest')
            return false;
        const intentName = handlerInput.requestEnvelope.request.intent?.name;
        return intentName === 'AMAZON.NoIntent' && (0, sessionFlow_1.getPendingAction)(handlerInput) === 'amamentacao_registro_atrasado_confirmacao';
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
exports.InformarInicioAmamentacaoAtrasadaHandler = {
    canHandle(handlerInput) {
        if (handlerInput.requestEnvelope.request.type !== 'IntentRequest')
            return false;
        const intentName = handlerInput.requestEnvelope.request.intent?.name;
        return intentName === 'InformarInicioAmamentacaoAtrasada' && (0, sessionFlow_1.getPendingAction)(handlerInput) === 'amamentacao_registro_atrasado_inicio';
    },
    async handle(handlerInput) {
        const attrManager = handlerInput.attributesManager;
        const estado = (await attrManager.getPersistentAttributes());
        const request = handlerInput.requestEnvelope.request;
        const duracaoSlot = request.intent?.slots?.duracao?.value;
        const horarioSlot = request.intent?.slots?.horario?.value;
        const agora = Date.now();
        const timeZone = await (0, userTime_1.obterOuAtualizarTimeZoneUsuario)(handlerInput, estado);
        const pendingData = (0, sessionFlow_1.getPendingData)(handlerInput);
        const ladoFinal = pendingData?.lado ?? estado.ultimoLadoMamada ?? 'esquerdo';
        const duracaoMinutos = parseDurationToMinutes(duracaoSlot);
        if (duracaoMinutos != null) {
            return registrarAmamentacaoAtrasada(handlerInput, estado, agora - duracaoMinutos * 60000, ladoFinal);
        }
        const iniciadoEm = converterHorarioLocalParaTimestamp(horarioSlot ?? '', timeZone, agora);
        if (iniciadoEm != null) {
            return registrarAmamentacaoAtrasada(handlerInput, estado, iniciadoEm, ladoFinal);
        }
        return handlerInput.responseBuilder
            .speak('Não entendi o início da amamentação. Pode dizer há quanto tempo começou, ou que horas começou.')
            .reprompt('Por exemplo: há 20 minutos, ou começou às 8 e quinze.')
            .withShouldEndSession(false)
            .getResponse();
    },
};
