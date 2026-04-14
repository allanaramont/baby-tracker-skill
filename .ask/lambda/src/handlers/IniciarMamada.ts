import { HandlerInput, RequestHandler } from 'ask-sdk-core';
import { EstadoSessao, Mamada, TipoMamada } from '../types';
import { gerarId, formatarLado, tempoDecorrido } from '../utils/tempo';
import { supportsAPL, criarTimerAmamentacaoAPL } from '../utils/apl';
import { clearPendingAction, getPendingAction, setPendingAction } from '../utils/sessionFlow';

function resolverLado(slots: any): TipoMamada | undefined {
  const slot = slots?.lado;
  if (!slot) return undefined;
  const resolved = slot.resolutions?.resolutionsPerAuthority?.[0]?.values?.[0]?.value?.id as TipoMamada | undefined;
  if (resolved) return resolved;
  const raw = (slot.value as string | undefined)?.toLowerCase();
  if (!raw) return undefined;
  if (raw.includes('esquer')) return 'esquerdo';
  if (raw.includes('direi')) return 'direito';
  if (raw.includes('dois') || raw.includes('ambos')) return 'ambos';
  return undefined;
}

async function salvarEResponder(
  handlerInput: HandlerInput,
  estado: EstadoSessao,
  nome: string,
  ladoFinal: TipoMamada
) {
  const mamada: Mamada = {
    id: gerarId(),
    tipo: 'mamada',
    iniciadaEm: Date.now(),
    emAndamento: true,
    lado: ladoFinal,
  };

  estado.mamadaAtual = mamada;
  if (!estado.ultimasMamadas) estado.ultimasMamadas = [];

  const attrManager = handlerInput.attributesManager;
  clearPendingAction(handlerInput);
  attrManager.setPersistentAttributes(estado);
  await attrManager.savePersistentAttributes();
  console.log('SALVO mamadaAtual:', JSON.stringify(estado.mamadaAtual));

  const speech = `Amamentação iniciada no ${formatarLado(ladoFinal)}. Diga finalizar amamentação quando terminar.`;
  const builder = handlerInput.responseBuilder
    .speak(speech)
    .reprompt('Diga finalizar amamentação quando terminar.')
    .withShouldEndSession(false);

  if (supportsAPL(handlerInput)) {
    const anterior = estado.ultimasMamadas?.[0];
    builder.addDirective(criarTimerAmamentacaoAPL({
      nome,
      lado: ladoFinal,
      iniciadaEm: mamada.iniciadaEm,
      elapsedInicialMs: 0,
      mamadaAnterior: anterior ? {
        duracaoMinutos: anterior.duracaoMinutos,
        lado: anterior.lado,
        finalizadaEm: anterior.finalizadaEm,
      } : undefined,
    }) as any);
  }

  return builder.getResponse();
}

export const IniciarMamadaHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'IniciarAmamentacao'
    );
  },
  async handle(handlerInput: HandlerInput) {
    const request = handlerInput.requestEnvelope.request as any;
    const ladoSlot = resolverLado(request.intent?.slots);
    console.log('IniciarAmamentacao ladoSlot:', ladoSlot);

    const attrManager = handlerInput.attributesManager;
    const estado = (await attrManager.getPersistentAttributes()) as EstadoSessao;
    const nome = estado.nomeBebe ?? 'o bebê';

    // Já tem amamentação em andamento
    if (estado.mamadaAtual?.emAndamento) {
      const decorrido = tempoDecorrido(estado.mamadaAtual.iniciadaEm);
      const ladoAtual = estado.mamadaAtual.lado ?? 'esquerdo';
      const speech = `${nome} já está mamando no ${formatarLado(ladoAtual)} há ${decorrido}. Diga finalizar amamentação quando terminar.`;

      const builder = handlerInput.responseBuilder
        .speak(speech)
        .reprompt('Diga finalizar amamentação quando terminar.')
        .withShouldEndSession(false);
      const aplSupported = supportsAPL(handlerInput);
      console.log('APL supported (já mamando):', aplSupported);
      if (aplSupported) {
        const anterior = estado.ultimasMamadas?.[0];
        const directive = criarTimerAmamentacaoAPL({
          nome,
          lado: ladoAtual as TipoMamada,
          iniciadaEm: estado.mamadaAtual.iniciadaEm,
          elapsedInicialMs: Math.max(0, Date.now() - estado.mamadaAtual.iniciadaEm),
          mamadaAnterior: anterior ? {
            duracaoMinutos: anterior.duracaoMinutos,
            lado: anterior.lado,
            finalizadaEm: anterior.finalizadaEm,
          } : undefined,
        });
        console.log('APL directive:', JSON.stringify(directive));
        builder.addDirective(directive as any);
      }
      return builder.getResponse();
    }

    // Lado informado pelo usuário
    if (ladoSlot) {
      return salvarEResponder(handlerInput, estado, nome, ladoSlot);
    }

    // Sempre perguntar o lado quando não for informado
    setPendingAction(handlerInput, 'mamada_lado');
    return handlerInput.responseBuilder
      .speak('Qual lado? Esquerdo ou direito?')
      .reprompt('Esquerdo ou direito?')
      .withShouldEndSession(false)
      .getResponse();
  },
};

export const InformarLadoHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    if (handlerInput.requestEnvelope.request.type !== 'IntentRequest') return false;
    const intentName = (handlerInput.requestEnvelope.request as any).intent?.name;
    if (intentName !== 'InformarLado') return false;
    return getPendingAction(handlerInput) === 'mamada_lado';
  },
  async handle(handlerInput: HandlerInput) {
    const request = handlerInput.requestEnvelope.request as any;
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
    const estado = (await attrManager.getPersistentAttributes()) as EstadoSessao;
    const nome = estado.nomeBebe ?? 'o bebê';

    return salvarEResponder(handlerInput, estado, nome, ladoSlot);
  },
};
