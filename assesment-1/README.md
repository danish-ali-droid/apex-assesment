# Apex Operations API

A minimal Flask API packaged as a Docker container. It provides health and readiness endpoints and runs in the container as a non-root user.

## API endpoints

| Method | Path | Purpose | Successful response |
|---|---|---|---|
| `GET` | `/` | Welcome message | `{"status":"success","message":"Welcome to Apex Operations API"}` |
| `GET` | `/health` | Liveness check | `{"status":"healthy"}` |
| `GET` | `/ready` | Readiness check | `{"status":"ready"}` |

The readiness endpoint currently always reports `ready`. The Docker image's health check polls `/health`.

## Build and run with Docker

From this directory:

```bash
docker build -t apex-operations-api .
docker run --rm -p 5000:5000 apex-operations-api
```

The API is available at `http://localhost:5000`. Check its endpoints with:

```bash
curl http://localhost:5000/
curl http://localhost:5000/health
curl http://localhost:5000/ready
```

The image is based on `python:3.12-slim`, installs dependencies from `requirements.txt`, exposes port `5000`, and runs the app as the unprivileged `apex` user. Docker checks container health by requesting `http://localhost:5000/health` every 30 seconds.

## Run locally

Requires Python 3.12 or newer and pip.

```bash
pip install -r requirements.txt
```
Run the project locally.
```bash
python app.py
```

The development server listens on `http://localhost:5000`.
