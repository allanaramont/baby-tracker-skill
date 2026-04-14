"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPendingAction = getPendingAction;
exports.getPendingData = getPendingData;
exports.setPendingAction = setPendingAction;
exports.clearPendingAction = clearPendingAction;
function getPendingAction(handlerInput) {
    const session = handlerInput.attributesManager.getSessionAttributes();
    return session.pendingAction;
}
function getPendingData(handlerInput) {
    const session = handlerInput.attributesManager.getSessionAttributes();
    return session.pendingData;
}
function setPendingAction(handlerInput, pendingAction, pendingData) {
    const session = handlerInput.attributesManager.getSessionAttributes();
    handlerInput.attributesManager.setSessionAttributes({
        ...session,
        pendingAction,
        pendingData,
    });
}
function clearPendingAction(handlerInput) {
    const session = handlerInput.attributesManager.getSessionAttributes();
    const { pendingAction: _pendingAction, pendingData: _pendingData, ...rest } = session;
    handlerInput.attributesManager.setSessionAttributes(rest);
}
