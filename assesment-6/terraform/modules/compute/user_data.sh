#!/usr/bin/env bash
set -euo pipefail

exec > >(tee /var/log/user-data.log | logger -t user-data -s 2>/dev/console) 2>&1

dnf update -y
dnf install -y docker git awscli-2 jq
systemctl enable --now docker
usermod -aG docker ec2-user

mkdir -p /usr/local/lib/docker/cli-plugins
curl --fail --location --silent --show-error \
  https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64 \
  --output /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
ln -sf /usr/local/lib/docker/cli-plugins/docker-compose /usr/bin/docker-compose

mkdir -p /opt/app
git clone --depth 1 --branch '${repository_ref}' '${repository_url}' /opt/app/source
cd /opt/app/source/assesment-6

AWS_REGION='${aws_region}' \
APP_CONFIG_SECRET_ID='${app_config_secret_arn}' \
DOCKERHUB_USERNAME='${dockerhub_username}' \
IMAGE_TAG=latest \
  ./scripts/deploy-from-secrets.sh
