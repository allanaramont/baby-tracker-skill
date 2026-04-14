"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatarTempo = formatarTempo;
exports.tempoDecorrido = tempoDecorrido;
exports.calcularDuracaoMinutos = calcularDuracaoMinutos;
exports.calcularDuracaoSegundos = calcularDuracaoSegundos;
exports.gerarId = gerarId;
exports.formatarHora = formatarHora;
exports.formatarHoraNoFuso = formatarHoraNoFuso;
exports.obterChaveDataNoFuso = obterChaveDataNoFuso;
exports.formatarDuracaoCronometro = formatarDuracaoCronometro;
exports.ladoOposto = ladoOposto;
exports.formatarLado = formatarLado;
exports.formatarFralda = formatarFralda;
function formatarTempo(minutos) {
    if (minutos < 1)
        return 'menos de 1 minuto';
    if (minutos === 1)
        return '1 minuto';
    if (minutos < 60)
        return `${minutos} minutos`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    const parteHoras = horas === 1 ? '1 hora' : `${horas} horas`;
    if (mins === 0)
        return parteHoras;
    const parteMins = mins === 1 ? '1 minuto' : `${mins} minutos`;
    return `${parteHoras} e ${parteMins}`;
}
function tempoDecorrido(timestampMs) {
    const agora = Date.now();
    const diffMs = agora - timestampMs;
    const minutos = Math.floor(diffMs / 60000);
    return formatarTempo(minutos);
}
function calcularDuracaoMinutos(inicioMs, fimMs) {
    return Math.round((fimMs - inicioMs) / 60000);
}
function calcularDuracaoSegundos(inicioMs, fimMs) {
    return Math.max(0, Math.round((fimMs - inicioMs) / 1000));
}
function gerarId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
function formatarHora(timestampMs) {
    const data = new Date(timestampMs);
    const horas = data.getHours().toString().padStart(2, '0');
    const minutos = data.getMinutes().toString().padStart(2, '0');
    return `${horas}h${minutos}`;
}
function formatarHoraNoFuso(timestampMs, timeZone) {
    const partes = new Intl.DateTimeFormat('pt-BR', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).formatToParts(new Date(timestampMs));
    const horas = partes.find((parte) => parte.type === 'hour')?.value ?? '00';
    const minutos = partes.find((parte) => parte.type === 'minute')?.value ?? '00';
    return `${horas}h${minutos}`;
}
function obterChaveDataNoFuso(timestampMs, timeZone) {
    const partes = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(new Date(timestampMs));
    const ano = partes.find((parte) => parte.type === 'year')?.value ?? '0000';
    const mes = partes.find((parte) => parte.type === 'month')?.value ?? '00';
    const dia = partes.find((parte) => parte.type === 'day')?.value ?? '00';
    return `${ano}-${mes}-${dia}`;
}
function formatarDuracaoCronometro(totalSegundos) {
    const minutos = Math.floor(totalSegundos / 60);
    const segundos = totalSegundos % 60;
    return `${minutos}:${segundos.toString().padStart(2, '0')}`;
}
function ladoOposto(lado) {
    if (lado === 'esquerdo')
        return 'direito';
    if (lado === 'direito')
        return 'esquerdo';
    return 'esquerdo';
}
function formatarLado(lado) {
    const mapa = {
        esquerdo: 'peito esquerdo',
        direito: 'peito direito',
        ambos: 'ambos os peitos',
    };
    return mapa[lado] ?? lado;
}
function formatarFralda(tipo) {
    const mapa = {
        xixi: 'só xixi',
        coco: 'cocô',
        os_dois: 'xixi e cocô',
    };
    return mapa[tipo] ?? tipo;
}
