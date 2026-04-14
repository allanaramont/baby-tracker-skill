"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UltimaFraldaHandler = void 0;
const tempo_1 = require("../utils/tempo");
const apl_1 = require("../utils/apl");
exports.UltimaFraldaHandler = {
    canHandle(handlerInput) {
        return (handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'UltimaFralda');
    },
    async handle(handlerInput) {
        const attrManager = handlerInput.attributesManager;
        const estado = (await attrManager.getPersistentAttributes());
        const fraldas = estado.ultimasFraldas ?? [];
        if (fraldas.length === 0) {
            return handlerInput.responseBuilder
                .speak('Nenhuma troca de fralda registrada ainda.')
                .reprompt('O que deseja registrar?')
                .withShouldEndSession(false)
                .getResponse();
        }
        const ultima = fraldas[0];
        const haQuanto = (0, tempo_1.tempoDecorrido)(ultima.registradaEm);
        const tipo = (0, tempo_1.formatarFralda)(ultima.tipoBaixo);
        const hoje = new Date();
        const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
        const fraldaDeHoje = fraldas.filter((f) => {
            const d = new Date(f.registradaEm);
            const s = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            return s === hojeStr;
        });
        const totalHoje = fraldaDeHoje.length;
        const cocos = fraldaDeHoje.filter((f) => f.tipoBaixo === 'coco' || f.tipoBaixo === 'os_dois').length;
        const xixis = totalHoje - cocos;
        const speech = `A última fralda foi há ${haQuanto}, com ${tipo}.`;
        const builder = handlerInput.responseBuilder
            .speak(speech)
            .reprompt('O que deseja registrar?')
            .withShouldEndSession(false);
        if ((0, apl_1.supportsAPL)(handlerInput)) {
            builder.addDirective((0, apl_1.criarUltimaFraldaAPL)({
                haQuanto,
                tipo,
                totalHoje,
                cocos,
                xixis,
            }));
        }
        return builder.getResponse();
    },
};
