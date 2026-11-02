#!/usr/bin/env bash
set -euo pipefail

: "${AWS_REGION:?Set AWS_REGION}"
: "${APP_CONFIG_SECRET_ID:?Set APP_CONFIG_SECRET_ID}"
: "${DOCKERHUB_USERNAME:?Set DOCKERHUB_USERNAME}"

cd "$(dirname "$0")/.."

secret_json=$(aws secretsmanager get-secret-value \
  --region "$AWS_REGION" \
  --secret-id "$APP_CONFIG_SECRET_ID" \
  --query SecretString \
  --output text)

read_secret_value() {
  local key=$1
  local value

  if ! value=$(jq -er --arg key "$key" '.[$key] | select(. != null) | tostring' <<<"$secret_json") || [ -z "$value" ]; then
    echo "::error::Required key $key is missing from the application configuration secret."
    return 1
  fi

  printf '%s' "$value"
}

export NODE_ENV="$(read_secret_value NODE_ENV)"
export HOST_PORT="$(read_secret_value HOST_PORT)"
export DB_HOST="$(read_secret_value DB_HOST)"
export DB_PORT="$(read_secret_value DB_PORT)"
export DB_USER="$(read_secret_value DB_USER)"
export DB_PASSWORD="$(read_secret_value DB_PASSWORD)"
export DB_NAME="$(read_secret_value DB_NAME)"
export IMAGE_TAG="${IMAGE_TAG:-latest}"

docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --no-build --remove-orphans

unset secret_json DB_PASSWORD
