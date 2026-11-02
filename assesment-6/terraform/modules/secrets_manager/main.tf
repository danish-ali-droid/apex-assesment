resource "aws_secretsmanager_secret" "app_config" {
  name        = var.secret_name
  description = "Application environment configuration"
}

resource "aws_secretsmanager_secret_version" "app_config" {
  secret_id     = aws_secretsmanager_secret.app_config.id
  secret_string = jsonencode(var.environment)
}
