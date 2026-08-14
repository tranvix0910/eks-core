# Terraform Infrastructure — EKS Core Platform

Terraform infrastructure is segmented by blast radius. Changes at the Node or Cluster layer never impact the underlying Network (VPC) layer.

| Layer | Responsibility | S3 State File (`eks-tfstate-963626856932`) |
|---|---|---|
| **`10-network`** | VPC `10.20.0.0/16`, Subnets, 1 NAT Gateway, VPC Endpoints, Subnet Tags, Flow Logs | `network/terraform.tfstate` |
| **`20-cluster-workload`** | EKS `eks-workload`, Managed Node Group `infra`, IAM, SQS, ECR, EFS, Pod Identity | `cluster-workload/terraform.tfstate` |
| **`21-cluster-observability`** | EKS `eks-observability`, Managed Node Group `monitoring`, S3 Buckets Mimir/Loki, 2-hop SG | `cluster-observability/terraform.tfstate` |

Layers consume outputs from preceding layers via `terraform_remote_state`. Never duplicate values output by an earlier layer.

---

## File Structure Conventions

```
versions.tf        Declares Terraform and provider version constraints
backend.tf         Configures S3 backend and DynamoDB lock table
variables.tf       Input variable declarations
locals.tf          Calculated values, resource naming, and tags
main.tf            Primary AWS resource declarations
outputs.tf         Outputs consumed by subsequent layers
terraform.tfvars   Environment-specific input values
```

---

## Deployment Workflow

```bash
export AWS_PROFILE=vitrandai-vib
cd terraform/10-network
terraform init
terraform plan
terraform apply -auto-approve
```

See the detailed operational runbook at [docs/06-operations/01-tokyo-region-migration-runbook.md](file:///Users/vi.trandai/0%20-%20VIB/VIB%20EKS%20Core/docs/06-operations/01-tokyo-region-migration-runbook.md).
