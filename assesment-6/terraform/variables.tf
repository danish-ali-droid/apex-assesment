variable "aws_region" {
  description = "AWS region for resources deployment"
  type        = string
  default     = "eu-north-1"
}

variable "project_name" {
  description = "Project name prefix for tags and resources"
  type        = string
}

variable "repository_url" {
  description = "Git repository containing the application source"
  type        = string
}

variable "repository_ref" {
  description = "Branch or tag used to bootstrap the application"
  type        = string
  default     = "main"
}

variable "dockerhub_username" {
  description = "Docker Hub username that owns the public application image repositories"
  type        = string
}

variable "app_config_secret_name" {
  description = "AWS Secrets Manager name used to store the application environment"
  type        = string
  default     = "cloudops-fullstack/application-config"
}

variable "environment" {
  description = "Environment identifier (e.g., dev, staging, production)"
  type        = string

}

variable "vpc_cidr" {
  description = "CIDR block for the Virtual Private Cloud"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for the two public subnets (Multi-AZ for ALB)"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]

  validation {
    condition     = length(var.public_subnet_cidrs) == 2
    error_message = "Exactly two public subnet CIDRs are required for the load balancer and web servers."
  }
}

variable "instance_type" {
  description = "EC2 instance type for web servers (t2.micro as per diagram)"
  type        = string
  default     = "t2.micro"
}

variable "ssh_allowed_cidrs" {
  description = "List of CIDR blocks permitted for optional SSH access. Leave empty to enforce SSM Session Manager."
  type        = list(string)
  default     = []
}

variable "key_name" {
  description = "Optional AWS EC2 key pair name for SSH access"
  type        = string
}

variable "db_password" {
  description = "PostgreSQL password stored in the application Secrets Manager secret"
  type        = string
  sensitive   = true
}

variable "node_env" {
  description = "Node.js runtime environment"
  type        = string
  default     = "production"
}

variable "host_port" {
  description = "Host port used to publish the frontend"
  type        = number
  default     = 3000

  validation {
    condition     = var.host_port >= 1 && var.host_port <= 65535
    error_message = "host_port must be between 1 and 65535."
  }
}

variable "db_host" {
  description = "Database hostname used by the backend"
  type        = string
  default     = "postgres"
}

variable "db_port" {
  description = "Database port used by the backend"
  type        = number
  default     = 5432

  validation {
    condition     = var.db_port >= 1 && var.db_port <= 65535
    error_message = "db_port must be between 1 and 65535."
  }
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string

}

variable "db_user" {
  description = "PostgreSQL username"
  type        = string

}
