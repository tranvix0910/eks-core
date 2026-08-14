locals {
  name   = "eks-workload"
  region = "ap-northeast-1"

  kubernetes_version = "1.34"

  vpc_id          = data.terraform_remote_state.network.outputs.vpc_id
  vpc_cidr        = data.terraform_remote_state.network.outputs.vpc_cidr
  azs             = data.terraform_remote_state.network.outputs.azs
  node_subnet_ids = data.terraform_remote_state.network.outputs.workload_node_subnet_ids

  infra_instance_types = ["t3.large"]
  infra_capacity_type  = "ON_DEMAND"
  infra_desired_size   = 3

  tags = {
    Project     = "vi.trandai"
    Owner       = "vi.trandai"
    ManagedBy   = "terraform"
    Layer       = "20-cluster-workload"
    Environment = var.environment
  }
}
