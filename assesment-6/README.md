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

Create public Docker Hub repositories named `assesment-6-backend` and `assesment-6-frontend`. Configure the `DOCKERHUB_USERNAME` repository variable, `DOCKERHUB_TOKEN`, AWS access-key secrets, and Terraform input secrets in GitHub Actions. Set `DB_PASSWORD` as a GitHub Actions secret; Terraform passes it to EC2 during instance provisioning, and it is written to the instance's `.env` file.

Run the Terraform GitHub Actions workflow manually and choose `plan` or `apply`.

The sample uses two EC2 instances with separate local databases; use shared RDS before relying on consistent data or production availability. Terraform state and EC2 user data contain the database password, so restrict access to both and keep the encrypted remote state backend enabled.

## Security

- **Secrets:** Keep `.env` files and credentials out of Git. Use GitHub Actions secrets for deployment credentials and restrict the AWS access keys to the permissions required by the workflows. The database password is passed to Terraform from GitHub Actions and stored on EC2; access to Terraform state and EC2 metadata must be restricted.
- **Least privilege:** EC2 uses SSM for management, and application images are pulled from public Docker Hub repositories. Instance HTTP ingress is restricted to the load balancer; SSH is disabled unless administrator CIDRs are configured. The backend container runs as a non-root user. The sample load balancer serves HTTP, so configure HTTPS before production use.
- **Scanning:** CI runs Gitleaks, `npm audit` at high severity, and Trivy scans of both Docker images for high and critical OS/library vulnerabilities. Address findings before deployment.

## Cost-aware hosting path

Start with one small EC2 instance running Docker Compose to avoid the fixed cost of a load balancer and a second server. Add an ALB and a second instance when availability or traffic requires them. The current Terraform avoids NAT Gateway charges, but each EC2 instance has its own database; move to shared RDS when consistent data and database availability justify the added cost. Right-size instances, stop non-production environments when idle, and destroy unused infrastructure. Compare current regional AWS prices before deployment.
