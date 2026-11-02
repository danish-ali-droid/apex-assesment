module "network" {
  source = "./modules/network"

  project_name        = var.project_name
  vpc_cidr            = var.vpc_cidr
  public_subnet_cidrs = var.public_subnet_cidrs
}

module "security" {
  source = "./modules/security"

  project_name      = var.project_name
  vpc_id            = module.network.vpc_id
  ssh_allowed_cidrs = var.ssh_allowed_cidrs

}

module "secrets_manager" {
  source = "./modules/secrets_manager"

  secret_name = var.app_config_secret_name
  environment = {
    NODE_ENV    = var.node_env
    HOST_PORT   = tostring(var.host_port)
    DB_HOST     = var.db_host
    DB_PORT     = tostring(var.db_port)
    DB_USER     = var.db_user
    DB_PASSWORD = var.db_password
    DB_NAME     = var.db_name
  }
}

module "iam" {
  source = "./modules/iam"

  project_name = var.project_name
  secret_arn   = module.secrets_manager.secret_arn
}

module "load_balancer" {
  source = "./modules/load_balancer"

  project_name      = var.project_name
  vpc_id            = module.network.vpc_id
  public_subnet_ids = module.network.public_subnet_ids
  security_group_id = module.security.alb_security_group_id

}

module "compute" {
  source = "./modules/compute"

  project_name          = var.project_name
  instance_type         = var.instance_type
  public_subnet_ids     = module.network.public_subnet_ids
  security_group_id     = module.security.instance_security_group_id
  instance_profile_name = module.iam.instance_profile_name
  target_group_arn      = module.load_balancer.target_group_arn
  key_name              = var.key_name
  user_data = templatefile("${path.module}/modules/compute/user_data.sh", {
    aws_region            = var.aws_region
    app_config_secret_arn = module.secrets_manager.secret_arn
    repository_url        = var.repository_url
    repository_ref        = var.repository_ref
    dockerhub_username    = var.dockerhub_username
  })
}
