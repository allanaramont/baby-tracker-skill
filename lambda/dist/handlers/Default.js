"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = exports.SessionEndedRequestHandler = exports.CancelAndStopIntentHandler = exports.FallbackIntentHandler = exports.HelpIntentHandler = exports.DefinirNomeBebeHandler = exports.LaunchRequestHandler = void 0;
const apl_1 = require("../utils/apl");
const tempo_1 = require("../utils/tempo");
const auth_1 = require("../utils/auth");
exports.LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    async handle(handlerInput) {
        // Solicitar vinculacao de conta se ainda nao foi feita
        if (!(0, auth_1.temContaVinculada)(handlerInput.requestEnvelope)) {
            return handlerInput.responseBuilder
                .speak('Para usar o Diário do Bebê, você precisa vincular sua conta. Por favor, abra o aplicativo Alexa e vincule sua conta na seção de skills.')
                .withLinkAccountCard()
                .getResponse();
        }
        const attrManager = handlerInput.attributesManager;
        const estado = (await attrManager.getPersistentAttributes());
        if (!estado.nomeBebe) {
            return handlerInput.responseBuilder
                .speak('Bem-vindo ao Diário do Bebê! Para começar, diga: o nome é, seguido do nome do bebê.')
                .reprompt('Diga: o nome é, seguido do nome do bebê.')
                .withShouldEndSession(false)
                .getResponse();
        }
        if (estado.mamadaAtual?.emAndamento) {
            const decorrido = (0, tempo_1.tempoDecorrido)(estado.mamadaAtual.iniciadaEm);
            const lado = estado.mamadaAtual.lado ?? 'esquerdo';
            const ladoStr = (0, tempo_1.formatarLado)(lado);
            const speech = `${estado.nomeBebe} está mamando no ${ladoStr} há ${decorrido}. Diga finalizar amamentação quando terminar.`;
            const builder = handlerInput.responseBuilder
                .speak(speech)
                .reprompt('Diga finalizar amamentação quando terminar.')
                .withShouldEndSession(false);
            if ((0, apl_1.supportsAPL)(handlerInput)) {
                const anterior = estado.ultimasMamadas?.[0];
                builder.addDirective((0, apl_1.criarTimerAmamentacaoAPL)({
                    nome: estado.nomeBebe,
                    lado: lado,
                    iniciadaEm: estado.mamadaAtual.iniciadaEm,
                    elapsedInicialMs: Math.max(0, Date.now() - estado.mamadaAtual.iniciadaEm),
                    mamadaAnterior: anterior ? {
                        duracaoMinutos: anterior.duracaoMinutos,
                        lado: anterior.lado,
                        finalizadaEm: anterior.finalizadaEm,
                    } : undefined,
                }));
            }
            return builder.getResponse();
        }
        const speech = `Diário ${estado.nomeBebe} aberto. O que deseja registrar? Se quiser, diga ajuda.`;
        const builder = handlerInput.responseBuilder
            .speak(speech)
            .reprompt('O que deseja registrar?')
            .withShouldEndSession(false);
        if ((0, apl_1.supportsAPL)(handlerInput)) {
            const ultimaMamada = estado.ultimasMamadas?.[0];
            const ultimaFralda = estado.ultimasFraldas?.[0];
            const ultimoSono = estado.ultimosSonos?.[0];
            builder.addDirective((0, apl_1.criarHomeDashboardAPL)({
                nome: estado.nomeBebe,
                mamadaEmAndamento: false,
                ultimaMamadaHaQuanto: ultimaMamada
                    ? (0, tempo_1.tempoDecorrido)(ultimaMamada.finalizadaEm ?? ultimaMamada.iniciadaEm)
                    : undefined,
                ultimaMamadaDuracao: ultimaMamada?.duracaoMinutos != null
                    ? (0, tempo_1.formatarTempo)(ultimaMamada.duracaoMinutos)
                    : undefined,
                ultimaFraldaHaQuanto: ultimaFralda ? (0, tempo_1.tempoDecorrido)(ultimaFralda.registradaEm) : undefined,
                ultimaFraldaTipo: ultimaFralda ? (0, tempo_1.formatarFralda)(ultimaFralda.tipoBaixo) : undefined,
                sonoEmAndamento: estado.sonoAtual?.emAndamento ?? false,
                sonoHaQuanto: estado.sonoAtual?.emAndamento
                    ? (0, tempo_1.tempoDecorrido)(estado.sonoAtual.iniciadoEm)
                    : ultimoSono
                        ? (0, tempo_1.tempoDecorrido)(ultimoSono.finalizadoEm ?? ultimoSono.iniciadoEm)
                        : undefined,
            }));
        }
        return builder.getResponse();
    },
};
exports.DefinirNomeBebeHandler = {
    canHandle(handlerInput) {
        return (handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'DefinirNomeBebe');
    },
    async handle(handlerInput) {
        const attrManager = handlerInput.attributesManager;
        const estado = (await attrManager.getPersistentAttributes());
        const intent = handlerInput.requestEnvelope.request;
        const nome = intent.intent?.slots?.nomeBebe?.value;
        if (!nome) {
            return handlerInput.responseBuilder
                .speak('Não entendi o nome. Tente dizer: o nome é, seguido do nome.')
                .reprompt('Diga: o nome é, seguido do nome do bebê.')
                .withShouldEndSession(false)
                .getResponse();
        }
        const nomeFormatado = nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase();
        const nomeAnterior = estado.nomeBebe;
        estado.nomeBebe = nomeFormatado;
        attrManager.setPersistentAttributes(estado);
        await attrManager.savePersistentAttributes();
        return handlerInput.responseBuilder
            .speak(nomeAnterior && nomeAnterior !== nomeFormatado
            ? `Nome atualizado para ${nomeFormatado}. O que deseja registrar?`
            : `Certo, vou chamar de ${nomeFormatado}. O que deseja registrar?`)
            .reprompt('O que deseja registrar?')
            .withShouldEndSession(false)
            .getResponse();
    },
};
exports.HelpIntentHandler = {
    canHandle(handlerInput) {
        return (handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent');
    },
    handle(handlerInput) {
        const speech = 'Posso registrar amamentação, fralda, sono, peso e remédio. ' +
            'Também posso te dizer a última amamentação, a última fralda e o resumo de hoje. ' +
            'Também posso alterar o nome do bebê. O que deseja?';
        return handlerInput.responseBuilder
            .speak(speech)
            .reprompt('O que deseja registrar?')
            .withShouldEndSession(false)
            .getResponse();
    },
};
exports.FallbackIntentHandler = {
    canHandle(handlerInput) {
        return (handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'AMAZON.FallbackIntent');
    },
    async handle(handlerInput) {
        const estado = (await handlerInput.attributesManager.getPersistentAttributes());
        if (estado.mamadaAtual?.emAndamento) {
            const decorrido = (0, tempo_1.tempoDecorrido)(estado.mamadaAtual.iniciadaEm);
            const ladoStr = (0, tempo_1.formatarLado)(estado.mamadaAtual.lado ?? 'esquerdo');
            return handlerInput.responseBuilder
                .speak(`${estado.nomeBebe ?? 'O bebê'} está mamando no ${ladoStr} há ${decorrido}. Diga finalizar amamentação quando terminar.`)
                .reprompt('Diga finalizar amamentação quando terminar.')
                .withShouldEndSession(false)
                .getResponse();
        }
        return handlerInput.responseBuilder
            .speak('Não entendi. Tente uma frase curta como: iniciar amamentação, trocar fralda de xixi, bebê acordou, ou resumo de hoje. Se quiser, diga ajuda.')
            .reprompt('Tente dizer: iniciar amamentação, trocar fralda de cocô, ou diga ajuda.')
            .withShouldEndSession(false)
            .getResponse();
    },
};
exports.CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return (handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent' ||
                handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent'));
    },
    async handle(handlerInput) {
        const estado = (await handlerInput.attributesManager.getPersistentAttributes());
        const nome = estado.nomeBebe ?? 'do bebê';
        return handlerInput.responseBuilder
            .speak(`Fechando diário ${nome}, até logo.`)
            .getResponse();
    },
};
exports.SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder.getResponse();
    },
};
exports.ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.error('Erro:', error.message);
        return handlerInput.responseBuilder
            .speak('Desculpe, ocorreu um erro. Tente novamente. Se quiser, diga ajuda.')
            .reprompt('O que deseja registrar? Se quiser, diga ajuda.')
            .withShouldEndSession(false)
            .getResponse();
    },
};
