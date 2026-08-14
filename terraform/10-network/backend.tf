terraform {
  backend "s3" {
    bucket       = "eks-tfstate-963626856932"
    key          = "network/terraform.tfstate"
    region       = "ap-southeast-1"
    use_lockfile = true
    encrypt      = true
    profile = "vitrandai-vib"
  }
}

