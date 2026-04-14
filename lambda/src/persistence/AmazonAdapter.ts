import { PersistenceAdapter } from 'ask-sdk-core';
import { RequestEnvelope } from 'ask-sdk-model';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION ?? 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

async function resolverUserId(requestEnvelope: RequestEnvelope): Promise<string> {
  const accessToken = (requestEnvelope as any)?.session?.user?.accessToken as string | undefined;

  if (accessToken) {
    try {
      const res = await fetch('https://api.amazon.com/user/profile', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const profile = await res.json() as { user_id?: string };
        if (profile.user_id) return `amazon:${profile.user_id}`;
      }
    } catch {
      // fallback para userId da Alexa
    }
  }

  return requestEnvelope.session!.user.userId;
}

export class AmazonPersistenceAdapter implements PersistenceAdapter {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async getAttributes(requestEnvelope: RequestEnvelope): Promise<{ [key: string]: any }> {
    const userId = await resolverUserId(requestEnvelope);
    const result = await docClient.send(
      new GetCommand({ TableName: this.tableName, Key: { id: userId } })
    );
    return result.Item?.attributes ?? {};
  }

  async saveAttributes(requestEnvelope: RequestEnvelope, attributes: { [key: string]: any }): Promise<void> {
    const userId = await resolverUserId(requestEnvelope);
    await docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: { id: userId, attributes },
      })
    );
  }

  async deleteAttributes(requestEnvelope: RequestEnvelope): Promise<void> {
    const userId = await resolverUserId(requestEnvelope);
    await docClient.send(
      new DeleteCommand({ TableName: this.tableName, Key: { id: userId } })
    );
  }
}
