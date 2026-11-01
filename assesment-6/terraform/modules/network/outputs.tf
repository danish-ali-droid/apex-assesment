output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "Public subnet IDs, ordered by the input CIDR list"
  value       = [for key in sort(keys(aws_subnet.public)) : aws_subnet.public[key].id]
}
