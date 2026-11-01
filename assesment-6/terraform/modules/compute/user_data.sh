#!/usr/bin/env bash
set -euo pipefail

exec > >(tee /var/log/user-data.log | logger -t user-data -s 2>/dev/console) 2>&1

dnf update -y
dnf install -y docker git awscli-2
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

DB_PASSWORD=$(aws ssm get-parameter \
  --region '${aws_region}' \
  --name '${db_password_parameter_name}' \
  --with-decryption \
  --query 'Parameter.Value' \
  --output text)
umask 077
cat > .env <<EOF
DB_USER=${db_user}
DB_NAME=${db_name}
DB_PASSWORD_PARAMETER_NAME=${db_password_parameter_name}
ECR_REGISTRY=${ecr_registry}
IMAGE_TAG=latest
EOF
chmod 600 .env

DB_PASSWORD="$DB_PASSWORD" docker compose -f docker-compose.prod.yml build
DB_PASSWORD="$DB_PASSWORD" docker compose -f docker-compose.prod.yml up -d
unset DB_PASSWORD
