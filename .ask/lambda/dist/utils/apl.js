"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportsAPL = supportsAPL;
exports.criarResumoMamadaAPL = criarResumoMamadaAPL;
exports.criarTimerAmamentacaoAPL = criarTimerAmamentacaoAPL;
exports.criarTrocaFraldaAPL = criarTrocaFraldaAPL;
exports.criarUltimaFraldaAPL = criarUltimaFraldaAPL;
exports.criarUltimaMamadaAPL = criarUltimaMamadaAPL;
exports.criarSonoIniciadoAPL = criarSonoIniciadoAPL;
exports.criarSonoFinalizadoAPL = criarSonoFinalizadoAPL;
exports.criarPesoAPL = criarPesoAPL;
exports.criarResumoDoDiaAPL = criarResumoDoDiaAPL;
exports.criarRemedioAPL = criarRemedioAPL;
exports.criarUltimoRemedioAPL = criarUltimoRemedioAPL;
exports.criarHomeDashboardAPL = criarHomeDashboardAPL;
const tempo_1 = require("./tempo");
// ─── Cores do Design System ─────────────────────────────────────────────────
const C = {
    bg: '#0f0a1a',
    surface: '#1e1330',
    border: '#3d2660',
    mamada: '#ff9ecf',
    fralda: '#ffd166',
    sono: '#a0c4ff',
    peso: '#7de8a0',
    remedio: '#ffb347',
    textPrimary: '#fff7f2',
    textSecondary: '#d6c2e6',
    textMuted: '#9e88b8',
    accent: '#c084fc',
};
// ─── Helpers internos ────────────────────────────────────────────────────────
function txt(text, color, fontSize, bold, extra) {
    return {
        type: 'Text',
        text,
        color,
        fontSize,
        fontWeight: bold ? 'bold' : 'normal',
        textAlign: 'center',
        width: '100%',
        ...(extra ?? {}),
    };
}
function divider() {
    return {
        type: 'Frame',
        width: '80%',
        height: '1dp',
        backgroundColor: C.border,
        alignSelf: 'center',
        paddingBottom: '0dp',
    };
}
function header(title, subtitle) {
    const items = [
        txt(title, C.accent, '18dp', true),
    ];
    if (subtitle) {
        items.push(txt(subtitle, C.textMuted, '14dp'));
    }
    return {
        type: 'Container',
        direction: 'column',
        alignItems: 'center',
        paddingBottom: '16dp',
        items,
    };
}
function card(items, color) {
    return {
        type: 'Frame',
        borderRadius: '12dp',
        borderWidth: '2dp',
        borderColor: color,
        backgroundColor: C.surface,
        padding: '20dp',
        width: '100%',
        items: [
            {
                type: 'Container',
                direction: 'column',
                alignItems: 'center',
                width: '100%',
                items,
            },
        ],
    };
}
function statBox(icon, value, sublabel, color) {
    return {
        type: 'Container',
        direction: 'column',
        alignItems: 'center',
        backgroundColor: C.surface,
        borderRadius: '12dp',
        padding: '16dp',
        grow: 1,
        items: [
            txt(icon, color, '28dp'),
            txt(value, color, '22dp', true, { paddingTop: '4dp' }),
            txt(sublabel, C.textMuted, '12dp', false, { paddingTop: '4dp' }),
        ],
    };
}
function aplDoc(items, datasources, token) {
    return {
        type: 'Alexa.Presentation.APL.RenderDocument',
        token,
        document: {
            type: 'APL',
            version: '1.9',
            theme: 'dark',
            mainTemplate: {
                parameters: ['payload'],
                items: [
                    {
                        type: 'Container',
                        direction: 'column',
                        alignItems: 'center',
                        width: '100%',
                        height: '100%',
                        backgroundColor: C.bg,
                        padding: '32dp',
                        items,
                    },
                ],
            },
        },
        datasources,
    };
}
// ─── supportsAPL ─────────────────────────────────────────────────────────────
function supportsAPL(handlerInput) {
    const interfaces = handlerInput.requestEnvelope.context?.System?.device?.supportedInterfaces;
    return !!(interfaces && interfaces['Alexa.Presentation.APL']);
}
// ─── Telas individuais ───────────────────────────────────────────────────────
function criarResumoMamadaAPL(dados) {
    const duracaoTexto = (0, tempo_1.formatarDuracaoCronometro)(dados.duracaoSegundos ?? Math.max(0, dados.duracaoMinutos * 60));
    const ladoTexto = (0, tempo_1.formatarLado)(dados.lado);
    const horaTexto = dados.horaRegistradaTexto ?? '';
    const items = [
        header(`Diário de ${dados.nome}`, 'Amamentação Finalizada'),
        card([
            txt(duracaoTexto, C.fralda, '72dp', true, { paddingBottom: '8dp' }),
            txt(ladoTexto, C.mamada, '26dp', false, { paddingBottom: '16dp' }),
            divider(),
            txt(`Registrado às ${horaTexto}`, C.textSecondary, '16dp', false, { paddingTop: '16dp' }),
            txt('Tudo registrado ✓', C.textMuted, '14dp', false, { paddingTop: '8dp' }),
        ], C.mamada),
    ];
    return aplDoc(items, { payload: {} }, 'resumoMamada');
}
function criarTimerAmamentacaoAPL(dados) {
    const ladoTexto = (0, tempo_1.formatarLado)(dados.lado);
    const elapsedMs = dados.elapsedInicialMs ?? 0;
    let anteriorHaQuanto = '';
    let anteriorLado = '';
    let anteriorDuracao = '';
    if (dados.mamadaAnterior) {
        const { duracaoMinutos, lado, finalizadaEm } = dados.mamadaAnterior;
        if (finalizadaEm)
            anteriorHaQuanto = `Terminou há ${(0, tempo_1.tempoDecorrido)(finalizadaEm)}`;
        if (lado)
            anteriorLado = `Lado: ${(0, tempo_1.formatarLado)(lado)}`;
        if (duracaoMinutos != null)
            anteriorDuracao = `Duração: ${(0, tempo_1.formatarTempo)(duracaoMinutos)}`;
    }
    const liveTimer = {
        type: 'Text',
        bind: [
            { name: 'totalMs', value: `\${${elapsedMs} + (environment.elapsedTime || 0)}` },
            { name: 'm', value: '${Math.floor(totalMs / 60000)}' },
            { name: 's', value: '${Math.floor((totalMs % 60000) / 1000)}' },
        ],
        text: "${(m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s}",
        fontSize: '80dp',
        color: C.fralda,
        textAlign: 'center',
        width: '100%',
        fontWeight: 'bold',
        paddingBottom: '4dp',
    };
    const mainCardItems = [
        txt(ladoTexto, C.mamada, '26dp', true, { paddingBottom: '12dp' }),
        liveTimer,
        txt('tempo em andamento', C.textMuted, '14dp', false, { paddingBottom: '16dp' }),
        txt('Diga "finalizar amamentação" quando terminar', C.textSecondary, '14dp'),
    ];
    const items = [
        header(`Diário de ${dados.nome}`, 'Amamentação em andamento'),
        card(mainCardItems, C.mamada),
    ];
    if (anteriorHaQuanto || anteriorLado || anteriorDuracao) {
        items.push({ type: 'Container', height: '16dp', items: [] }, card([
            txt('Última amamentação', C.textMuted, '14dp', false, { paddingBottom: '8dp' }),
            ...(anteriorHaQuanto ? [txt(anteriorHaQuanto, C.textSecondary, '16dp')] : []),
            ...(anteriorLado ? [txt(anteriorLado, C.textSecondary, '14dp')] : []),
            ...(anteriorDuracao ? [txt(anteriorDuracao, C.textSecondary, '14dp')] : []),
        ], C.border));
    }
    return aplDoc(items, { payload: {} }, 'timerMamada');
}
function criarTrocaFraldaAPL(dados) {
    const tipoFormatado = dados.tipoBaixo === 'xixi' ? 'Xixi' :
        dados.tipoBaixo === 'coco' ? 'Cocô' :
            'Xixi + Cocô';
    const cardItems = [
        txt(tipoFormatado, C.fralda, '48dp', true, { paddingBottom: '8dp' }),
        txt(`Registrada às ${dados.hora}`, C.textSecondary, '16dp', false, { paddingBottom: '12dp' }),
        divider(),
        txt(`${dados.totalHoje} troca${dados.totalHoje !== 1 ? 's' : ''} hoje`, C.textMuted, '14dp', false, { paddingTop: '12dp' }),
    ];
    if (dados.ultimaFralda) {
        cardItems.push(txt(`Anterior: ${dados.ultimaFralda.tipo} — há ${dados.ultimaFralda.haQuanto}`, C.textMuted, '13dp', false, { paddingTop: '6dp' }));
    }
    const items = [
        header('Troca de Fralda', 'Registrada com sucesso ✓'),
        card(cardItems, C.fralda),
    ];
    return aplDoc(items, { payload: {} }, 'trocaFralda');
}
function criarUltimaFraldaAPL(dados) {
    const tipoFormatado = dados.tipo.includes('xixi') && dados.tipo.includes('cocô') ? 'Xixi + Cocô' :
        dados.tipo.includes('cocô') ? 'Cocô' : 'Xixi';
    const items = [
        header('Última Fralda'),
        card([
            txt(tipoFormatado, C.fralda, '48dp', true, { paddingBottom: '8dp' }),
            txt(`há ${dados.haQuanto}`, C.textSecondary, '18dp', false, { paddingBottom: '16dp' }),
            divider(),
            {
                type: 'Container',
                direction: 'row',
                justifyContent: 'spaceAround',
                width: '100%',
                paddingTop: '16dp',
                items: [
                    statBox('🚿', String(dados.totalHoje), 'hoje', C.fralda),
                    { type: 'Container', width: '8dp', items: [] },
                    statBox('💛', String(dados.xixis), 'xixis', C.sono),
                    { type: 'Container', width: '8dp', items: [] },
                    statBox('💩', String(dados.cocos), 'cocôs', C.remedio),
                ],
            },
        ], C.fralda),
    ];
    return aplDoc(items, { payload: {} }, 'ultimaFralda');
}
function criarUltimaMamadaAPL(dados) {
    const titulo = dados.emAndamento ? 'Amamentação em andamento' : 'Última Amamentação';
    const corTitulo = dados.emAndamento ? C.mamada : C.textSecondary;
    const cardItems = [
        txt(dados.emAndamento ? '🍼 Em andamento' : '🍼 Última amamentação', C.mamada, '20dp', true, { paddingBottom: '8dp' }),
        txt(`há ${dados.haQuanto}`, corTitulo, '36dp', true, { paddingBottom: '8dp' }),
        ...(dados.lado ? [txt(dados.lado, C.textSecondary, '18dp', false, { paddingBottom: '6dp' })] : []),
        ...(dados.duracao ? [txt(`Durou ${dados.duracao}`, C.textMuted, '16dp')] : []),
    ];
    const items = [
        header(`Diário de ${dados.nome}`, titulo),
        card(cardItems, C.mamada),
    ];
    return aplDoc(items, { payload: {} }, 'ultimaMamada');
}
function criarSonoIniciadoAPL(dados) {
    const elapsedMs = dados.elapsedInicialMs;
    const liveTimer = {
        type: 'Text',
        bind: [
            { name: 'totalMs', value: `\${${elapsedMs} + (environment.elapsedTime || 0)}` },
            { name: 'h', value: '${Math.floor(totalMs / 3600000)}' },
            { name: 'm', value: '${Math.floor((totalMs % 3600000) / 60000)}' },
        ],
        text: "${h > 0 ? h + 'h ' + (m < 10 ? '0' : '') + m + 'min' : (m < 10 ? '0' : '') + m + 'min'}",
        fontSize: '72dp',
        color: C.sono,
        textAlign: 'center',
        width: '100%',
        fontWeight: 'bold',
        paddingBottom: '4dp',
    };
    const items = [
        header(`Diário de ${dados.nome}`, 'Dormindo agora 😴'),
        card([
            txt('🌙', C.sono, '48dp', false, { paddingBottom: '8dp' }),
            liveTimer,
            txt('dormindo', C.textMuted, '14dp', false, { paddingBottom: '16dp' }),
            txt('Diga "bebê acordou" quando despertar', C.textSecondary, '14dp'),
        ], C.sono),
    ];
    return aplDoc(items, { payload: {} }, 'sonoIniciado');
}
function criarSonoFinalizadoAPL(dados) {
    const items = [
        header(`Diário de ${dados.nome}`, 'Sono finalizado'),
        card([
            txt('☀️', C.fralda, '48dp', false, { paddingBottom: '8dp' }),
            txt(dados.duracao, C.sono, '56dp', true, { paddingBottom: '8dp' }),
            txt('de sono registrado', C.textMuted, '16dp', false, { paddingBottom: '12dp' }),
            divider(),
            txt(`Acordou às ${dados.hora}`, C.textSecondary, '16dp', false, { paddingTop: '12dp' }),
        ], C.sono),
    ];
    return aplDoc(items, { payload: {} }, 'sonoFinalizado');
}
function criarPesoAPL(dados) {
    const seta = dados.tendencia === 'subiu' ? '↑' :
        dados.tendencia === 'caiu' ? '↓' :
            dados.tendencia === 'igual' ? '=' : '';
    const corSeta = dados.tendencia === 'subiu' ? C.peso :
        dados.tendencia === 'caiu' ? C.remedio :
            C.textMuted;
    const cardItems = [
        txt('⚖️', C.peso, '40dp', false, { paddingBottom: '8dp' }),
        txt(dados.pesoFormatado, C.peso, '56dp', true, { paddingBottom: '8dp' }),
        ...(dados.diferenca && seta ? [
            txt(`${seta} ${dados.diferenca}`, corSeta, '20dp', true, { paddingBottom: '8dp' }),
        ] : []),
        divider(),
        txt('Peso registrado ✓', C.textMuted, '14dp', false, { paddingTop: '12dp' }),
    ];
    const items = [
        header(`Diário de ${dados.nome}`, 'Peso registrado'),
        card(cardItems, C.peso),
    ];
    return aplDoc(items, { payload: {} }, 'registrarPeso');
}
function criarResumoDoDiaAPL(dados) {
    const totalMamadaStr = dados.totalMamadaMin > 0 ? (0, tempo_1.formatarTempo)(dados.totalMamadaMin) : `${dados.mamadas}×`;
    const totalSonoStr = dados.totalSonoMin > 0 ? (0, tempo_1.formatarTempo)(dados.totalSonoMin) : `${dados.sonos}×`;
    const statRow = {
        type: 'Container',
        direction: 'row',
        justifyContent: 'spaceAround',
        width: '100%',
        paddingTop: '8dp',
        paddingBottom: '8dp',
        items: [
            statBox('🍼', String(dados.mamadas), totalMamadaStr, C.mamada),
            { type: 'Container', width: '8dp', items: [] },
            statBox('🚿', String(dados.fraldas), `${dados.xixis}x/${dados.cocos}c`, C.fralda),
            { type: 'Container', width: '8dp', items: [] },
            statBox('🌙', String(dados.sonos), totalSonoStr, C.sono),
        ],
    };
    const emAndamentoItems = [];
    if (dados.mamadaEmAndamento) {
        emAndamentoItems.push(txt('🍼 Amamentação em andamento', C.mamada, '14dp'));
    }
    if (dados.sonoEmAndamento) {
        emAndamentoItems.push(txt('🌙 Dormindo agora', C.sono, '14dp'));
    }
    const items = [
        header(`Resumo de ${dados.nome}`, 'Hoje'),
        card([
            statRow,
            ...(emAndamentoItems.length > 0 ? [
                divider(),
                { type: 'Container', paddingTop: '12dp', alignItems: 'center', items: emAndamentoItems },
            ] : []),
        ], C.accent),
    ];
    return aplDoc(items, { payload: {} }, 'resumoDoDia');
}
function criarRemedioAPL(dados) {
    const items = [
        header('Remédio', 'Administrado e registrado ✓'),
        card([
            txt('💊', C.remedio, '48dp', false, { paddingBottom: '12dp' }),
            txt(dados.nome, C.textPrimary, '28dp', true, { paddingBottom: '8dp' }),
            txt(`${dados.dose} ${dados.unidade}`, C.remedio, '24dp', true, { paddingBottom: '12dp' }),
            divider(),
            txt(`Administrado às ${dados.hora}`, C.textSecondary, '16dp', false, { paddingTop: '12dp' }),
        ], C.remedio),
    ];
    return aplDoc(items, { payload: {} }, 'registrarRemedio');
}
function criarUltimoRemedioAPL(dados) {
    const items = [
        header('Último Remédio'),
        card([
            txt('💊', C.remedio, '48dp', false, { paddingBottom: '12dp' }),
            txt(dados.nome, C.textPrimary, '28dp', true, { paddingBottom: '8dp' }),
            txt(`${dados.dose} ${dados.unidade}`, C.remedio, '24dp', true, { paddingBottom: '12dp' }),
            divider(),
            txt(`há ${dados.haQuanto}`, C.textSecondary, '18dp', false, { paddingTop: '12dp' }),
        ], C.remedio),
    ];
    return aplDoc(items, { payload: {} }, 'ultimoRemedio');
}
function criarHomeDashboardAPL(dados) {
    // Amamentação: valor principal = duração, sublabel = quando foi
    const mamadaValor = dados.mamadaEmAndamento
        ? 'agora'
        : dados.ultimaMamadaDuracao ?? '—';
    const mamadaSub = dados.mamadaEmAndamento
        ? 'em andamento'
        : dados.ultimaMamadaHaQuanto
            ? `há ${dados.ultimaMamadaHaQuanto}`
            : 'leite';
    // Fralda: valor = tipo, sublabel = quando foi
    const fraldaValor = dados.ultimaFraldaTipo ?? '—';
    const fraldaSub = dados.ultimaFraldaHaQuanto
        ? `há ${dados.ultimaFraldaHaQuanto}`
        : 'fralda';
    // Sono: valor = tempo dormindo, sublabel = "dormindo" ou "último sono"
    const sonoValor = dados.sonoEmAndamento
        ? (dados.sonoHaQuanto ?? 'agora')
        : dados.sonoHaQuanto
            ? `há ${dados.sonoHaQuanto}`
            : '—';
    const sonoSub = dados.sonoEmAndamento ? 'dormindo 😴' : 'último sono';
    const row1 = {
        type: 'Container',
        direction: 'row',
        justifyContent: 'spaceAround',
        width: '100%',
        paddingBottom: '12dp',
        items: [
            statBox('🍼', mamadaValor, mamadaSub, dados.mamadaEmAndamento ? C.mamada : C.textSecondary),
            { type: 'Container', width: '12dp', items: [] },
            statBox('🚿', fraldaValor, fraldaSub, C.fralda),
        ],
    };
    const row2 = {
        type: 'Container',
        direction: 'row',
        justifyContent: 'center',
        width: '100%',
        items: [
            statBox('🌙', sonoValor, sonoSub, dados.sonoEmAndamento ? C.sono : C.textSecondary),
        ],
    };
    const items = [
        header(`Diário de ${dados.nome}`, 'O que deseja registrar?'),
        row1,
        row2,
        { type: 'Container', height: '12dp', items: [] },
        txt('iniciar leite  ·  trocar fralda  ·  bebê dormiu  ·  registrar peso  ·  resumo de hoje', C.textMuted, '12dp'),
    ];
    return aplDoc(items, { payload: {} }, 'homeDashboard');
}
