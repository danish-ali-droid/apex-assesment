#!/bin/bash
set -e
PREVIOUS_VERSION="v1.0.0"
export APP_VERSION=$PREVIOUS_VERSION
docker stop apex-api-container || true
docker rm apex-api-container || true
docker run -d \
  -p 5000:5000 \
  --name apex-api-container \
  apex-operations-api:$PREVIOUS_VERSION
