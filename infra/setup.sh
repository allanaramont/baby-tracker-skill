#!/bin/bash
# Script de setup do Cognito para Diario do Bebe
# Uso: ./setup.sh [dominio-prefix] [web-app-url]
#
# Pre-requisitos:
#   - AWS CLI configurado (aws configure)
#   - Permissoes: CloudFormation, Cognito, IAM
#
# Exemplo:
#   ./setup.sh meu-diario-bebe https://meuapp.vercel.app

set -e

DOMAIN_PREFIX="${1:-diario-do-bebe}"
WEB_APP_URL="${2:-http://localhost:3000}"
STACK_NAME="diario-do-bebe-auth"
REGION="${AWS_DEFAULT_REGION:-us-east-1}"

echo "=== Setup Cognito - Diario do Bebe ==="
echo "Domain prefix: $DOMAIN_PREFIX"
echo "Web app URL:   $WEB_APP_URL"
echo "Regiao:        $REGION"
echo ""

# Deploy CloudFormation
echo ">>> Criando stack CloudFormation..."
aws cloudformation deploy \
  --template-file cognito.yaml \
  --stack-name "$STACK_NAME" \
  --parameter-overrides \
    DomainPrefix="$DOMAIN_PREFIX" \
    WebAppUrl="$WEB_APP_URL" \
  --region "$REGION" \
  --no-fail-on-empty-changeset

echo ""
echo ">>> Stack criada! Obtendo outputs..."

# Buscar outputs
USER_POOL_ID=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" \
  --output text)

CLIENT_ID=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='UserPoolClientId'].OutputValue" \
  --output text)

COGNITO_DOMAIN="https://${DOMAIN_PREFIX}.auth.${REGION}.amazoncognito.com"

# Buscar client secret (nao disponivel via CloudFormation output)
CLIENT_SECRET=$(aws cognito-idp describe-user-pool-client \
  --user-pool-id "$USER_POOL_ID" \
  --client-id "$CLIENT_ID" \
  --region "$REGION" \
  --query "UserPoolClient.ClientSecret" \
  --output text)

echo ""
echo "=== CONFIGURACAO CONCLUIDA ==="
echo ""
echo "Copie os valores abaixo para o arquivo web/.env.local:"
echo ""
echo "COGNITO_REGION=$REGION"
echo "COGNITO_USER_POOL_ID=$USER_POOL_ID"
echo "COGNITO_CLIENT_ID=$CLIENT_ID"
echo "COGNITO_CLIENT_SECRET=$CLIENT_SECRET"
echo "COGNITO_DOMAIN=$COGNITO_DOMAIN"
echo "NEXT_PUBLIC_COGNITO_CLIENT_ID=$CLIENT_ID"
echo "NEXT_PUBLIC_COGNITO_DOMAIN=$COGNITO_DOMAIN"
echo "SESSION_SECRET=$(openssl rand -hex 32)"
echo "AWS_REGION=$REGION"
echo "DYNAMODB_TABLE_NAME=baby-tracker-data"
echo "NEXTAUTH_URL=$WEB_APP_URL"
echo ""
echo "E para o Lambda (variaveis de ambiente):"
echo "COGNITO_USER_POOL_ID=$USER_POOL_ID"
echo "COGNITO_REGION=$REGION"
echo ""
echo "Para o skill.json accountLinking, use:"
echo "  authorizationUrl: ${COGNITO_DOMAIN}/oauth2/authorize"
echo "  accessTokenUrl:   ${COGNITO_DOMAIN}/oauth2/token"
echo "  clientId:         $CLIENT_ID"
echo "  clientSecret:     $CLIENT_SECRET"
echo ""
echo "IMPORTANTE: Adicione as URLs de redirect da Alexa ao app client."
echo "Acesse: https://console.aws.amazon.com/cognito/v2/idp/user-pools/$USER_POOL_ID/app-integration"
