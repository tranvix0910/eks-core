# EKS Core Platform

Multi-cluster Kubernetes infrastructure running 2 Amazon EKS clusters inside a shared Virtual Private Cloud (VPC) in the AWS Tokyo region (`ap-northeast-1`).

| Criterion | Cluster 1 (`eks-workload`) | Cluster 2 (`eks-observability`) |
|---|---|---|
| **Cluster Name** | `eks-workload` | `eks-observability` |
| **Purpose** | ShopNow Microservices & Platform Add-ons | Centralized Observability (Mimir, Loki, Grafana) |
| **Node Subnets** | `10.20.16.0/20`, `10.20.32.0/20`, `10.20.48.0/20` | `10.20.64.0/20`, `10.20.80.0/20`, `10.20.96.0/20` |
| **Karpenter Tag** | `karpenter.sh/discovery = eks-workload` | `karpenter.sh/discovery = eks-observability` |
| **Kubernetes Version** | `1.34` (platform `eks.31`) | `1.34` (platform `eks.31`) |

**Account**: `963626856932` · **Region**: `ap-northeast-1` · **VPC**: `10.20.0.0/16` (3 AZs: `1a`, `1c`, `1d`)

---

## Directory Structure

```
terraform/     AWS infrastructure (VPC, EKS, Node groups, S3, IAM, ECR, EFS).
gitops/        In-cluster Kubernetes manifests managed via ArgoCD and Helm.
apps/          ShopNow microservices source code (Spring Cloud Backend & React Frontend Rollout).
docs/          Comprehensive, production-grade technical documentation.
scripts/       Utility scripts for bootstrapping S3/DynamoDB backends and environment checks.
certs/         Internal TLS certificates extracted from cert-manager for AWS ACM.
```

---

## Ownership Boundaries

* **Terraform Owns**: All AWS cloud resources (VPC, EKS Control Planes, IAM, S3, ECR, EFS, Security Groups, EKS Pod Identity Associations).
* **GitOps / ArgoCD Owns**: All in-cluster resources (Karpenter NodePools, Ingresses, Platform Add-ons, Observability stack, and Microservices).

> [!IMPORTANT]
> Never use Terraform's `kubernetes` or `kubectl` providers to apply bulk in-cluster manifests, avoiding circular dependencies and broken plans before clusters exist.

---

## Deployment Sequence

```
10-network  ──>  20-cluster-workload  ──>  21-cluster-observability  ──>  GitOps & Add-ons
```

Platform add-ons and ShopNow applications are deployed in the order documented in [docs/01-platform-addons/01-gitops-bootstrap-order.md](file:///Users/vi.trandai/0%20-%20VIB/VIB%20EKS%20Core/docs/01-platform-addons/01-gitops-bootstrap-order.md).

---

## Technical Documentation Index

All technical documentation is organized by module in the [docs/](file:///Users/vi.trandai/0%20-%20VIB/VIB%20EKS%20Core/docs/README.md) directory:

* [docs/00-architecture/](file:///Users/vi.trandai/0%20-%20VIB/VIB%20EKS%20Core/docs/00-architecture/): Network architecture, 2 EKS clusters, SCP policies, and setup.
* [docs/01-platform-addons/](file:///Users/vi.trandai/0%20-%20VIB/VIB%20EKS%20Core/docs/01-platform-addons/): AWS Load Balancer Controller, cert-manager, Rancher NLB, Admin Ingress.
* [docs/02-karpenter/](file:///Users/vi.trandai/0%20-%20VIB/VIB%20EKS%20Core/docs/02-karpenter/): Karpenter architecture, EC2NodeClass, 4 NodePools, 1:3 On-Demand:Spot ratio.
* [docs/03-observability/](file:///Users/vi.trandai/0%20-%20VIB/VIB%20EKS%20Core/docs/03-observability/): Mimir Distributed, Loki Logs, Grafana Alloy, and Dashboards.
* [docs/04-apps-shopnow/](file:///Users/vi.trandai/0%20-%20VIB/VIB%20EKS%20Core/docs/04-apps-shopnow/): ShopNow Microservices, Spring Cloud Gateway, Argo Rollouts Blue-Green.
* [docs/05-security/](file:///Users/vi.trandai/0%20-%20VIB/VIB%20EKS%20Core/docs/05-security/): EKS Pod Identity, Access Entries, KMS Secrets, and TLS lifecycles.
* [docs/06-operations/](file:///Users/vi.trandai/0%20-%20VIB/VIB%20EKS%20Core/docs/06-operations/): Tokyo migration runbook, 32 incident catalogue, and verification guides.
