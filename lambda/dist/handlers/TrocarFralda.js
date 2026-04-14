"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InformarTipoFraldaHandler = exports.TrocarFraldaHandler = void 0;
const tempo_1 = require("../utils/tempo");
const userTime_1 = require("../utils/userTime");
const sessionFlow_1 = require("../utils/sessionFlow");
const apl_1 = require("../utils/apl");
function resolverTipoFralda(slot) {
    const resolvido = slot?.resolutions?.resolutionsPerAuthority?.[0]?.values?.[0]?.value?.id;
    if (resolvido)
        return resolvido;
    const raw = slot?.value
        ?.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
    if (!raw)
        return undefined;
    const temXixi = raw.includes('xixi') || raw.includes('urina') || raw.includes('mijo');
    const temCoco = raw.includes('coc') || raw.includes('fez') || raw.includes('evacu');
    const temAmbos = raw.includes('os dois') || raw.includes('ambos') || raw.includes('tambem');
    if ((temXixi && temCoco) || (temXixi && temAmbos) || (temCoco && temAmbos))
        return 'os_dois';
    if (temCoco)
        return 'coco';
    if (temXixi)
        return 'xixi';
    return undefined;
}
async function registrarFralda(handlerInput, estado, tipoSlot) {
    const agora = Date.now();
    const timeZoneUsuario = await (0, userTime_1.obterOuAtualizarTimeZoneUsuario)(handlerInput, estado);
    const fralda = {
        id: (0, tempo_1.gerarId)(),
        tipo: 'fralda',
        registradaEm: agora,
        tipoBaixo: tipoSlot,
    };
    if (!estado.ultimasFraldas)
        estado.ultimasFraldas = [];
    estado.ultimasFraldas.unshift(fralda);
    if (estado.ultimasFraldas.length > 30)
        estado.ultimasFraldas.pop();
    (0, sessionFlow_1.clearPendingAction)(handlerInput);
    handlerInput.attributesManager.setPersistentAttributes(estado);
    await handlerInput.attributesManager.savePersistentAttributes();
    const tipoFormatado = (0, tempo_1.formatarFralda)(tipoSlot);
    const hora = (0, tempo_1.formatarHoraNoFuso)(agora, timeZoneUsuario);
    const chaveHoje = (0, tempo_1.obterChaveDataNoFuso)(agora, timeZoneUsuario);
    const totalHoje = estado.ultimasFraldas.filter((f) => (0, tempo_1.obterChaveDataNoFuso)(f.registradaEm, timeZoneUsuario) === chaveHoje).length;
    const fraldaAnterior = estado.ultimasFraldas[1];
    const ultimaFralda = fraldaAnterior
        ? {
            haQuanto: (0, tempo_1.tempoDecorrido)(fraldaAnterior.registradaEm),
            tipo: (0, tempo_1.formatarFralda)(fraldaAnterior.tipoBaixo),
        }
        : undefined;
    const builder = handlerInput.responseBuilder
        .speak(`Fralda com ${tipoFormatado} registrada às ${hora}.`)
        .reprompt('O que deseja registrar?')
        .withShouldEndSession(false);
    if ((0, apl_1.supportsAPL)(handlerInput)) {
        builder.addDirective((0, apl_1.criarTrocaFraldaAPL)({
            tipoBaixo: tipoSlot,
            hora,
            ultimaFralda,
            totalHoje,
        }));
    }
    return builder.getResponse();
}
exports.TrocarFraldaHandler = {
    canHandle(handlerInput) {
        return (handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'TrocarFralda');
    },
    async handle(handlerInput) {
        const attrManager = handlerInput.attributesManager;
        const estado = (await attrManager.getPersistentAttributes());
        const intent = handlerInput.requestEnvelope.request;
        const tipoSlot = resolverTipoFralda(intent.intent?.slots?.tipoBaixo);
        if (!tipoSlot) {
            (0, sessionFlow_1.setPendingAction)(handlerInput, 'fralda_tipo');
            return handlerInput.responseBuilder
                .speak('Diga: xixi, cocô ou os dois.')
                .reprompt('Xixi, cocô ou os dois?')
                .withShouldEndSession(false)
                .getResponse();
        }
        return registrarFralda(handlerInput, estado, tipoSlot);
    },
};
exports.InformarTipoFraldaHandler = {
    canHandle(handlerInput) {
        if (handlerInput.requestEnvelope.request.type !== 'IntentRequest')
            return false;
        const intentName = handlerInput.requestEnvelope.request.intent?.name;
        if (intentName !== 'InformarTipoFralda')
            return false;
        return (0, sessionFlow_1.getPendingAction)(handlerInput) === 'fralda_tipo';
    },
    async handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const tipoSlot = resolverTipoFralda(request.intent?.slots?.tipoBaixo);
        if (!tipoSlot) {
            return handlerInput.responseBuilder
                .speak('Responda só: xixi, cocô ou os dois.')
                .reprompt('Pode responder: xixi, cocô ou os dois.')
                .withShouldEndSession(false)
                .getResponse();
        }
        const attrManager = handlerInput.attributesManager;
        const estado = (await attrManager.getPersistentAttributes());
        return registrarFralda(handlerInput, estado, tipoSlot);
    },
};
