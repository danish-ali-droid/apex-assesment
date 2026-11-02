variable "secret_name" {
  description = "Name of the application configuration secret"
  type        = string
}

variable "environment" {
  description = "Application environment variables stored as a JSON secret"
  type        = map(string)
  sensitive   = true
}
