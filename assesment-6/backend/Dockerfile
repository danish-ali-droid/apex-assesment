# ==============================================================================
# Production Dockerfile for Node.js Express Backend
# Implements security best practices:
# - Minimal base image (alpine)
# - Multi-stage build
# - Non-root unprivileged user (Least Privilege)
# - Container HEALTHCHECK
# ==============================================================================

# Build stage
FROM node:24-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev

# Runtime stage
FROM node:24-alpine AS runner

RUN apk upgrade --no-cache \
  && rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
  && rm -f /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack

WORKDIR /usr/src/app

# Security: Create and run under non-privileged system user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set production environment
ENV NODE_ENV=production \
    PORT=5000

# Copy node_modules from builder
COPY --from=builder --chown=appuser:appgroup /usr/src/app/node_modules ./node_modules
COPY --chown=appuser:appgroup src/ ./src/

USER appuser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:5000/api/health || exit 1

CMD ["node", "src/server.js"]
