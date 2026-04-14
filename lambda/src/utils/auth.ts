/**
 * Extrai o userId do request envelope.
 * Se o usuario vinculou a conta (Account Linking), usa o Cognito sub do JWT.
 * Caso contrario, usa o Alexa userId padrao.
 */
export function extrairUserId(requestEnvelope: any): string {
  const accessToken: string | undefined = requestEnvelope?.session?.user?.accessToken;

  if (accessToken) {
    try {
      const parts = accessToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
        if (payload.sub) {
          return `cognito:${payload.sub}`;
        }
      }
    } catch {
      // JWT invalido - cai no fallback
    }
  }

  return requestEnvelope.session.user.userId;
}

/**
 * Verifica se o usuario ja vinculou a conta Alexa com o web app.
 */
export function temContaVinculada(requestEnvelope: any): boolean {
  return !!requestEnvelope?.session?.user?.accessToken;
}
