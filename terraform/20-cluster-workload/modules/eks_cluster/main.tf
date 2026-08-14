# Shared EKS cluster wrapper.
#
# Holds the conventions that must be identical across both clusters: prefix
# delegation, the CoreDNS toleration, access entries instead of aws-auth, and
# the per-cluster Karpenter discovery tag.
#
# Callers supply only what actually differs between clusters.

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 21.0"

  name               = var.name
  kubernetes_version = var.kubernetes_version

  vpc_id     = var.vpc_id
  subnet_ids = var.subnet_ids

  endpoint_public_access  = var.endpoint_public_access
  endpoint_private_access = true

  # Grants the identity running terraform cluster-admin through an access entry,
  # so there is no aws-auth ConfigMap to hand-edit.
  enable_cluster_creator_admin_permissions = true

  enabled_log_types = var.enabled_log_types

  addons = {
    coredns = {
      configuration_values = jsonencode({
        tolerations = [{
          key      = "CriticalAddonsOnly"
          operator = "Exists"
          effect   = "NoSchedule"
        }]
      })
    }

    kube-proxy = {}

    vpc-cni = {
      before_compute = true
      configuration_values = jsonencode({
        env = var.enable_prefix_delegation ? {
          ENABLE_PREFIX_DELEGATION = "true"
          WARM_PREFIX_TARGET       = "1"
        } : {}
      })
    }

    eks-pod-identity-agent = {
      before_compute = true
    }

    # Required for any PersistentVolumeClaim backed by EBS.
    #
    # The gp2 StorageClass EKS creates by default still points at the in-tree
    # kubernetes.io/aws-ebs provisioner, which was removed from Kubernetes in
    # 1.27. Without this driver those PVCs sit Pending forever with no useful
    # event to explain why.
    aws-ebs-csi-driver = {}

    # For the ShopNow microservices' ReadWriteMany volumes. IAM comes from the
    # efs_csi_pod_identity module in the calling stack's main.tf.
    #
    # OVERWRITE because the cluster already carries a CSIDriver efs.csi.aws.com
    # left behind by a hand-run kubectl apply. The add-on creates that same
    # object, and without this the install fails on a field ownership conflict
    # instead of adopting it.
    aws-efs-csi-driver = {
      resolve_conflicts_on_create = "OVERWRITE"
    }
  }

  eks_managed_node_groups = var.node_groups

  node_security_group_tags = var.enable_karpenter_discovery ? {
    "karpenter.sh/discovery" = var.name
  } : {}

  node_security_group_additional_rules = merge(
    var.enable_efs_egress ? {
      egress_nfs = {
        description = "NFS to EFS mount targets"
        protocol    = "tcp"
        from_port   = 2049
        to_port     = 2049
        type        = "egress"
        cidr_blocks = [var.vpc_cidr]
      }
    } : {},
    {
      for port in var.extension_apiserver_ports : "ingress_extension_apiserver_${port}" => {
        description                   = "Control plane to extension apiserver on ${port}"
        protocol                      = "tcp"
        from_port                     = port
        to_port                       = port
        type                          = "ingress"
        source_cluster_security_group = true
      }
    }
  )

  tags = var.tags
}
