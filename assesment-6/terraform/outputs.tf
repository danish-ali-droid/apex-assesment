output "alb_dns_name" {
  description = "Public DNS URL of the Application Load Balancer to access the full-stack application"
  value       = module.load_balancer.dns_name
}

output "alb_arn" {
  description = "ARN of the Application Load Balancer"
  value       = module.load_balancer.arn
}

output "web_server_1_public_ip" {
  description = "Public IPv4 address of Web Server 1"
  value       = module.compute.public_ips[0]
}

output "web_server_2_public_ip" {
  description = "Public IPv4 address of Web Server 2"
  value       = module.compute.public_ips[1]
}

output "vpc_id" {
  description = "VPC Identifier"
  value       = module.network.vpc_id
}

output "target_group_arn" {
  description = "Target group ARN for CI/CD deployments"
  value       = module.load_balancer.target_group_arn
}
