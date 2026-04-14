"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumoDoDiaHandler = void 0;
const tempo_1 = require("../utils/tempo");
const userTime_1 = require("../utils/userTime");
const apl_1 = require("../utils/apl");
exports.ResumoDoDiaHandler = {
    canHandle(handlerInput) {
        return (handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'ResumoDoDia');
    },
    async handle(handlerInput) {
        const attrManager = handlerInput.attributesManager;
        const estado = (await attrManager.getPersistentAttributes());
        const nome = estado.nomeBebe ?? 'o bebê';
        const timeZoneUsuario = await (0, userTime_1.obterOuAtualizarTimeZoneUsuario)(handlerInput, estado);
        const chaveHoje = (0, tempo_1.obterChaveDataNoFuso)(Date.now(), timeZoneUsuario);
        const mamadas = (estado.ultimasMamadas ?? []).filter((m) => (0, tempo_1.obterChaveDataNoFuso)(m.finalizadaEm ?? m.iniciadaEm, timeZoneUsuario) === chaveHoje);
        const fraldas = (estado.ultimasFraldas ?? []).filter((f) => (0, tempo_1.obterChaveDataNoFuso)(f.registradaEm, timeZoneUsuario) === chaveHoje);
        const sonos = (estado.ultimosSonos ?? []).filter((s) => (0, tempo_1.obterChaveDataNoFuso)(s.finalizadoEm ?? s.iniciadoEm, timeZoneUsuario) === chaveHoje);
        const partes = [];
        if (mamadas.length > 0) {
            const totalMinutos = mamadas.reduce((acc, m) => acc + (m.duracaoMinutos ?? 0), 0);
            const ultimaMamada = mamadas[0];
            const haQuanto = (0, tempo_1.tempoDecorrido)(ultimaMamada.finalizadaEm ?? ultimaMamada.iniciadaEm);
            const totalStr = totalMinutos > 0 ? `, total de ${(0, tempo_1.formatarTempo)(totalMinutos)}` : '';
            partes.push(`${mamadas.length} amamentação${mamadas.length > 1 ? 'ões' : ''}${totalStr}, última há ${haQuanto}`);
        }
        else {
            partes.push('nenhuma amamentação registrada hoje');
        }
        if (fraldas.length > 0) {
            const cocos = fraldas.filter((f) => f.tipoBaixo === 'coco' || f.tipoBaixo === 'os_dois').length;
            const xixis = fraldas.length - cocos;
            const detalhe = cocos > 0 ? ` (${xixis} xixi, ${cocos} cocô)` : '';
            partes.push(`${fraldas.length} troca${fraldas.length > 1 ? 's' : ''} de fralda${detalhe}`);
        }
        else {
            partes.push('nenhuma troca de fralda hoje');
        }
        if (sonos.length > 0) {
            const totalSonoMin = sonos.reduce((acc, s) => acc + (s.duracaoMinutos ?? 0), 0);
            const totalSonoStr = totalSonoMin > 0 ? `, total de ${(0, tempo_1.formatarTempo)(totalSonoMin)}` : '';
            partes.push(`${sonos.length} período${sonos.length > 1 ? 's' : ''} de sono${totalSonoStr}`);
        }
        const emAndamento = [];
        if (estado.mamadaAtual?.emAndamento) {
            emAndamento.push(`amamentação em andamento há ${(0, tempo_1.tempoDecorrido)(estado.mamadaAtual.iniciadaEm)}`);
        }
        if (estado.sonoAtual?.emAndamento) {
            emAndamento.push(`${nome} dormindo há ${(0, tempo_1.tempoDecorrido)(estado.sonoAtual.iniciadoEm)}`);
        }
        const emAndamentoStr = emAndamento.length > 0 ? ` Agora: ${emAndamento.join(' e ')}.` : '';
        const speech = `Resumo de hoje de ${nome}: ${partes.join('. ')}.${emAndamentoStr}`;
        const cocos = fraldas.filter((f) => f.tipoBaixo === 'coco' || f.tipoBaixo === 'os_dois').length;
        const xixis = fraldas.length - cocos;
        const totalMamadaMin = mamadas.reduce((acc, m) => acc + (m.duracaoMinutos ?? 0), 0);
        const totalSonoMin = sonos.reduce((acc, s) => acc + (s.duracaoMinutos ?? 0), 0);
        const builder = handlerInput.responseBuilder
            .speak(speech)
            .reprompt('O que deseja registrar?')
            .withShouldEndSession(false);
        if ((0, apl_1.supportsAPL)(handlerInput)) {
            builder.addDirective((0, apl_1.criarResumoDoDiaAPL)({
                nome,
                mamadas: mamadas.length,
                totalMamadaMin,
                fraldas: fraldas.length,
                cocos,
                xixis,
                sonos: sonos.length,
                totalSonoMin,
                mamadaEmAndamento: estado.mamadaAtual?.emAndamento ?? false,
                sonoEmAndamento: estado.sonoAtual?.emAndamento ?? false,
            }));
        }
        return builder.getResponse();
    },
};
