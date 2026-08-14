terraform {
  backend "s3" {
    bucket       = "eks-tfstate-963626856932"
    key          = "cluster-workload/terraform.tfstate"
    region       = "ap-southeast-1"
    use_lockfile = true
    encrypt      = true

    # The backend resolves credentials on its own, before and independently of
    # the provider block, so var.aws_profile does not reach it. Backend blocks
    # accept literals only - no var, no local, no interpolation.
    #
    # Hardcoding the profile here means CI, which has no ~/.aws/config, will
    # fail with "profile not found". Override it there without editing this
    # file: terraform init -backend-config="profile=" (empty falls back to the
    # default credential chain).
    profile = "vitrandai-vib"
  }
}
