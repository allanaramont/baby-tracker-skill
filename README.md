# Baby Tracker — Alexa Skill

Skill Alexa em português para acompanhamento de bebê recém-nascido. Registra amamentações, trocas de fralda, sono, peso e remédios via voz.

## Funcionalidades

| Intent | Exemplo de frase | O que faz |
|---|---|---|
| DefinirNomeBebe | "o nome é Ravi" | Salva o nome do bebê para personalizar as respostas |
| IniciarAmamentacao | "iniciar amamentação" | Inicia a amamentação e pergunta o lado quando necessário |
| FinalizarAmamentacao | "finalizar amamentação" | Finaliza a amamentação atual ou registra duração informada |
| UltimaAmamentacao | "quando foi a última amamentação" | Informa há quanto tempo foi a última amamentação |
| TrocarFralda | "trocar fralda de cocô" | Registra troca com tipo (xixi/cocô/os dois) |
| UltimaFralda | "quando foi a última troca" | Informa há quanto tempo e tipo |
| IniciarSono | "foi dormir" | Inicia o sono |
| FinalizarSono | "acordou" | Finaliza o sono e salva a duração |
| RegistrarPeso | "registrar peso 3 quilos e 200 gramas" | Salva peso e compara com anterior |
| ResumoDoDia | "resumo de hoje" | Relatório completo do dia |
| RegistrarRemedio | "dar remédio Minilax" | Registra nome, dose e unidade |
| UltimoRemedio | "último remédio" | Informa último remédio e há quanto tempo |

---

## Pré-requisitos

- Node.js 18+
- Conta Amazon Developer (gratuita): https://developer.amazon.com
- Conta AWS (gratuita): https://aws.amazon.com
- ASK CLI: `npm install -g ask-cli`
- AWS CLI: https://aws.amazon.com/cli/

---

## Setup inicial

### 1. Configurar credenciais

```bash
ask configure
aws configure
```

### 2. Instalar dependências

```bash
cd lambda
npm install
```

### 3. Build

```bash
npm run build
npm test
```

---

## Deploy

### Opção A — ASK CLI (recomendado)

```bash
# Na raiz do projeto
ask deploy
```

O ASK CLI cria automaticamente:
- A skill no Alexa Developer Console
- A função Lambda na AWS
- A tabela no DynamoDB, se necessário

### Opção B — Manual

#### 1. Criar tabela DynamoDB

```bash
aws dynamodb create-table \
  --table-name baby-tracker-data \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

#### 2. Criar função Lambda

```bash
cd lambda
npm run build
cd dist && zip -r ../deploy.zip . && cd ..

aws lambda create-function \
  --function-name baby-tracker-skill \
  --runtime nodejs18.x \
  --role arn:aws:iam::ACCOUNT_ID:role/lambda-alexa-role \
  --handler index.handler \
  --zip-file fileb://deploy.zip \
  --environment Variables={DYNAMODB_TABLE=baby-tracker-data} \
  --region us-east-1
```

#### 3. Criar a skill no Alexa Developer Console

1. Acesse https://developer.amazon.com/alexa/console/ask
2. Clique em "Create Skill"
3. Nome: "Rastreador do Bebê"
4. Idioma: Portuguese (BR)
5. Modelo: Custom
6. Hosting: Provision your own
7. No menu Build > JSON Editor, cole o conteúdo de `skill-package/interactionModels/custom/pt-BR.json`
8. Em Endpoint, cole o ARN da sua função Lambda
9. Salve e clique em "Build Model"

---

## Estrutura do projeto

```
baby-tracker-skill/
├── lambda/
│   ├── src/
│   │   ├── index.ts              # Entry point Lambda
│   │   ├── types/
│   │   │   └── index.ts          # Tipos TypeScript
│   │   ├── utils/
│   │   │   └── tempo.ts          # Utilitários de tempo
│   │   └── handlers/
│   │       ├── Default.ts        # Launch, Help, Stop, Error
│   │       ├── IniciarMamada.ts
│   │       ├── FinalizarMamada.ts
│   │       ├── UltimaMamada.ts
│   │       ├── TrocarFralda.ts
│   │       ├── UltimaFralda.ts
│   │       ├── Sono.ts
│   │       ├── RegistrarPeso.ts
│   │       ├── Remedio.ts
│   │       └── ResumoDoDia.ts
│   ├── package.json
│   └── tsconfig.json
└── skill-package/
    ├── skill.json                # Manifest da skill
    └── interactionModels/
        └── custom/
            └── pt-BR.json        # Modelo de voz em português
```

---

## Dados armazenados (DynamoDB)

Tudo fica em um único item por usuário (via `userId` da Alexa):

```json
{
  "mamadaAtual": { "emAndamento": true, "iniciadaEm": 1234567890 },
  "ultimasMamadas": [...],
  "ultimasFraldas": [...],
  "ultimosSonos": [...],
  "registrosPeso": [...],
  "ultimosRemedios": [...],
  "ultimoLadoMamada": "esquerdo"
}
```

## Observações de execução

- O fluxo principal da skill está em [`lambda/src/index.ts`](lambda/src/index.ts).
- Em dispositivos com tela, a skill envia documentos APL para acompanhar o timer e o resumo de amamentação.
- O script `npm test` já roda com `--watchman=false`, o que evita falhas em ambientes sem permissão para usar o Watchman.

---

## Custo

Tudo dentro do free tier:
- Lambda: 1 milhão de requests/mês grátis (permanente)
- DynamoDB: 25 GB grátis (permanente)
- Alexa Developer Console: grátis
- Publicação na Alexa Store: grátis
