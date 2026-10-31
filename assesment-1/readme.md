# Apex Operations API

A lightweight Flask API that exposes a welcome endpoint, a health check, and a readiness check.

## Requirements

- Python 3.12 or newer
- pip

## Run locally

From the project directory, create and activate a virtual environment if desired, then install the dependencies and start the application:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

The server listens on `http://localhost:5000`.

## Endpoints

| Method | Path | Description | Example response |
|---|---|---|---|
| `GET` | `/` | Welcome message | `{"status":"success","message":"Welcome to Apex Operations API"}` |
| `GET` | `/health` | Liveness/health check | `{"status":"healthy"}` |
| `GET` | `/ready` | Readiness check | `{"status":"ready"}` |

Try an endpoint with curl:

```bash
curl http://localhost:5000/health
```

The readiness endpoint currently always reports `ready`.

## Run with Docker

Build and start the container:

```bash
docker build -t apex-operations-api .
docker run --rm -p 5000:5000 apex-operations-api
```

The image uses Python 3.12, runs the application as the `apex` user, and includes a Docker health check that requests `/health`.
