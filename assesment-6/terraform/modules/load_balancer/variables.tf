variable "project_name" {
  description = "Project name prefix for load balancer resources"
  type        = string
}

variable "vpc_id" {
  description = "VPC containing the load balancer and target group"
  type        = string
}

variable "public_subnet_ids" {
  description = "Public subnet IDs for the load balancer"
  type        = list(string)
}

variable "security_group_id" {
  description = "Security group ID attached to the load balancer"
  type        = string
}

variable "target_port" {
  description = "Frontend host port used by the target group"
  type        = number
}
