import { HandlerInput } from 'ask-sdk-core';

export type PendingAction =
  | 'mamada_lado'
  | 'fralda_tipo'
  | 'amamentacao_registro_atrasado_confirmacao'
  | 'amamentacao_registro_atrasado_inicio'
  | 'sono_registro_atrasado_confirmacao'
  | 'sono_registro_atrasado_inicio';

interface SessionFlowState {
  pendingAction?: PendingAction;
  pendingData?: Record<string, unknown>;
}

export function getPendingAction(handlerInput: HandlerInput): PendingAction | undefined {
  const session = handlerInput.attributesManager.getSessionAttributes() as SessionFlowState;
  return session.pendingAction;
}

export function getPendingData<T extends Record<string, unknown> = Record<string, unknown>>(handlerInput: HandlerInput): T | undefined {
  const session = handlerInput.attributesManager.getSessionAttributes() as SessionFlowState;
  return session.pendingData as T | undefined;
}

export function setPendingAction(
  handlerInput: HandlerInput,
  pendingAction: PendingAction,
  pendingData?: Record<string, unknown>
): void {
  const session = handlerInput.attributesManager.getSessionAttributes() as SessionFlowState;
  handlerInput.attributesManager.setSessionAttributes({
    ...session,
    pendingAction,
    pendingData,
  });
}

export function clearPendingAction(handlerInput: HandlerInput): void {
  const session = handlerInput.attributesManager.getSessionAttributes() as SessionFlowState;
  const { pendingAction: _pendingAction, pendingData: _pendingData, ...rest } = session;
  handlerInput.attributesManager.setSessionAttributes(rest);
}
