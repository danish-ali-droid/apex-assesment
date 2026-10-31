# Apex Operations API

A small Flask API packaged as a Docker container. It provides welcome, health,
and readiness endpoints and runs in the container as a non-root user.

## API endpoints

| Method | Path | Purpose | Successful response |
|---|---|---|---|
| `GET` | `/` | Welcome message | `{"status":"success","message":"Welcome to Apex Operations API"}` |
| `GET` | `/health` | Liveness check | `{"status":"healthy"}` |
| `GET` | `/ready` | Readiness check | `{"status":"ready"}` |

The readiness endpoint currently always reports `ready`. The Docker image's
health check polls `/health`.

## Run locally

Requires Python 3.11 or newer.

```bash
python -m pip install -r requirements.txt
python app.py
```

The API listens on `http://localhost:5000`.

## Lint and test

Install the development tools and run the same checks as CI:

```bash
python -m pip install -r requirements.txt pytest ruff
ruff check .
ruff format --check .
PYTHONPATH=. pytest -v
```

## Build and run the container

From this directory:

```bash
docker build -t apex-operations-api .
docker run --rm -p 5000:5000 apex-operations-api
```

The container exposes port `5000`, installs its Python dependencies from
`requirements.txt`, and runs as the unprivileged `apex` user. Its health check
requests `http://localhost:5000/health`.

## CI/CD pipeline

The GitHub Actions workflow is [`../.github/workflows/api.yaml`](../.github/workflows/api.yaml).
As configured, it runs on pushes to `main` when the changed paths match
`assesment-2/` or `.github/workflows/api.yaml`.

The pipeline uses Python 3.11 and runs these jobs in sequence:

1. **Lint and test:** installs the app dependencies, Ruff, and pytest; runs
   `ruff check .`, `ruff format --check .`, and `PYTHONPATH=. pytest -v`.
2. **Build:** builds the Python package with `python -m build` and uploads
   `dist/` as the `python-dist-artifacts` workflow artifact.
3. **Build and push:** builds the Docker image and pushes two Docker Hub tags:
   `<DOCKERHUB_USERNAME>/apex-api:<commit-sha>` and
   `<DOCKERHUB_USERNAME>/apex-api:latest`.
4. **Deploy:** connects to the server over SSH, pulls the `latest` image, and
   replaces the running `apex-api-container`, exposing port `5000`.

Each job requires the preceding job to succeed. A lint, formatting, test, or
package-build failure therefore prevents the image from being pushed and the
deployment from running.

Set these GitHub Actions repository variables and secrets before running the
workflow:

- Variable: `DOCKERHUB_USERNAME`
- Secrets: `DOCKERHUB_TOKEN`, `SERVER_USERNAME`, `SERVER_KEY`, and
  `SERVER_HOST`
