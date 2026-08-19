resource "aws_route53_zone" "observability_internal" {
  name = "observability.internal"

  vpc {
    vpc_id = local.vpc_id
  }

  tags = local.tags
}

data "aws_lb" "observability_internal" {
  name = "k8s-eksobservabilityi-62b4eac120"
}

resource "aws_route53_record" "mimir" {
  zone_id = aws_route53_zone.observability_internal.zone_id
  name    = "mimir.observability.internal"
  type    = "A"

  alias {
    name                   = data.aws_lb.observability_internal.dns_name
    zone_id                = data.aws_lb.observability_internal.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "loki" {
  zone_id = aws_route53_zone.observability_internal.zone_id
  name    = "loki.observability.internal"
  type    = "A"

  alias {
    name                   = data.aws_lb.observability_internal.dns_name
    zone_id                = data.aws_lb.observability_internal.zone_id
    evaluate_target_health = true
  }
}
