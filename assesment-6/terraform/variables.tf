variable "aws_region" {
  description = "AWS region for resources deployment"
  type        = string
  default     = "eu-north-1"
}

variable "project_name" {
  description = "Project name prefix for tags and resources"
  type        = string
  default     = "cloudops-fullstack"
}

variable "repository_url" {
  description = "Git repository containing the application source"
  type        = string
  default     = "https://github.com/danish-ali-droid/apex-assesment.git"
}

variable "repository_ref" {
  description = "Branch or tag used to bootstrap the application"
  type        = string
  default     = "main"
}

variable "environment" {
  description = "Environment identifier (e.g., dev, staging, production)"
  type        = string
  default     = "production"
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
  default     = ""
}

variable "db_password_parameter_name" {
  description = "Name of the SSM SecureString parameter containing the PostgreSQL password"
  type        = string
  default     = "/cloudops-fullstack/production/db-password"
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "librarydb"
}

variable "db_user" {
  description = "PostgreSQL username"
  type        = string
  default     = "postgres"
}
