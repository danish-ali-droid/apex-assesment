output "public_ips" {
  description = "Public IPv4 addresses of the web servers, ordered by subnet"
  value       = [for key in sort(keys(aws_instance.web_server)) : aws_instance.web_server[key].public_ip]
}
