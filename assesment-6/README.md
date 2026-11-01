# LibriCore

A library app built with React, Express, and PostgreSQL. Docker Compose runs it locally; Terraform and GitHub Actions support AWS deployment.

## Run locally

```bash
cp .env.example .env
docker compose up --build
```

Open [localhost:3000](http://localhost:3000). API health: [localhost:5000/api/health](http://localhost:5000/api/health).

Run backend tests with `cd backend && npm test`. Stop the containers with `docker compose down`.

## Deploy to AWS

Configure GitHub Actions AWS credentials (OIDC recommended) and create the database password in AWS Systems Manager Parameter Store as a `SecureString` named `/cloudops-fullstack/production/db-password`. Then configure and apply Terraform:

```bash
cd terraform
terraform init
cp terraform.tfvars.example terraform.tfvars
terraform plan
terraform apply
```

The sample uses two EC2 instances with separate local databases; use shared RDS before relying on consistent data or production availability. Production secrets belong in SSM, not `.env` files.

## Security

- **Secrets:** Keep `.env` files and credentials out of Git. Use GitHub Actions secrets for deployment credentials, preferably OIDC instead of long-lived AWS keys. Store the production database password as an SSM `SecureString`; EC2 retrieves it using its instance role.
- **Least privilege:** EC2 can read only the configured database parameter and has SSM and ECR read access. Instance HTTP ingress is restricted to the load balancer; SSH is disabled unless administrator CIDRs are configured. The backend container runs as a non-root user. The sample load balancer serves HTTP, so configure HTTPS before production use.
- **Scanning:** CI runs Gitleaks, `npm audit` at high severity, and Trivy scans of both Docker images for high and critical OS/library vulnerabilities. Address findings before deployment.

## Cost-aware hosting path

Start with one small EC2 instance running Docker Compose to avoid the fixed cost of a load balancer and a second server. Add an ALB and a second instance when availability or traffic requires them. The current Terraform avoids NAT Gateway charges, but each EC2 instance has its own database; move to shared RDS when consistent data and database availability justify the added cost. Right-size instances, stop non-production environments when idle, and destroy unused infrastructure. Compare current regional AWS prices before deployment.
