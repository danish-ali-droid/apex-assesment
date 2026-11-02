data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

locals {
  instance_subnets = {
    for index, subnet_id in var.public_subnet_ids : tostring(index) => subnet_id
  }
}

resource "aws_instance" "web_server" {
  for_each = local.instance_subnets

  ami                         = data.aws_ami.amazon_linux_2023.id
  instance_type               = var.instance_type
  subnet_id                   = each.value
  iam_instance_profile        = var.instance_profile_name
  vpc_security_group_ids      = [var.security_group_id]
  associate_public_ip_address = true
  key_name                    = var.key_name != "" ? var.key_name : null
  user_data                   = var.user_data

  root_block_device {
    volume_size           = 20
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  tags = {
    Name = "${var.project_name}-web-server-${tonumber(each.key) + 1}"
    Role = "WebServer"
  }
}

resource "aws_lb_target_group_attachment" "web_server" {
  for_each = aws_instance.web_server

  target_group_arn = var.target_group_arn
  target_id        = each.value.id
  port             = var.target_port
}
