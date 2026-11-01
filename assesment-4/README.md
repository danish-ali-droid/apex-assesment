# Apex Operations API

## Release

Build and retain versioned images:

```bash
docker build -t apex-operations-api:v1.0.0 .
docker build -t apex-operations-api:v1.1.0 .
```

Test `v1.1.0` before replacing the running service:

```bash
docker run -d --name apex-api-candidate -p 5001:5000 apex-operations-api:v1.1.0
curl --fail http://localhost:5001/health
curl --fail http://localhost:5001/ready
docker rm -f apex-api-candidate
```

Deploy after the checks pass:

```bash
docker rm -f apex-api-container 2>/dev/null || true
docker run -d --name apex-api-container -p 5000:5000 apex-operations-api:v1.1.0
curl --fail http://localhost:5000/health
```

## Rollback

If the release fails, restore `v1.0.0`:

```bash
./rollback.sh
curl --fail http://localhost:5000/health
```

`rollback.sh` replaces `apex-api-container` with
`apex-operations-api:v1.0.0`. Keep that image available locally.

## API

- `GET /` — welcome response
- `GET /health` — health check
- `GET /ready` — readiness check
