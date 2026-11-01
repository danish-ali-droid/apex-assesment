output "alb_security_group_id" {
  description = "Security group ID for the public load balancer"
  value       = aws_security_group.alb_sg.id
}

output "instance_security_group_id" {
  description = "Security group ID for web server instances"
  value       = aws_security_group.ec2_sg.id
}
