"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UltimoRemedioHandler = exports.RegistrarRemedioHandler = void 0;
const tempo_1 = require("../utils/tempo");
const userTime_1 = require("../utils/userTime");
const apl_1 = require("../utils/apl");
exports.RegistrarRemedioHandler = {
    canHandle(handlerInput) {
        return (handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'RegistrarRemedio');
    },
    async handle(handlerInput) {
        const attrManager = handlerInput.attributesManager;
        const estado = (await attrManager.getPersistentAttributes());
        const intent = handlerInput.requestEnvelope.request;
        const nomeSlot = intent.intent?.slots?.nomeRemedio?.value;
        const doseSlot = intent.intent?.slots?.dose?.value;
        const unidadeSlot = intent.intent?.slots?.unidadeDose?.resolutions?.resolutionsPerAuthority?.[0]?.values?.[0]?.value?.id;
        if (!nomeSlot) {
            return handlerInput.responseBuilder
                .speak('Qual é o remédio? Se quiser, diga ajuda.')
                .addElicitSlotDirective('nomeRemedio', intent.intent)
                .withShouldEndSession(false)
                .getResponse();
        }
        if (!doseSlot) {
            return handlerInput.responseBuilder
                .speak(`Qual é a dose do ${nomeSlot}? Se quiser, diga ajuda.`)
                .addElicitSlotDirective('dose', intent.intent)
                .withShouldEndSession(false)
                .getResponse();
        }
        const agora = Date.now();
        const timeZoneUsuario = await (0, userTime_1.obterOuAtualizarTimeZoneUsuario)(handlerInput, estado);
        const unidade = unidadeSlot ?? 'ml';
        const registro = {
            id: (0, tempo_1.gerarId)(),
            tipo: 'remedio',
            registradoEm: agora,
            nome: nomeSlot,
            dose: parseFloat(doseSlot),
            unidade,
        };
        if (!estado.ultimosRemedios)
            estado.ultimosRemedios = [];
        estado.ultimosRemedios.unshift(registro);
        if (estado.ultimosRemedios.length > 50)
            estado.ultimosRemedios.pop();
        attrManager.setPersistentAttributes(estado);
        await attrManager.savePersistentAttributes();
        const hora = (0, tempo_1.formatarHoraNoFuso)(agora, timeZoneUsuario);
        const speech = `${nomeSlot}: ${doseSlot} ${unidade}, às ${hora}.`;
        const builder = handlerInput.responseBuilder
            .speak(speech)
            .reprompt('O que deseja registrar?')
            .withShouldEndSession(false);
        if ((0, apl_1.supportsAPL)(handlerInput)) {
            builder.addDirective((0, apl_1.criarRemedioAPL)({
                nome: nomeSlot,
                dose: doseSlot,
                unidade,
                hora,
            }));
        }
        return builder.getResponse();
    },
};
exports.UltimoRemedioHandler = {
    canHandle(handlerInput) {
        return (handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'UltimoRemedio');
    },
    async handle(handlerInput) {
        const attrManager = handlerInput.attributesManager;
        const estado = (await attrManager.getPersistentAttributes());
        const intent = handlerInput.requestEnvelope.request;
        const nomeSlot = intent.intent?.slots?.nomeRemedio?.value;
        const remedios = estado.ultimosRemedios ?? [];
        if (remedios.length === 0) {
            return handlerInput.responseBuilder
                .speak('Nenhum remédio registrado ainda.')
                .reprompt('O que deseja registrar?')
                .withShouldEndSession(false)
                .getResponse();
        }
        const lista = nomeSlot
            ? remedios.filter((r) => r.nome.toLowerCase().includes(nomeSlot.toLowerCase()))
            : remedios;
        if (lista.length === 0) {
            return handlerInput.responseBuilder
                .speak(`Não encontrei registro para ${nomeSlot}.`)
                .reprompt('O que deseja registrar?')
                .withShouldEndSession(false)
                .getResponse();
        }
        const ultimo = lista[0];
        const haQuanto = (0, tempo_1.tempoDecorrido)(ultimo.registradoEm);
        const speech = `Último ${ultimo.nome}: ${ultimo.dose} ${ultimo.unidade}, há ${haQuanto}.`;
        const builder = handlerInput.responseBuilder
            .speak(speech)
            .reprompt('O que deseja registrar?')
            .withShouldEndSession(false);
        if ((0, apl_1.supportsAPL)(handlerInput)) {
            builder.addDirective((0, apl_1.criarUltimoRemedioAPL)({
                nome: ultimo.nome,
                dose: String(ultimo.dose),
                unidade: ultimo.unidade,
                haQuanto,
            }));
        }
        return builder.getResponse();
    },
};
