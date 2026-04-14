#!/bin/bash
# Envia todas as variaveis do .env.local para a Vercel
# Uso: ./push-env-vercel.sh

ENV_FILE=".env.local"

if [ ! -f "$ENV_FILE" ]; then
  echo "Arquivo $ENV_FILE nao encontrado."
  exit 1
fi

echo "=== Enviando variaveis para Vercel ==="

while IFS= read -r line || [ -n "$line" ]; do
  [[ -z "$line" || "$line" =~ ^# ]] && continue
  KEY="${line%%=*}"
  VALUE="${line#*=}"
  echo ">>> $KEY"
  echo "$VALUE" | npx vercel env add "$KEY" production --force 2>/dev/null
  echo "$VALUE" | npx vercel env add "$KEY" preview --force 2>/dev/null
  echo "$VALUE" | npx vercel env add "$KEY" development --force 2>/dev/null
done < "$ENV_FILE"

echo ""
echo "=== Concluido! Rode: npx vercel --prod ==="
