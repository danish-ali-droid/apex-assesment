output "instance_profile_name" {
  description = "IAM instance profile name for web servers"
  value       = aws_iam_instance_profile.ec2_profile.name
}
