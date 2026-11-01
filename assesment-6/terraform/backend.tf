terraform{
backend "s3" {
  bucket   = "library-management-terraform-state"
  key      = "terraform.tfstate"
  region   = "us-east-1"
  encrypt  = true
  use_lockfile = true
}
}
