variable "repository_names" {
  description = "ECR repository names to create, e.g. [\"shopnow/shopnow-frontend\", ...]"
  type        = list(string)
}

variable "image_tag_mutability" {
  description = "IMMUTABLE forces a new tag per build, which is what a deployment pinned by tag needs to be reliable."
  type        = string
  default     = "IMMUTABLE"
}

variable "max_image_count" {
  description = "Images per repository to retain before the lifecycle policy expires the oldest."
  type        = number
  default     = 10
}

variable "tags" {
  type    = map(string)
  default = {}
}
