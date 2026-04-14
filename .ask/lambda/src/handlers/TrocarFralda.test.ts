import { TrocarFraldaHandler } from './TrocarFralda';
import { EstadoSessao } from '../types';

function criarMockHandlerInput(options: {
  slotId?: string;
  slotValue?: string;
  estadoInicial?: Partial<EstadoSessao>;
}) {
  const estado: EstadoSessao = {
    ultimasMamadas: [],
    ultimasFraldas: [],
    ultimosSonos: [],
    registrosPeso: [],
    ultimosRemedios: [],
    ...options.estadoInicial,
  };

  const setPersistentAttributes = jest.fn();
  const savePersistentAttributes = jest.fn().mockResolvedValue(undefined);
  const getPersistentAttributes = jest.fn().mockResolvedValue(estado);
  const getSessionAttributes = jest.fn().mockReturnValue({});
  const setSessionAttributes = jest.fn();

  const getResponse = jest.fn().mockReturnValue({ response: {} });
  const withShouldEndSession = jest.fn().mockReturnThis();
  const addElicitSlotDirective = jest.fn().mockReturnThis();
  const addDirective = jest.fn().mockReturnThis();
  const reprompt = jest.fn().mockReturnThis();
  const speak = jest.fn().mockReturnThis();

  const slots = options.slotId || options.slotValue
    ? {
        tipoBaixo: {
          value: options.slotValue,
          resolutions: options.slotId
            ? {
                resolutionsPerAuthority: [
                  { values: [{ value: { id: options.slotId, name: options.slotId } }] },
                ],
              }
            : undefined,
        },
      }
    : {};

  return {
    estado,
    setPersistentAttributes,
    savePersistentAttributes,
    handlerInput: {
      requestEnvelope: {
        request: {
          type: 'IntentRequest',
          intent: {
            name: 'TrocarFralda',
            slots,
          },
        },
      },
      attributesManager: {
        getPersistentAttributes,
        setPersistentAttributes,
        savePersistentAttributes,
        getSessionAttributes,
        setSessionAttributes,
      },
      responseBuilder: {
        speak,
        reprompt,
        addElicitSlotDirective,
        addDirective,
        withShouldEndSession,
        getResponse,
      },
    } as any,
    mocks: { speak, reprompt, addElicitSlotDirective, addDirective, withShouldEndSession, getResponse },
  };
}

describe('TrocarFraldaHandler', () => {
  describe('canHandle', () => {
    it('aceita intent TrocarFralda', () => {
      const { handlerInput } = criarMockHandlerInput({});
      expect(TrocarFraldaHandler.canHandle(handlerInput)).toBe(true);
    });

    it('rejeita outros intents', () => {
      const { handlerInput } = criarMockHandlerInput({});
      handlerInput.requestEnvelope.request.intent.name = 'OutroIntent';
      expect(TrocarFraldaHandler.canHandle(handlerInput)).toBe(false);
    });

    it('rejeita requests que não são IntentRequest', () => {
      const { handlerInput } = criarMockHandlerInput({});
      handlerInput.requestEnvelope.request.type = 'LaunchRequest';
      expect(TrocarFraldaHandler.canHandle(handlerInput)).toBe(false);
    });
  });

  describe('handle - sem slot tipoBaixo', () => {
    it('solicita o slot tipoBaixo quando ausente', async () => {
      const { handlerInput, mocks } = criarMockHandlerInput({ slotId: undefined });
      await TrocarFraldaHandler.handle(handlerInput);

      expect(mocks.speak).toHaveBeenCalledWith('Diga: xixi, cocô ou os dois.');
      expect(mocks.reprompt).toHaveBeenCalledWith('Xixi, cocô ou os dois?');
      expect(mocks.withShouldEndSession).toHaveBeenCalledWith(false);
    });
  });

  describe('handle - com slot xixi', () => {
    it('registra fralda de xixi e retorna mensagem correta', async () => {
      const { handlerInput, estado, setPersistentAttributes, mocks } =
        criarMockHandlerInput({ slotId: 'xixi' });

      await TrocarFraldaHandler.handle(handlerInput);

      expect(mocks.speak).toHaveBeenCalledWith(
        expect.stringContaining('só xixi')
      );
      expect(mocks.speak).toHaveBeenCalledWith(
        expect.stringContaining('Fralda com')
      );
    });

    it('salva os atributos persistentes', async () => {
      const { handlerInput, savePersistentAttributes, setPersistentAttributes } =
        criarMockHandlerInput({ slotId: 'xixi' });

      await TrocarFraldaHandler.handle(handlerInput);

      expect(setPersistentAttributes).toHaveBeenCalled();
      expect(savePersistentAttributes).toHaveBeenCalled();
    });

    it('adiciona fralda ao início da lista ultimasFraldas', async () => {
      const { handlerInput, setPersistentAttributes } = criarMockHandlerInput({
        slotId: 'xixi',
      });

      await TrocarFraldaHandler.handle(handlerInput);

      const estadoSalvo = setPersistentAttributes.mock.calls[0][0] as EstadoSessao;
      expect(estadoSalvo.ultimasFraldas).toHaveLength(1);
      expect(estadoSalvo.ultimasFraldas[0].tipoBaixo).toBe('xixi');
      expect(estadoSalvo.ultimasFraldas[0].tipo).toBe('fralda');
    });
  });

  describe('handle - com slot coco', () => {
    it('registra fralda de cocô e retorna mensagem correta', async () => {
      const { handlerInput, mocks } = criarMockHandlerInput({ slotId: 'coco' });

      await TrocarFraldaHandler.handle(handlerInput);

      expect(mocks.speak).toHaveBeenCalledWith(
        expect.stringContaining('cocô')
      );
    });

    it('aceita resposta em texto cru como "teve coco"', async () => {
      const { handlerInput, mocks } = criarMockHandlerInput({ slotValue: 'teve coco' });

      await TrocarFraldaHandler.handle(handlerInput);

      expect(mocks.speak).toHaveBeenCalledWith(
        expect.stringContaining('cocô')
      );
    });
  });

  describe('handle - com slot os_dois', () => {
    it('registra fralda com xixi e cocô e retorna mensagem correta', async () => {
      const { handlerInput, mocks } = criarMockHandlerInput({ slotId: 'os_dois' });

      await TrocarFraldaHandler.handle(handlerInput);

      expect(mocks.speak).toHaveBeenCalledWith(
        expect.stringContaining('xixi e cocô')
      );
    });

    it('aceita resposta em texto cru como "teve cocô também"', async () => {
      const { handlerInput, mocks } = criarMockHandlerInput({ slotValue: 'teve cocô também' });

      await TrocarFraldaHandler.handle(handlerInput);

      expect(mocks.speak).toHaveBeenCalledWith(
        expect.stringContaining('xixi e cocô')
      );
    });
  });

  describe('handle - limite de 30 registros', () => {
    it('mantém no máximo 30 fraldas na lista', async () => {
      const fraldasExistentes = Array.from({ length: 30 }, (_, i) => ({
        id: `fralda-${i}`,
        tipo: 'fralda' as const,
        registradaEm: Date.now() - i * 60000,
        tipoBaixo: 'xixi' as const,
      }));

      const { handlerInput, setPersistentAttributes } = criarMockHandlerInput({
        slotId: 'coco',
        estadoInicial: { ultimasFraldas: fraldasExistentes },
      });

      await TrocarFraldaHandler.handle(handlerInput);

      const estadoSalvo = setPersistentAttributes.mock.calls[0][0] as EstadoSessao;
      expect(estadoSalvo.ultimasFraldas).toHaveLength(30);
      expect(estadoSalvo.ultimasFraldas[0].tipoBaixo).toBe('coco');
    });
  });
});
