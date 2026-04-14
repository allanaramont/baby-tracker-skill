"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UltimaMamadaHandler = void 0;
const tempo_1 = require("../utils/tempo");
const apl_1 = require("../utils/apl");
exports.UltimaMamadaHandler = {
    canHandle(handlerInput) {
        return (handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'UltimaAmamentacao');
    },
    async handle(handlerInput) {
        const attrManager = handlerInput.attributesManager;
        const estado = (await attrManager.getPersistentAttributes());
        const nome = estado.nomeBebe ?? 'o bebê';
        if (estado.mamadaAtual?.emAndamento) {
            const decorrido = (0, tempo_1.tempoDecorrido)(estado.mamadaAtual.iniciadaEm);
            const ladoFormatado = estado.mamadaAtual.lado ? (0, tempo_1.formatarLado)(estado.mamadaAtual.lado) : undefined;
            const ladoStr = ladoFormatado ? ` no ${ladoFormatado}` : '';
            const speech = `${nome} está mamando há ${decorrido}${ladoStr}.`;
            const builder = handlerInput.responseBuilder
                .speak(speech)
                .reprompt('O que deseja registrar?')
                .withShouldEndSession(false);
            if ((0, apl_1.supportsAPL)(handlerInput)) {
                builder.addDirective((0, apl_1.criarUltimaMamadaAPL)({
                    nome,
                    emAndamento: true,
                    haQuanto: decorrido,
                    lado: ladoFormatado,
                }));
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
        const haQuanto = (0, tempo_1.tempoDecorrido)(ultima.finalizadaEm ?? ultima.iniciadaEm);
        const ehMamadeira = ultima.subtipo === 'mamadeira';
        const ladoFormatado = !ehMamadeira && ultima.lado ? (0, tempo_1.formatarLado)(ultima.lado) : undefined;
        const ladoStr = ehMamadeira ? ' via mamadeira' : ladoFormatado ? ` no ${ladoFormatado}` : '';
        const duracaoStr = ultima.duracaoMinutos ? `, e durou ${(0, tempo_1.formatarTempo)(ultima.duracaoMinutos)}` : '';
        const duracaoFormatado = ultima.duracaoMinutos ? (0, tempo_1.formatarTempo)(ultima.duracaoMinutos) : undefined;
        const speech = `A última amamentação de ${nome} foi há ${haQuanto}${ladoStr}${duracaoStr}.`;
        const builder = handlerInput.responseBuilder
            .speak(speech)
            .reprompt('O que deseja registrar?')
            .withShouldEndSession(false);
        if ((0, apl_1.supportsAPL)(handlerInput)) {
            builder.addDirective((0, apl_1.criarUltimaMamadaAPL)({
                nome,
                emAndamento: false,
                haQuanto,
                lado: ladoFormatado,
                duracao: duracaoFormatado,
            }));
        }
        return builder.getResponse();
    },
};
