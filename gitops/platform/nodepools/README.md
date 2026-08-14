# Karpenter Node Pools — Cluster `eks-workload`

| Manifest | NodePool Name | Capacity Type | Applied Taint | Target Workload |
|---|---|---|---|---|
| `nodepool-2-ondemand.yaml` | `ms-od` | On-Demand | `workload=microservices:NoSchedule` | ShopNow Microservices (Baseline SLA) |
| `nodepool-2-spot.yaml` | `ms-spot` | Spot | `workload=microservices:NoSchedule` | ShopNow Microservices (Scaling) |
| `nodepool-1-spot.yaml` | `batch-spot` | Spot Only | `workload=batch:NoSchedule` | Batch Jobs, Async Workers |
| `nodepool-3-arm64.yaml` | `arm64` | Mixed ARM64 | `arch=arm64:NoSchedule` | ARM64 / Graviton Workloads |

---

## 1:3 On-Demand to Spot Ratio

Karpenter has no native On-Demand/Spot ratio setting within a single NodePool. "NodePool 2" is constructed by pairing **2 independent NodePools (`ms-od` and `ms-spot`) sharing identical labels (`workload=microservices`) and matching taints**.

Karpenter fills `ms-od` (weight 100) first until hitting `limits.cpu`, then automatically overflows into `ms-spot` (weight 10).

```
ms-od    weight 100   limits.cpu 24   (~25% Peak Load, On-Demand)
ms-spot  weight  10   limits.cpu 72   (~75% Peak Load, Spot)
```

See the complete analysis at [docs/02-karpenter/03-on-demand-spot-ratio-and-limits.md](file:///Users/vi.trandai/0%20-%20VIB/VIB%20EKS%20Core/docs/02-karpenter/03-on-demand-spot-ratio-and-limits.md).

---

## Taints & NodeSelectors

`nodeSelector` directs Pods but does not reserve nodes. Without a `taint`, arbitrary Pods could land in Spot-only pools. Therefore, all NodePools and Pods enforce both configurations.
