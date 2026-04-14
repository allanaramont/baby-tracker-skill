import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { EstadoBebe } from './types';

const client = new DynamoDBClient({
  region: (process.env.AWS_REGION ?? 'us-east-1').trim(),
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID.trim(),
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!.trim(),
  } : undefined,
});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE = (process.env.DYNAMODB_TABLE_NAME ?? 'baby-tracker-data').trim();

export function amazonKey(userId: string): string {
  return `amazon:${userId}`;
}

export async function lerEstado(sub: string): Promise<EstadoBebe> {
  const result = await docClient.send(
    new GetCommand({ TableName: TABLE, Key: { id: amazonKey(sub) } })
  );

  const vazio: EstadoBebe = {
    ultimasMamadas: [],
    ultimasFraldas: [],
    ultimosSonos: [],
    registrosPeso: [],
    ultimosRemedios: [],
  };

  if (!result.Item) return vazio;
  const atributos = result.Item['attributes'];
  if (!atributos) return vazio;
  return { ...vazio, ...atributos } as EstadoBebe;
}

export async function salvarEstado(sub: string, estado: EstadoBebe): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: TABLE,
      Item: { id: amazonKey(sub), attributes: estado },
    })
  );
}

export function gerarId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
