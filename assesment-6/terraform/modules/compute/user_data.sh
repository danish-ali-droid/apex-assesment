#!/usr/bin/env bash
set -euo pipefail

exec > >(tee /var/log/user-data.log | logger -t user-data -s 2>/dev/console) 2>&1

dnf update -y
dnf install -y docker git
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

umask 077
cat > .env <<'EOF'
DB_USER=${db_user}
DB_NAME=${db_name}
DB_PASSWORD=${db_password_dotenv}
DOCKERHUB_USERNAME=${dockerhub_username}
IMAGE_TAG=latest
EOF
chmod 600 .env

docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --no-build
