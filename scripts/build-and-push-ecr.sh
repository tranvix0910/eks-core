#!/usr/bin/env bash
# Build and push all ShopNow container images to AWS ECR Tokyo (ap-northeast-1)
# Uses docker buildx for linux/amd64 multi-architecture builds.

set -euo pipefail

PROFILE="${AWS_PROFILE:-vitrandai-vib}"
REGION="${AWS_REGION:-ap-northeast-1}"
ACCOUNT="$(aws sts get-caller-identity --profile "$PROFILE" --region "$REGION" --query Account --output text)"
ECR_REGISTRY="${ACCOUNT}.dkr.ecr.${REGION}.amazonaws.com"

echo "================================================================"
echo " AWS Account   : $ACCOUNT"
echo " Region        : $REGION"
echo " ECR Registry  : $ECR_REGISTRY"
echo "================================================================"
echo

echo "==> Step 1: Logging in to AWS ECR..."
aws ecr get-login-password --region "$REGION" --profile "$PROFILE" | \
  docker login --username AWS --password-stdin "$ECR_REGISTRY"
echo

# Get Workload ALB DNS for React frontend build argument
echo "==> Step 2: Discovering Workload ALB Endpoint..."
ALB_DNS=$(kubectl --context eks-workload get ingress -n argocd argocd -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
if [ -z "$ALB_DNS" ]; then
  echo "Warning: Could not discover ALB DNS from Ingress, falling back to localhost or manual endpoint."
  ALB_DNS="localhost"
fi
echo "    Workload ALB DNS: $ALB_DNS"
echo

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "==> Step 3: Building and pushing images..."

# 1. Frontend (Blue-Green)
echo "--- [1/7] Building Frontend ---"
(
  cd "$ROOT_DIR/apps/shopnow-frontend"
  docker buildx build --platform linux/amd64 \
    --build-arg REACT_APP_BASE_API_URL="http://${ALB_DNS}:5860" \
    -t "${ECR_REGISTRY}/shopnow/shopnow-frontend:v1.0.2_a48660f" \
    --push .
)

# 2. Discovery Server
echo "--- [2/7] Building Discovery Server ---"
(
  cd "$ROOT_DIR/apps/shopnow-discovery-server"
  docker buildx build --platform linux/amd64 \
    -t "${ECR_REGISTRY}/shopnow/shopnow-discovery-server:v1" \
    --push .
)

# 3. Config Server
echo "--- [3/7] Building Config Server ---"
(
  cd "$ROOT_DIR/apps/shopnow-config-server"
  docker buildx build --platform linux/amd64 \
    -t "${ECR_REGISTRY}/shopnow/shopnow-config-server:v1" \
    --push .
)

# 4. Product Service
echo "--- [4/7] Building Product Service ---"
(
  cd "$ROOT_DIR/apps/shopnow-product-service"
  docker buildx build --platform linux/amd64 \
    -t "${ECR_REGISTRY}/shopnow/shopnow-product-service:v1" \
    --push .
)

# 5. Shopping Cart Service
echo "--- [5/7] Building Shopping Cart Service ---"
(
  cd "$ROOT_DIR/apps/shopnow-shopping-cart-service"
  docker buildx build --platform linux/amd64 \
    -t "${ECR_REGISTRY}/shopnow/shopnow-shopping-cart-service:v1" \
    --push .
)

# 6. User Service
echo "--- [6/7] Building User Service ---"
(
  cd "$ROOT_DIR/apps/shopnow-user-service"
  docker buildx build --platform linux/amd64 \
    -t "${ECR_REGISTRY}/shopnow/shopnow-user-service:v1" \
    --push .
)

# 7. API Gateway
echo "--- [7/7] Building API Gateway ---"
(
  cd "$ROOT_DIR/apps/shopnow-backend/api-gateway"
  docker buildx build --platform linux/amd64 \
    -t "${ECR_REGISTRY}/shopnow/shopnow-api-gateway:v1" \
    -t "${ECR_REGISTRY}/shopnow/shopnow-api-gateway:v1.0.0_06f2a91" \
    --push .
)

echo
echo "================================================================"
echo " ALL 7 IMAGES BUILT AND PUSHED TO ECR TOKYO SUCCESSFULLY!"
echo "================================================================"
