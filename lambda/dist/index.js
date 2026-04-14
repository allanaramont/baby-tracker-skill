"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const Alexa = __importStar(require("ask-sdk-core"));
const ask_sdk_dynamodb_persistence_adapter_1 = require("ask-sdk-dynamodb-persistence-adapter");
const auth_1 = require("./utils/auth");
const Default_1 = require("./handlers/Default");
const IniciarMamada_1 = require("./handlers/IniciarMamada");
const FinalizarMamada_1 = require("./handlers/FinalizarMamada");
const UltimaMamada_1 = require("./handlers/UltimaMamada");
const TrocarFralda_1 = require("./handlers/TrocarFralda");
const UltimaFralda_1 = require("./handlers/UltimaFralda");
const Sono_1 = require("./handlers/Sono");
const RegistrarMamadeira_1 = require("./handlers/RegistrarMamadeira");
const RegistrarPeso_1 = require("./handlers/RegistrarPeso");
const ResumoDoDia_1 = require("./handlers/ResumoDoDia");
const Remedio_1 = require("./handlers/Remedio");
const persistenceAdapter = new ask_sdk_dynamodb_persistence_adapter_1.DynamoDbPersistenceAdapter({
    tableName: process.env.DYNAMODB_TABLE ?? 'baby-tracker-data',
    createTable: true,
    // Usa Cognito sub quando o usuario vinculou a conta, senao usa Alexa userId
    partitionKeyGenerator: (requestEnvelope) => (0, auth_1.extrairUserId)(requestEnvelope),
});
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(Default_1.LaunchRequestHandler, Default_1.DefinirNomeBebeHandler, IniciarMamada_1.IniciarMamadaHandler, IniciarMamada_1.InformarLadoHandler, FinalizarMamada_1.FinalizarMamadaHandler, FinalizarMamada_1.ConfirmarRegistroAmamentacaoAtrasadaHandler, FinalizarMamada_1.CancelarRegistroAmamentacaoAtrasadaHandler, FinalizarMamada_1.InformarInicioAmamentacaoAtrasadaHandler, RegistrarMamadeira_1.RegistrarMamadeiraHandler, RegistrarMamadeira_1.RegistrarMamadeiraAtrasadaHandler, RegistrarMamadeira_1.InformarInicioMamadeiraAtrasadaHandler, UltimaMamada_1.UltimaMamadaHandler, TrocarFralda_1.TrocarFraldaHandler, TrocarFralda_1.InformarTipoFraldaHandler, UltimaFralda_1.UltimaFraldaHandler, Sono_1.IniciarSonoHandler, Sono_1.FinalizarSonoHandler, Sono_1.ConfirmarRegistroSonoAtrasadoHandler, Sono_1.CancelarRegistroSonoAtrasadoHandler, Sono_1.InformarInicioSonoAtrasadoHandler, RegistrarPeso_1.RegistrarPesoHandler, ResumoDoDia_1.ResumoDoDiaHandler, Remedio_1.RegistrarRemedioHandler, Remedio_1.UltimoRemedioHandler, Default_1.HelpIntentHandler, Default_1.FallbackIntentHandler, Default_1.CancelAndStopIntentHandler, Default_1.SessionEndedRequestHandler)
    .addErrorHandlers(Default_1.ErrorHandler)
    .withPersistenceAdapter(persistenceAdapter)
    .withApiClient(new Alexa.DefaultApiClient())
    .lambda();
