"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProximaConsultaHandler = void 0;
const apl_1 = require("../utils/apl");
exports.ProximaConsultaHandler = {
    canHandle(handlerInput) {
        return (handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'ProximaConsulta');
    },
    async handle(handlerInput) {
        const attrManager = handlerInput.attributesManager;
        const estado = (await attrManager.getPersistentAttributes());
        const intent = handlerInput.requestEnvelope.request;
        const descricaoSlot = intent.intent?.slots?.descricao?.value;
        if (descricaoSlot) {
            estado.proximaConsulta = {
                descricao: descricaoSlot,
                timestamp: Date.now(),
            };
            attrManager.setPersistentAttributes(estado);
            await attrManager.savePersistentAttributes();
            const builder = handlerInput.responseBuilder
                .speak(`Consulta registrada: ${descricaoSlot}!`)
                .reprompt('O que deseja registrar?')
                .withShouldEndSession(false);
            if ((0, apl_1.supportsAPL)(handlerInput)) {
                builder.addDirective((0, apl_1.criarConsultaAPL)({ descricao: descricaoSlot, registrado: true }));
            }
            return builder.getResponse();
        }
        if (estado.proximaConsulta) {
            const builder = handlerInput.responseBuilder
                .speak(`Próxima consulta: ${estado.proximaConsulta.descricao}.`)
                .reprompt('O que deseja registrar?')
                .withShouldEndSession(false);
            if ((0, apl_1.supportsAPL)(handlerInput)) {
                builder.addDirective((0, apl_1.criarConsultaAPL)({ descricao: estado.proximaConsulta.descricao, registrado: false }));
            }
            return builder.getResponse();
        }
        return handlerInput.responseBuilder
            .speak('Nenhuma consulta registrada. Pode falar, por exemplo, "próxima consulta é sexta às 10 horas".')
            .reprompt('O que deseja registrar?')
            .withShouldEndSession(false)
            .getResponse();
    },
};
