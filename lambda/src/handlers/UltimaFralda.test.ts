import { UltimaFraldaHandler } from './UltimaFralda';
import { EstadoSessao, Fralda } from '../types';

function criarMockHandlerInput(estadoInicial: Partial<EstadoSessao>) {
  const estado: EstadoSessao = {
    ultimasMamadas: [],
    ultimasFraldas: [],
    ultimosSonos: [],
    registrosPeso: [],
    ultimosRemedios: [],
    ...estadoInicial,
  };

  const getResponse = jest.fn().mockReturnValue({ response: {} });
  const speak = jest.fn().mockReturnThis();
  const reprompt = jest.fn().mockReturnThis();
  const withShouldEndSession = jest.fn().mockReturnThis();
  const addDirective = jest.fn().mockReturnThis();

  return {
    handlerInput: {
      requestEnvelope: {
        request: {
          type: 'IntentRequest',
          intent: { name: 'UltimaFralda' },
        },
      },
      attributesManager: {
        getPersistentAttributes: jest.fn().mockResolvedValue(estado),
        setPersistentAttributes: jest.fn(),
        savePersistentAttributes: jest.fn().mockResolvedValue(undefined),
      },
      responseBuilder: {
        speak,
        reprompt,
        withShouldEndSession,
        addDirective,
        getResponse,
      },
    } as any,
    mocks: { speak, reprompt, withShouldEndSession, addDirective, getResponse },
  };
}

describe('UltimaFraldaHandler', () => {
  describe('canHandle', () => {
    it('aceita intent UltimaFralda', () => {
      const { handlerInput } = criarMockHandlerInput({});
      expect(UltimaFraldaHandler.canHandle(handlerInput)).toBe(true);
    });

    it('rejeita outros intents', () => {
      const { handlerInput } = criarMockHandlerInput({});
      handlerInput.requestEnvelope.request.intent.name = 'TrocarFralda';
      expect(UltimaFraldaHandler.canHandle(handlerInput)).toBe(false);
    });
  });

  describe('handle - sem histórico', () => {
    it('informa que não há fraldas registradas', async () => {
      const { handlerInput, mocks } = criarMockHandlerInput({ ultimasFraldas: [] });

      await UltimaFraldaHandler.handle(handlerInput);

      expect(mocks.speak).toHaveBeenCalledWith(
        'Nenhuma troca de fralda registrada ainda.'
      );
    });

    it('funciona quando ultimasFraldas é undefined', async () => {
      const { handlerInput, mocks } = criarMockHandlerInput({
        ultimasFraldas: undefined as any,
      });

      await UltimaFraldaHandler.handle(handlerInput);

      expect(mocks.speak).toHaveBeenCalledWith(
        'Nenhuma troca de fralda registrada ainda.'
      );
    });
  });

  describe('handle - com histórico', () => {
    it('retorna tempo decorrido e tipo da última fralda (xixi)', async () => {
      const agora = Date.now();
      const fralda: Fralda = {
        id: 'fralda-1',
        tipo: 'fralda',
        registradaEm: agora - 10 * 60 * 1000, // 10 minutos atrás
        tipoBaixo: 'xixi',
      };

      const { handlerInput, mocks } = criarMockHandlerInput({
        ultimasFraldas: [fralda],
      });

      await UltimaFraldaHandler.handle(handlerInput);

      expect(mocks.speak).toHaveBeenCalledWith(
        expect.stringContaining('10 minutos')
      );
      expect(mocks.speak).toHaveBeenCalledWith(
        expect.stringContaining('só xixi')
      );
    });

    it('retorna tipo cocô corretamente', async () => {
      const fralda: Fralda = {
        id: 'fralda-1',
        tipo: 'fralda',
        registradaEm: Date.now() - 60 * 60 * 1000, // 1 hora atrás
        tipoBaixo: 'coco',
      };

      const { handlerInput, mocks } = criarMockHandlerInput({
        ultimasFraldas: [fralda],
      });

      await UltimaFraldaHandler.handle(handlerInput);

      expect(mocks.speak).toHaveBeenCalledWith(
        expect.stringContaining('cocô')
      );
      expect(mocks.speak).toHaveBeenCalledWith(
        expect.stringContaining('1 hora')
      );
    });

    it('retorna o primeiro item (mais recente) da lista', async () => {
      const agora = Date.now();
      const fraldas: Fralda[] = [
        {
          id: 'fralda-recente',
          tipo: 'fralda',
          registradaEm: agora - 5 * 60 * 1000,
          tipoBaixo: 'os_dois',
        },
        {
          id: 'fralda-antiga',
          tipo: 'fralda',
          registradaEm: agora - 120 * 60 * 1000,
          tipoBaixo: 'xixi',
        },
      ];

      const { handlerInput, mocks } = criarMockHandlerInput({
        ultimasFraldas: fraldas,
      });

      await UltimaFraldaHandler.handle(handlerInput);

      expect(mocks.speak).toHaveBeenCalledWith(
        expect.stringContaining('xixi e cocô')
      );
      expect(mocks.speak).toHaveBeenCalledWith(
        expect.stringContaining('5 minutos')
      );
    });
  });
});
