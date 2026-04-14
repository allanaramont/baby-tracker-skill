"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrarPesoHandler = void 0;
const tempo_1 = require("../utils/tempo");
const apl_1 = require("../utils/apl");
exports.RegistrarPesoHandler = {
    canHandle(handlerInput) {
        return (handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'RegistrarPeso');
    },
    async handle(handlerInput) {
        const attrManager = handlerInput.attributesManager;
        const estado = (await attrManager.getPersistentAttributes());
        const intent = handlerInput.requestEnvelope.request;
        const quilosSlot = intent.intent?.slots?.quilos?.value;
        const gramosSlot = intent.intent?.slots?.gramos?.value;
        if (!quilosSlot) {
            return handlerInput.responseBuilder
                .speak('Qual é o peso? Pode dizer, por exemplo, 3 quilos e 200 gramas. Se quiser, diga ajuda.')
                .addElicitSlotDirective('quilos', intent.intent)
                .withShouldEndSession(false)
                .getResponse();
        }
        const quilos = parseFloat(quilosSlot);
        const gramas = gramosSlot ? parseInt(gramosSlot, 10) : 0;
        const pesoTotalGramas = Math.round(quilos * 1000 + gramas);
        const registro = {
            id: (0, tempo_1.gerarId)(),
            tipo: 'peso',
            registradoEm: Date.now(),
            pesoGramas: pesoTotalGramas,
        };
        if (!estado.registrosPeso)
            estado.registrosPeso = [];
        const pesosAnteriores = estado.registrosPeso;
        const diferencaMsg = pesosAnteriores.length > 0
            ? (() => {
                const anterior = pesosAnteriores[0].pesoGramas;
                const diff = pesoTotalGramas - anterior;
                const diffAbs = Math.abs(diff);
                const diffKg = (diffAbs / 1000).toFixed(2).replace('.', ',');
                return diff > 0
                    ? ` Ganhou ${diffKg} kg desde a última pesagem.`
                    : diff < 0
                        ? ` Perdeu ${diffKg} kg desde a última pesagem.`
                        : ' Mesmo peso da última pesagem.';
            })()
            : '';
        estado.registrosPeso.unshift(registro);
        if (estado.registrosPeso.length > 50)
            estado.registrosPeso.pop();
        attrManager.setPersistentAttributes(estado);
        await attrManager.savePersistentAttributes();
        const pesoFormatado = gramas > 0
            ? `${quilos} quilos e ${gramas} gramas`
            : `${quilos} quilos`;
        const speech = `Peso registrado: ${pesoFormatado}.${diferencaMsg}`;
        // Formatar peso para APL
        const gramasRestantes = pesoTotalGramas % 1000;
        const quilosTotais = Math.floor(pesoTotalGramas / 1000);
        const pesoAPL = gramasRestantes > 0
            ? `${quilosTotais},${String(gramasRestantes).padStart(3, '0').slice(0, 3)} kg`
            : `${quilosTotais} kg`;
        let tendencia;
        let diferencaAPL;
        if (pesosAnteriores.length > 0) {
            const anterior = pesosAnteriores[0].pesoGramas;
            const diff = pesoTotalGramas - anterior;
            const diffAbs = Math.abs(diff);
            if (diff > 0) {
                tendencia = 'subiu';
                diferencaAPL = diffAbs >= 1000
                    ? `${(diffAbs / 1000).toFixed(2).replace('.', ',')} kg`
                    : `${diffAbs}g`;
            }
            else if (diff < 0) {
                tendencia = 'caiu';
                diferencaAPL = diffAbs >= 1000
                    ? `${(diffAbs / 1000).toFixed(2).replace('.', ',')} kg`
                    : `${diffAbs}g`;
            }
            else {
                tendencia = 'igual';
            }
        }
        const nome = estado.nomeBebe ?? 'o bebê';
        const builder = handlerInput.responseBuilder
            .speak(speech)
            .reprompt('O que deseja registrar?')
            .withShouldEndSession(false);
        if ((0, apl_1.supportsAPL)(handlerInput)) {
            builder.addDirective((0, apl_1.criarPesoAPL)({
                nome,
                pesoFormatado: pesoAPL,
                diferenca: diferencaAPL,
                tendencia,
            }));
        }
        return builder.getResponse();
    },
};
