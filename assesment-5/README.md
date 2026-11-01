# Apex Operations API Observability

Kubernetes manifests for deploying `apex-operations-api` with health probes,
Prometheus scraping, and availability alerts.

## What is included

- **Deployment** (`obervablitiy-deploy.yaml`): two API replicas on port `5000`.
  Kubernetes calls `/health` for liveness and `/ready` for readiness.
- **Service** (`svc.yaml`): exposes the pods inside the cluster on port `5000`.
- **ServiceMonitor** (`service-monitor.yaml`): scrapes `/metrics` every 15 seconds.
  The application must expose Prometheus metrics there, and the Prometheus
  Operator must select this monitor (the manifest has the
  `release: prometheus-stack` label).
- **PrometheusRule** (`prometheus-cluster-rule.yaml`): alerts when the observed
  HTTP 5xx rate exceeds 2% for two minutes, or when an API pod remains unready
  for three minutes.

Apply the manifests from this directory:

```sh
kubectl apply -f svc.yaml
kubectl apply -f obervablitiy-deploy.yaml
kubectl apply -f service-monitor.yaml
kubectl apply -f prometheus-cluster-rule.yaml
```

Check rollout and pod health:

```sh
kubectl rollout status deployment/apex-operations-api
kubectl get pods -l app=apex-operations-api
kubectl describe pods -l app=apex-operations-api
```

## Logs, health, and metrics

The manifests configure probes and metrics scraping, but do not configure the
API's log format or implement its endpoints. The application should:

- Write one structured JSON event per line to stdout/stderr. Include a
  timestamp, severity, service name, message, request/trace ID, HTTP method,
  route template, status code, and duration. Do not log credentials or
  sensitive request bodies.
- Return success from `/health` when the process is alive. `/ready` should
  return success only when the instance can serve traffic; avoid making
  liveness depend on downstream services.
- Expose `http_requests_total` with `app` and `http_status` labels to support
  the existing error-rate rule, plus a request-duration histogram such as
  `http_request_duration_seconds` for latency monitoring. Keep labels bounded:
  do not use request IDs, raw URLs, or user identifiers as metric labels.

Suggested alert additions (not currently present in the rule file):

- **High latency:** alert on the 5-minute p95 of
  `http_request_duration_seconds` exceeding the service's agreed latency SLO
  for a sustained period. Set the threshold from the actual SLO rather than
  assuming one here.
- **Scrape failure:** alert when `up{job="<API scrape job>"}` is `0` for several
  minutes, after confirming the actual job label in Prometheus.
- Route critical alerts to the on-call channel and warning alerts to the
  service team. Include a runbook link and dashboard in alert annotations.

## Example failure investigation

**Incident:** `INC-2026-1101` — high latency and readiness failures. The reported
impact was intermittent user request timeouts as Kubernetes removed unready
pods from traffic. The initial signals were readiness failures and increased
request latency.

1. **Confirm scope:** Check the `ApexAPIReadinessProbeFailing` alert, pod
   readiness transitions, restart counts, and events with
   `kubectl describe pods -l app=apex-operations-api`.
2. **Inspect probe behavior:** The readiness probe calls `/ready` every
   5 seconds, with a 3-second timeout and a failure threshold of 2. Inspect
   API logs around those timestamps, grouped by pod and request/trace ID, and
   compare `/ready` latency and dependency errors with normal API requests.
3. **Check telemetry:** Compare request rate, 5xx rate, and the request-duration
   histogram around the incident. Verify Prometheus is scraping `/metrics`.
   The existing error-rate alert is named `ApexAPIHighErrorRate`; it does not
   alert on latency. The readiness alert measures unready pod status, which is
   a symptom and does not by itself prove a probe-specific failure.
4. **Determine cause before mitigation:** Correlate probe timeouts with resource
   saturation, slow dependencies, and application errors. The supplied incident
   details do not establish a root cause, so none is assumed here. After
   identifying it, mitigate the cause, verify readiness and latency recover,
   and record the evidence and follow-up actions.

**Follow-up:** Add the proposed latency and scrape alerts, and ensure the
application emits structured request logs and the metrics expected by the
configured rules. The alert expression requires a nonzero request denominator
and matching metric labels; validate both against live Prometheus series.
