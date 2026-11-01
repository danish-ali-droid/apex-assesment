variable "project_name" {
  description = "Project name prefix for security group names"
  type        = string
}

variable "vpc_id" {
  description = "VPC in which to create the security groups"
  type        = string
}

variable "ssh_allowed_cidrs" {
  description = "Optional CIDR blocks permitted to access SSH"
  type        = list(string)
  default     = []
}
