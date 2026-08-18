# Cluster 1 - workloads.
#
# Everything network-related comes from layer 10. Never redeclare a subnet id or
# a CIDR that already exists as an output there.

data "terraform_remote_state" "network" {
  backend = "s3"

  config = {
    bucket  = "eks-tfstate-963626856932"
    key     = "network/terraform.tfstate"
    region  = "ap-southeast-1"
    profile = "vitrandai-vib"
  }
}

module "cluster" {
  source = "./modules/eks_cluster"

  name               = local.name
  kubernetes_version = local.kubernetes_version

  vpc_id     = local.vpc_id
  vpc_cidr   = local.vpc_cidr
  subnet_ids = local.node_subnet_ids

  node_groups = {
    infra = {
      instance_types = local.infra_instance_types
      capacity_type  = local.infra_capacity_type

      min_size     = local.infra_desired_size
      max_size     = local.infra_desired_size + 1
      desired_size = local.infra_desired_size

      labels = { role = "infra" }
      taints = {}
    }
  }

  enable_karpenter_discovery = true
  enable_efs_egress          = true
  extension_apiserver_ports = [6666]

  tags = local.tags
}

module "karpenter" {
  source  = "terraform-aws-modules/eks/aws//modules/karpenter"
  version = "~> 21.0"

  cluster_name = module.cluster.cluster_name

  enable_spot_termination = true

  create_pod_identity_association = true

  node_iam_role_use_name_prefix = false
  enable_inline_policy = true

  node_iam_role_additional_policies = {
    AmazonSSMManagedInstanceCore = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
  }

  tags = local.tags
}

module "ebs_csi_pod_identity" {
  source  = "terraform-aws-modules/eks-pod-identity/aws"
  version = "~> 2.0"

  name = "${local.name}-ebs-csi"

  attach_aws_ebs_csi_policy = true

  associations = {
    this = {
      cluster_name    = module.cluster.cluster_name
      namespace       = "kube-system"
      service_account = "ebs-csi-controller-sa"
    }
  }

  tags = local.tags
}

module "efs_csi_pod_identity" {
  source  = "terraform-aws-modules/eks-pod-identity/aws"
  version = "~> 2.0"

  name = "${local.name}-efs-csi"

  attach_aws_efs_csi_policy = true

  associations = {
    this = {
      cluster_name    = module.cluster.cluster_name
      namespace       = "kube-system"
      service_account = "efs-csi-controller-sa"
    }
  }

  tags = local.tags
}

module "lb_controller_pod_identity" {
  source  = "terraform-aws-modules/eks-pod-identity/aws"
  version = "~> 2.0"

  name = "${local.name}-lb-controller"

  attach_aws_lb_controller_policy = true

  associations = {
    this = {
      cluster_name    = module.cluster.cluster_name
      namespace       = "kube-system"
      service_account = "aws-load-balancer-controller"
    }
  }

  tags = local.tags
}

module "shopnow_ecr" {
  source = "./modules/ecr"

  repository_names = [
    "shopnow/shopnow-frontend",
    "shopnow/shopnow-config-server",
    "shopnow/shopnow-discovery-server",
    "shopnow/shopnow-product-service",
    "shopnow/shopnow-shopping-cart-service",
    "shopnow/shopnow-user-service",
    "shopnow/shopnow-api-gateway",
  ]

  tags = local.tags
}

module "shopnow_efs" {
  source = "./modules/efs"

  name   = local.name
  vpc_id = local.vpc_id

  subnet_ids             = local.node_subnet_ids
  node_security_group_id = module.cluster.node_security_group_id

  tags = local.tags
}

# Lets cluster 2's nodes reach Rancher on cluster 1, so the cattle-cluster-agent
# this project's Rancher installs when importing eks-observability can register
# back to the server. Both clusters share one VPC, so this is a plain
# security-group rule, not a peering connection or a public endpoint - same
# pattern as terraform/21-cluster-observability/main.tf
# (aws_security_group.observability_alb), just in the other direction.
#
# Machine-to-machine agent traffic, not a browser login - this does not hit
# the Secure-cookie problem that ruled out a public Ingress for human access
# to Rancher (see gitops/platform/ingress/admin-ingress.yaml, the Rancher
# section). An internal-only ALB works fine here.
data "terraform_remote_state" "cluster_observability" {
  backend = "s3"

  config = {
    bucket  = "eks-tfstate-963626856932"
    key     = "cluster-observability/terraform.tfstate"
    region  = "ap-southeast-1"
    profile = "vitrandai-vib"
  }
}

resource "aws_security_group" "rancher_internal_alb" {
  name        = "${local.name}-rancher-internal-alb"
  description = "Internal ALB for Rancher cluster-agent registration, cluster 2 nodes only"
  vpc_id      = local.vpc_id

  tags = merge(local.tags, { Name = "${local.name}-rancher-internal-alb" })
}

resource "aws_vpc_security_group_ingress_rule" "rancher_from_cluster_observability" {
  security_group_id = aws_security_group.rancher_internal_alb.id

  description                  = "Rancher agent registration from cluster 2 nodes"
  referenced_security_group_id = data.terraform_remote_state.cluster_observability.outputs.node_security_group_id

  from_port   = 443
  to_port     = 443
  ip_protocol = "tcp"
}

resource "aws_vpc_security_group_egress_rule" "rancher_alb_to_targets" {
  security_group_id = aws_security_group.rancher_internal_alb.id

  description = "ALB to its own target (Rancher pod)"
  cidr_ipv4   = local.vpc_cidr
  ip_protocol = "-1"
}

resource "aws_vpc_security_group_ingress_rule" "node_from_rancher_internal_alb" {
  security_group_id = module.cluster.node_security_group_id

  description                  = "Rancher pod from its own internal ALB"
  referenced_security_group_id = aws_security_group.rancher_internal_alb.id
  from_port                    = 443
  to_port                      = 443
  ip_protocol                  = "tcp"
}

moved {
  from = module.eks
  to   = module.cluster.module.eks
}
