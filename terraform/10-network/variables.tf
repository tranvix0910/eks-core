variable "environment" {
  description = "Deployment environment. Drives naming and tagging."
  type        = string

  validation {
    condition     = contains(["dev", "uat", "prod"], var.environment)
    error_message = "environment must be one of: dev, uat, prod."
  }
}
variable "aws_profile" {
  description = <<-EOT
    Named profile from ~/.aws/config used by the aws provider. Must resolve to
    account 963626856932, the account that owns the state bucket and the VPC.

    Defaulted so the profile lives in code and matches the literal in
    backend.tf. Set to null to fall back to the default credential chain
    (AWS_PROFILE, static env vars, instance/container role) - CI has no
    ~/.aws/config, so pass -var aws_profile= or TF_VAR_aws_profile= there.

    This covers the provider only. The S3 backend resolves credentials
    separately and cannot read variables - see backend.tf.
  EOT
  type        = string
  default     = "vitrandai-vib"
}
