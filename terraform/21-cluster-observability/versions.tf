terraform {
  required_version = ">= 1.10, < 2.0"

  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 6.28"
    }
  }
}

provider "aws" {
  region  = local.region
  profile = var.aws_profile
  allowed_account_ids = ["963626856932"]

  default_tags {
    tags = local.tags
  }
}
