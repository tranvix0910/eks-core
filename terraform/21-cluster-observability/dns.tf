# Private DNS for the internal ALB fronting Mimir/Loki - see tls.tf for why
# the certificate needs a stable name instead of the ALB's auto-generated
# hostname (SAN on observability-alb-tls is mimir.observability.internal /
# loki.observability.internal, not the ALB's own DNS name).
#
# Associated with the shared VPC only (not a public zone) - resolves from
# both clusters since they share one VPC (see README.md), which is exactly
# who needs it: cluster 1's Prometheus (remote_write) and Alloy (loki push).

resource "aws_route53_zone" "observability_internal" {
  name = "observability.internal"

  vpc {
    vpc_id = local.vpc_id
  }

  tags = local.tags
}

# BOOTSTRAP TEMP COMMENT (Tokyo rebuild): this ALB doesn't exist yet - it's
# created later by the AWS Load Balancer Controller from the Ingress objects
# in gitops/platform/observability/ingress/internal-ingress.yaml, a
# post-cluster GitOps step. The hardcoded name below is also stale (Singapore's
# ALB hash; a fresh cluster hashes to a different name). After deploying that
# Ingress, get the real name from `aws elbv2 describe-load-balancers`, update
# the name below, then re-enable and re-apply this layer.
# data "aws_lb" "observability_internal" {
#   name = "k8s-eksobservabilityi-62b4eac120"
# }
#
# resource "aws_route53_record" "mimir" {
#   zone_id = aws_route53_zone.observability_internal.zone_id
#   name    = "mimir.observability.internal"
#   type    = "A"
#
#   alias {
#     name                   = data.aws_lb.observability_internal.dns_name
#     zone_id                = data.aws_lb.observability_internal.zone_id
#     evaluate_target_health = true
#   }
# }
#
# resource "aws_route53_record" "loki" {
#   zone_id = aws_route53_zone.observability_internal.zone_id
#   name    = "loki.observability.internal"
#   type    = "A"
#
#   alias {
#     name                   = data.aws_lb.observability_internal.dns_name
#     zone_id                = data.aws_lb.observability_internal.zone_id
#     evaluate_target_health = true
#   }
# }
