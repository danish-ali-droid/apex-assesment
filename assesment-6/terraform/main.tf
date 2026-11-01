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

module "iam" {
  source = "./modules/iam"

  project_name               = var.project_name
  aws_region                 = var.aws_region
  db_password_parameter_name = var.db_password_parameter_name
}

module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
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
    db_user                    = var.db_user
    db_password_parameter_name = var.db_password_parameter_name
    db_name                    = var.db_name
    repository_url             = var.repository_url
    repository_ref             = var.repository_ref
    ecr_registry               = module.ecr.registry
    aws_region                 = var.aws_region
  })
}
