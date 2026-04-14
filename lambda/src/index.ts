import * as Alexa from 'ask-sdk-core';
import { AmazonPersistenceAdapter } from './persistence/AmazonAdapter';

import { LaunchRequestHandler, DefinirNomeBebeHandler, HelpIntentHandler, FallbackIntentHandler, CancelAndStopIntentHandler, SessionEndedRequestHandler, ErrorHandler } from './handlers/Default';
import { IniciarMamadaHandler, InformarLadoHandler } from './handlers/IniciarMamada';
import { FinalizarMamadaHandler, ConfirmarRegistroAmamentacaoAtrasadaHandler, CancelarRegistroAmamentacaoAtrasadaHandler, InformarInicioAmamentacaoAtrasadaHandler } from './handlers/FinalizarMamada';
import { UltimaMamadaHandler } from './handlers/UltimaMamada';
import { TrocarFraldaHandler, InformarTipoFraldaHandler } from './handlers/TrocarFralda';
import { UltimaFraldaHandler } from './handlers/UltimaFralda';
import { IniciarSonoHandler, FinalizarSonoHandler, ConfirmarRegistroSonoAtrasadoHandler, CancelarRegistroSonoAtrasadoHandler, InformarInicioSonoAtrasadoHandler } from './handlers/Sono';
import { RegistrarMamadeiraHandler, RegistrarMamadeiraAtrasadaHandler, InformarInicioMamadeiraAtrasadaHandler } from './handlers/RegistrarMamadeira';
import { RegistrarPesoHandler } from './handlers/RegistrarPeso';
import { ResumoDoDiaHandler } from './handlers/ResumoDoDia';
import { RegistrarRemedioHandler, UltimoRemedioHandler } from './handlers/Remedio';

const persistenceAdapter = new AmazonPersistenceAdapter(
  process.env.DYNAMODB_TABLE ?? 'baby-tracker-data'
);

export const handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    DefinirNomeBebeHandler,
    IniciarMamadaHandler,
    InformarLadoHandler,
    FinalizarMamadaHandler,
    ConfirmarRegistroAmamentacaoAtrasadaHandler,
    CancelarRegistroAmamentacaoAtrasadaHandler,
    InformarInicioAmamentacaoAtrasadaHandler,
    RegistrarMamadeiraHandler,
    RegistrarMamadeiraAtrasadaHandler,
    InformarInicioMamadeiraAtrasadaHandler,
    UltimaMamadaHandler,
    TrocarFraldaHandler,
    InformarTipoFraldaHandler,
    UltimaFraldaHandler,
    IniciarSonoHandler,
    FinalizarSonoHandler,
    ConfirmarRegistroSonoAtrasadoHandler,
    CancelarRegistroSonoAtrasadoHandler,
    InformarInicioSonoAtrasadoHandler,
    RegistrarPesoHandler,
    ResumoDoDiaHandler,
    RegistrarRemedioHandler,
    UltimoRemedioHandler,
    HelpIntentHandler,
    FallbackIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .withPersistenceAdapter(persistenceAdapter)
  .withApiClient(new Alexa.DefaultApiClient())
  .lambda();
