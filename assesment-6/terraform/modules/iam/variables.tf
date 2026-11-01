variable "project_name" {
  description = "Project name prefix for IAM resource names"
  type        = string
}

variable "aws_region" {
  description = "AWS region containing the SSM parameter"
  type        = string
}

variable "db_password_parameter_name" {
  description = "Name of the SSM SecureString containing the database password"
  type        = string
}
