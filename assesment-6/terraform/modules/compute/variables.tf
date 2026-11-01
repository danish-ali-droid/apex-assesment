variable "project_name" {
  description = "Project name prefix for web server names"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type for web servers"
  type        = string
}

variable "public_subnet_ids" {
  description = "Public subnet IDs in which to place web servers"
  type        = list(string)
}

variable "security_group_id" {
  description = "Security group ID attached to web servers"
  type        = string
}

variable "instance_profile_name" {
  description = "IAM instance profile attached to web servers"
  type        = string
}

variable "target_group_arn" {
  description = "Load balancer target group to attach web servers to"
  type        = string
}

variable "user_data" {
  description = "Bootstrap script supplied to each web server"
  type        = string
}

variable "key_name" {
  description = "Optional EC2 key pair name"
  type        = string
  default     = ""
}
