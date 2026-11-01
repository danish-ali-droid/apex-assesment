# Apex Assessments

This repository contains six related assessments covering containerization,
CI, local deployment, releases, observability, and cloud security.

## Assessment overview

The six assessment folders provide practical examples and documentation for
the repository's deployment and operations topics. Each section below
summarizes the implementation and points to its supporting files without
reproducing the assessment prompts.

### 1. Containerized API

[Assessment 1](./assesment-1/) packages a small Flask API in Docker. The API
provides `/health` and `/ready` endpoints, the image includes a Docker health
check, and the application runs as a non-root user.

### 2. Automated CI

[Assessment 2](./assesment-2/) has a GitHub Actions workflow that installs
dependencies, runs Ruff lint and formatting checks, and executes pytest. The
package build, container push, and deployment jobs depend on earlier jobs
succeeding, so failures in linting or tests prevent deployment.

### 3. Local multi-service deployment

[Assessment 3](./assesment-3/) runs a React frontend, PHP API, and MariaDB
database with Docker Compose. Environment settings are provided through a
local `.env` file, the schema initializes the database, and a named volume
persists database data across container restarts.

### 4. Release and rollback

[Assessment 4](./assesment-4/) describes testing a versioned candidate image
before deployment and checking its health. The executable
[`rollback.sh`](./assesment-4/rollback.sh) restores the prior `v1.0.0` image.

### 5. Observability and failure investigation

[Assessment 5](./assesment-5/) includes Kubernetes liveness and readiness
probes, Prometheus scraping configuration, alert rules, and a documented
procedure for investigating a readiness and latency incident. The README
also identifies structured application logs and a `/metrics` endpoint as
work the application itself still needs; the manifests alone do not provide
those features.

### 6. Security and cloud deployment

[Assessment 6](./assesment-6/) documents and demonstrates a fuller deployment
path using Docker Compose, GitHub Actions, AWS, and Terraform. Supporting
guides cover secrets management, least-privilege access, dependency and
container-image scanning, deployment steps, architecture, and cost-conscious
hosting options.

### Coverage notes

- The assessment 1 and 2 APIs are Flask examples; assessment 3 is a separate
  React/PHP/MariaDB application; assessment 6 is a React/Node.js/PostgreSQL
  application. They are separate examples, not one shared application.
- In assessment 1 and 2, `/ready` currently always reports ready; it does not
  check a dependency.
- Assessment 2's root workflow is
  [`.github/workflows/ci.yaml`](./.github/workflows/ci.yaml). It gates later
  jobs on the lint/test job, and its path filter currently selects assessment
  2 changes.
- Assessment 5 supplies Kubernetes and Prometheus configuration and documents
  structured logging, metrics, and a failure investigation. Its README notes
  that the API log format and `/metrics` endpoint are not implemented by those
  manifests; treat the log/metric implementation details as requirements or
  proposals, not as verified running functionality.
- Assessment 6 includes CI checks for tests/builds, dependency audits, secret
  detection, and container vulnerability scans. Its security, deployment, and
  cost guidance is in [`docs/`](./assesment-6/docs/).

## Running the local applications

Each assessment has its own instructions and prerequisites:

- Follow the API build and run instructions in [assessment 1](./assesment-1/README.md)
  or [assessment 2](./assesment-2/README.md).
- For assessment 3, follow [its README](./assesment-3/README.md); the Compose
  stack uses a `.env` file and a named database volume.
- For assessment 6, follow [its README](./assesment-6/README.md); its Compose
  stack runs the frontend, API, and PostgreSQL database.
