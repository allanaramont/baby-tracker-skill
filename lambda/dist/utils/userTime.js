"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obterOuAtualizarTimeZoneUsuario = obterOuAtualizarTimeZoneUsuario;
async function obterOuAtualizarTimeZoneUsuario(handlerInput, estado) {
    if (estado.timeZoneUsuario) {
        return estado.timeZoneUsuario;
    }
    const locale = handlerInput.requestEnvelope.request?.locale;
    if (locale === 'pt-BR') {
        estado.timeZoneUsuario = 'America/Sao_Paulo';
        handlerInput.attributesManager.setPersistentAttributes(estado);
        await handlerInput.attributesManager.savePersistentAttributes();
    }
    return estado.timeZoneUsuario;
}
