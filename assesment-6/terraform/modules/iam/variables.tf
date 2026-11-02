variable "project_name" {
  description = "Project name prefix for IAM resource names"
  type        = string
}

variable "secret_arn" {
  description = "Application configuration secret EC2 instances may read"
  type        = string
}
