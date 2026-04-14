"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InformarLadoHandler = exports.IniciarMamadaHandler = void 0;
const tempo_1 = require("../utils/tempo");
const apl_1 = require("../utils/apl");
const sessionFlow_1 = require("../utils/sessionFlow");
function resolverLado(slots) {
    const slot = slots?.lado;
    if (!slot)
        return undefined;
    const resolved = slot.resolutions?.resolutionsPerAuthority?.[0]?.values?.[0]?.value?.id;
    if (resolved)
        return resolved;
    const raw = slot.value?.toLowerCase();
    if (!raw)
        return undefined;
    if (raw.includes('esquer'))
        return 'esquerdo';
    if (raw.includes('direi'))
        return 'direito';
    if (raw.includes('dois') || raw.includes('ambos'))
        return 'ambos';
    return undefined;
}
async function salvarEResponder(handlerInput, estado, nome, ladoFinal) {
    const mamada = {
        id: (0, tempo_1.gerarId)(),
        tipo: 'mamada',
        iniciadaEm: Date.now(),
        emAndamento: true,
        lado: ladoFinal,
    };
    estado.mamadaAtual = mamada;
    if (!estado.ultimasMamadas)
        estado.ultimasMamadas = [];
    const attrManager = handlerInput.attributesManager;
    (0, sessionFlow_1.clearPendingAction)(handlerInput);
    attrManager.setPersistentAttributes(estado);
    await attrManager.savePersistentAttributes();
    console.log('SALVO mamadaAtual:', JSON.stringify(estado.mamadaAtual));
    const speech = `Amamentação iniciada no ${(0, tempo_1.formatarLado)(ladoFinal)}. Diga finalizar amamentação quando terminar.`;
    const builder = handlerInput.responseBuilder
        .speak(speech)
        .reprompt('Diga finalizar amamentação quando terminar.')
        .withShouldEndSession(false);
    if ((0, apl_1.supportsAPL)(handlerInput)) {
        const anterior = estado.ultimasMamadas?.[0];
        builder.addDirective((0, apl_1.criarTimerAmamentacaoAPL)({
            nome,
            lado: ladoFinal,
            iniciadaEm: mamada.iniciadaEm,
            elapsedInicialMs: 0,
            mamadaAnterior: anterior ? {
                duracaoMinutos: anterior.duracaoMinutos,
                lado: anterior.lado,
                finalizadaEm: anterior.finalizadaEm,
            } : undefined,
        }));
    }
    return builder.getResponse();
}
exports.IniciarMamadaHandler = {
    canHandle(handlerInput) {
        return (handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'IniciarAmamentacao');
    },
    async handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const ladoSlot = resolverLado(request.intent?.slots);
        console.log('IniciarAmamentacao ladoSlot:', ladoSlot);
        const attrManager = handlerInput.attributesManager;
        const estado = (await attrManager.getPersistentAttributes());
        const nome = estado.nomeBebe ?? 'o bebê';
        // Já tem amamentação em andamento
        if (estado.mamadaAtual?.emAndamento) {
            const decorrido = (0, tempo_1.tempoDecorrido)(estado.mamadaAtual.iniciadaEm);
            const ladoAtual = estado.mamadaAtual.lado ?? 'esquerdo';
            const speech = `${nome} já está mamando no ${(0, tempo_1.formatarLado)(ladoAtual)} há ${decorrido}. Diga finalizar amamentação quando terminar.`;
            const builder = handlerInput.responseBuilder
                .speak(speech)
                .reprompt('Diga finalizar amamentação quando terminar.')
                .withShouldEndSession(false);
            const aplSupported = (0, apl_1.supportsAPL)(handlerInput);
            console.log('APL supported (já mamando):', aplSupported);
            if (aplSupported) {
                const anterior = estado.ultimasMamadas?.[0];
                const directive = (0, apl_1.criarTimerAmamentacaoAPL)({
                    nome,
                    lado: ladoAtual,
                    iniciadaEm: estado.mamadaAtual.iniciadaEm,
                    elapsedInicialMs: Math.max(0, Date.now() - estado.mamadaAtual.iniciadaEm),
                    mamadaAnterior: anterior ? {
                        duracaoMinutos: anterior.duracaoMinutos,
                        lado: anterior.lado,
                        finalizadaEm: anterior.finalizadaEm,
                    } : undefined,
                });
                console.log('APL directive:', JSON.stringify(directive));
                builder.addDirective(directive);
            }
            return builder.getResponse();
        }
        // Lado informado pelo usuário
        if (ladoSlot) {
            return salvarEResponder(handlerInput, estado, nome, ladoSlot);
        }
        // Sempre perguntar o lado quando não for informado
        (0, sessionFlow_1.setPendingAction)(handlerInput, 'mamada_lado');
        return handlerInput.responseBuilder
            .speak('Qual lado? Esquerdo ou direito?')
            .reprompt('Esquerdo ou direito?')
            .withShouldEndSession(false)
            .getResponse();
    },
};
exports.InformarLadoHandler = {
    canHandle(handlerInput) {
        if (handlerInput.requestEnvelope.request.type !== 'IntentRequest')
            return false;
        const intentName = handlerInput.requestEnvelope.request.intent?.name;
        if (intentName !== 'InformarLado')
            return false;
        return (0, sessionFlow_1.getPendingAction)(handlerInput) === 'mamada_lado';
    },
    async handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const ladoSlot = resolverLado(request.intent?.slots);
        console.log('InformarLado ladoSlot:', ladoSlot);
        if (!ladoSlot) {
            return handlerInput.responseBuilder
                .speak('Não entendi. Esquerdo ou direito?')
                .reprompt('Esquerdo ou direito?')
                .withShouldEndSession(false)
                .getResponse();
        }
        const attrManager = handlerInput.attributesManager;
        const estado = (await attrManager.getPersistentAttributes());
        const nome = estado.nomeBebe ?? 'o bebê';
        return salvarEResponder(handlerInput, estado, nome, ladoSlot);
    },
};
