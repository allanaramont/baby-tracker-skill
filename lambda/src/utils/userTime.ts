import { HandlerInput } from 'ask-sdk-core';
import { EstadoSessao } from '../types';

export async function obterOuAtualizarTimeZoneUsuario(
  handlerInput: HandlerInput,
  estado: EstadoSessao
): Promise<string | undefined> {
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
