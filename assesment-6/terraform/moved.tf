moved {
  from = aws_vpc.main
  to   = module.network.aws_vpc.main
}

moved {
  from = aws_internet_gateway.igw
  to   = module.network.aws_internet_gateway.igw
}

moved {
  from = aws_subnet.public_1
  to   = module.network.aws_subnet.public["0"]
}

moved {
  from = aws_subnet.public_2
  to   = module.network.aws_subnet.public["1"]
}

moved {
  from = aws_route_table.public
  to   = module.network.aws_route_table.public
}

moved {
  from = aws_route_table_association.public_1
  to   = module.network.aws_route_table_association.public["0"]
}

moved {
  from = aws_route_table_association.public_2
  to   = module.network.aws_route_table_association.public["1"]
}

moved {
  from = aws_security_group.alb_sg
  to   = module.security.aws_security_group.alb_sg
}

moved {
  from = aws_security_group.ec2_sg
  to   = module.security.aws_security_group.ec2_sg
}

moved {
  from = aws_lb.main
  to   = module.load_balancer.aws_lb.main
}

moved {
  from = aws_lb_target_group.main
  to   = module.load_balancer.aws_lb_target_group.main
}

moved {
  from = aws_lb_listener.http
  to   = module.load_balancer.aws_lb_listener.http
}

moved {
  from = aws_instance.web_server_1
  to   = module.compute.aws_instance.web_server["0"]
}

moved {
  from = aws_instance.web_server_2
  to   = module.compute.aws_instance.web_server["1"]
}

moved {
  from = aws_lb_target_group_attachment.web_server_1
  to   = module.compute.aws_lb_target_group_attachment.web_server["0"]
}

moved {
  from = aws_lb_target_group_attachment.web_server_2
  to   = module.compute.aws_lb_target_group_attachment.web_server["1"]
}

moved {
  from = aws_iam_role.ec2_role
  to   = module.iam.aws_iam_role.ec2_role
}

moved {
  from = aws_iam_role_policy_attachment.ssm_policy
  to   = module.iam.aws_iam_role_policy_attachment.ssm_policy
}

moved {
  from = aws_iam_role_policy_attachment.ecr_read_only
  to   = module.iam.aws_iam_role_policy_attachment.ecr_read_only
}

moved {
  from = aws_iam_role_policy.db_password_parameter
  to   = module.iam.aws_iam_role_policy.db_password_parameter
}

moved {
  from = aws_iam_instance_profile.ec2_profile
  to   = module.iam.aws_iam_instance_profile.ec2_profile
}

moved {
  from = aws_ecr_repository.backend
  to   = module.ecr.aws_ecr_repository.backend
}

moved {
  from = aws_ecr_repository.frontend
  to   = module.ecr.aws_ecr_repository.frontend
}
