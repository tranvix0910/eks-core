locals {
  name   = "eks-lab"
  region = "ap-northeast-1"

  azs = ["ap-northeast-1a", "ap-northeast-1c", "ap-northeast-1d"]

  # Primary CIDR: nodes and load balancers.
  # Already used elsewhere in account 963626856932 - do NOT reuse:
  #   10.0.0.0/16 (x3), 10.1.0.0/16, 10.10.0.0/16, 11.0.0.0/16, 172.30.0.0/16, 172.31.0.0/16
  vpc_cidr = "10.20.0.0/16"

  public_subnets = ["10.20.0.0/24", "10.20.1.0/24", "10.20.2.0/24"]

  # Node subnets, one block per cluster. Separate route tables even though the VPC is shared.
  workload_node_subnets      = ["10.20.16.0/20", "10.20.32.0/20", "10.20.48.0/20"]
  observability_node_subnets = ["10.20.64.0/20", "10.20.80.0/20", "10.20.96.0/20"]

  # No secondary CIDRs. An earlier design put pods on their own 100.64.0.0/10
  # range, which needs VPC CNI custom networking (AWS_VPC_K8S_CNI_CUSTOM_NETWORK_CFG
  # plus an ENIConfig per AZ). That costs the node's primary ENI for pods, roughly
  # 30% fewer pods per node, for a problem we do not have: each node subnet is a
  # /20 with 4091 usable addresses, and prefix delegation stretches that further.
  #
  # Attaching a secondary CIDR to a live VPC is non-disruptive and can be done at
  # any time, so there is nothing to gain by reserving one up front.

  # Both clusters share this VPC, so the Karpenter discovery tag MUST differ per
  # cluster. Same value on both means Karpenter in one cluster discovers the
  # other cluster's subnets and launches nodes into them.
  clusters = {
    workload      = "eks-workload"
    observability = "eks-observability"
  }

  tags = {
    Project     = "vi.trandai"
    Owner       = "vi.trandai"
    ManagedBy   = "terraform"
    Layer       = "10-network"
    Environment = var.environment
  }
}
