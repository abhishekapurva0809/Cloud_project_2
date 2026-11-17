/**
 * KubePulse - Realistic Mock Kubernetes Cluster Data
 * Structured for future integration with Python FastAPI and Kubernetes API.
 */

export const mockClusterStatus = {
  name: "kubepulse-prod-eu-west-01",
  provider: "Amazon Web Services (EKS / EC2)",
  region: "eu-west-1",
  kubernetesVersion: "v1.31.2",
  apiServerStatus: "Healthy",
  apiServerLatencyMs: 14,
  etcdStatus: "Healthy (3/3 Quorum)",
  schedulerStatus: "Healthy",
  controllerManagerStatus: "Healthy",
  coreDnsStatus: "Ready (2/2)",
  networkPlugin: "Cilium eBPF v1.16",
  clusterHealthScore: 98.6,
  totalNodes: 5,
  readyNodes: 5,
  totalPods: 28,
  runningPods: 23,
  pendingPods: 3,
  failedPods: 2,
  cpuCapacityCores: 64,
  cpuUsageCores: 38.4,
  cpuUsagePercent: 60.0,
  memoryCapacityGiB: 256,
  memoryUsageGiB: 168.9,
  memoryUsagePercent: 66.0,
  podCapacity: 150,
  uptime: "42d 18h 33m",
  lastUpdated: new Date().toISOString()
};

export const mockNodes = [
  {
    id: "node-control-plane-01",
    name: "k8s-master-01",
    role: "Control Plane",
    status: "Ready",
    internalIp: "10.0.1.10",
    externalIp: "34.241.80.12",
    kubeletVersion: "v1.31.2",
    osImage: "Ubuntu 24.04 LTS (Noble)",
    kernelVersion: "6.8.0-45-generic",
    containerRuntime: "containerd://1.7.20",
    zone: "eu-west-1a",
    instanceType: "m6i.2xlarge",
    cpuCores: 8,
    cpuUsagePercent: 34,
    cpuUsedCores: 2.7,
    memoryGiB: 32,
    memoryUsagePercent: 48,
    memoryUsedGiB: 15.3,
    podCount: 6,
    maxPods: 30,
    uptime: "42d 18h",
    conditions: {
      Ready: true,
      MemoryPressure: false,
      DiskPressure: false,
      PIDPressure: false,
      NetworkUnavailable: false
    },
    labels: {
      "node-role.kubernetes.io/control-plane": "",
      "topology.kubernetes.io/zone": "eu-west-1a"
    },
    position3D: { x: 0, y: 0, z: 0 }
  },
  {
    id: "node-worker-01",
    name: "k8s-worker-01",
    role: "Worker",
    status: "Ready",
    internalIp: "10.0.2.14",
    externalIp: "34.242.11.90",
    kubeletVersion: "v1.31.2",
    osImage: "Ubuntu 24.04 LTS",
    kernelVersion: "6.8.0-45-generic",
    containerRuntime: "containerd://1.7.20",
    zone: "eu-west-1a",
    instanceType: "c6i.4xlarge",
    cpuCores: 16,
    cpuUsagePercent: 78,
    cpuUsedCores: 12.4,
    memoryGiB: 64,
    memoryUsagePercent: 82,
    memoryUsedGiB: 52.4,
    podCount: 8,
    maxPods: 40,
    uptime: "28d 04h",
    conditions: {
      Ready: true,
      MemoryPressure: false,
      DiskPressure: false,
      PIDPressure: false,
      NetworkUnavailable: false
    },
    labels: {
      "node-role.kubernetes.io/worker": "",
      "topology.kubernetes.io/zone": "eu-west-1a",
      "workload": "api-gateway"
    },
    position3D: { x: -8, y: 0, z: -4 }
  },
  {
    id: "node-worker-02",
    name: "k8s-worker-02",
    role: "Worker",
    status: "Ready",
    internalIp: "10.0.2.18",
    externalIp: "34.242.12.45",
    kubeletVersion: "v1.31.2",
    osImage: "Ubuntu 24.04 LTS",
    kernelVersion: "6.8.0-45-generic",
    containerRuntime: "containerd://1.7.20",
    zone: "eu-west-1b",
    instanceType: "c6i.4xlarge",
    cpuCores: 16,
    cpuUsagePercent: 62,
    cpuUsedCores: 9.9,
    memoryGiB: 64,
    memoryUsagePercent: 68,
    memoryUsedGiB: 43.5,
    podCount: 6,
    maxPods: 40,
    uptime: "28d 04h",
    conditions: {
      Ready: true,
      MemoryPressure: false,
      DiskPressure: false,
      PIDPressure: false,
      NetworkUnavailable: false
    },
    labels: {
      "node-role.kubernetes.io/worker": "",
      "topology.kubernetes.io/zone": "eu-west-1b",
      "workload": "microservices"
    },
    position3D: { x: 8, y: 0, z: -4 }
  },
  {
    id: "node-worker-03",
    name: "k8s-worker-03",
    role: "Worker",
    status: "Ready",
    internalIp: "10.0.3.22",
    externalIp: "34.243.55.81",
    kubeletVersion: "v1.31.2",
    osImage: "Ubuntu 24.04 LTS",
    kernelVersion: "6.8.0-45-generic",
    containerRuntime: "containerd://1.7.20",
    zone: "eu-west-1b",
    instanceType: "m6i.4xlarge",
    cpuCores: 16,
    cpuUsagePercent: 44,
    cpuUsedCores: 7.0,
    memoryGiB: 64,
    memoryUsagePercent: 59,
    memoryUsedGiB: 37.7,
    podCount: 5,
    maxPods: 40,
    uptime: "14d 11h",
    conditions: {
      Ready: true,
      MemoryPressure: false,
      DiskPressure: false,
      PIDPressure: false,
      NetworkUnavailable: false
    },
    labels: {
      "node-role.kubernetes.io/worker": "",
      "topology.kubernetes.io/zone": "eu-west-1b",
      "workload": "analytics"
    },
    position3D: { x: -6, y: 0, z: 7 }
  },
  {
    id: "node-worker-edge-04",
    name: "k8s-worker-edge-04",
    role: "Edge Worker",
    status: "Ready",
    internalIp: "10.0.4.55",
    externalIp: "34.244.92.17",
    kubeletVersion: "v1.31.2",
    osImage: "Ubuntu 24.04 LTS",
    kernelVersion: "6.8.0-45-generic",
    containerRuntime: "containerd://1.7.20",
    zone: "eu-west-1c",
    instanceType: "m6i.2xlarge",
    cpuCores: 8,
    cpuUsagePercent: 81,
    cpuUsedCores: 6.4,
    memoryGiB: 32,
    memoryUsagePercent: 63,
    memoryUsedGiB: 20.1,
    podCount: 3,
    maxPods: 20,
    uptime: "7d 22h",
    conditions: {
      Ready: true,
      MemoryPressure: false,
      DiskPressure: false,
      PIDPressure: false,
      NetworkUnavailable: false
    },
    labels: {
      "node-role.kubernetes.io/edge": "",
      "topology.kubernetes.io/zone": "eu-west-1c",
      "workload": "ai-inference"
    },
    position3D: { x: 6, y: 0, z: 7 }
  }
];

export const mockPods = [
  // k8s-master-01 (Control Plane)
  {
    id: "pod-kube-apiserver",
    name: "kube-apiserver-master-01",
    namespace: "kube-system",
    node: "k8s-master-01",
    status: "Running",
    ip: "10.0.1.10",
    restarts: 0,
    cpuUsage: "380m",
    cpuPercent: 38,
    memoryUsage: "890Mi",
    memoryPercent: 44,
    age: "42d",
    containers: [
      { name: "kube-apiserver", image: "registry.k8s.io/kube-apiserver:v1.31.2", ready: true, restartCount: 0 }
    ],
    labels: { tier: "control-plane", component: "kube-apiserver" },
    localPos: { x: -0.7, y: 0.8, z: -0.7 }
  },
  {
    id: "pod-etcd",
    name: "etcd-master-01",
    namespace: "kube-system",
    node: "k8s-master-01",
    status: "Running",
    ip: "10.0.1.10",
    restarts: 0,
    cpuUsage: "210m",
    cpuPercent: 21,
    memoryUsage: "640Mi",
    memoryPercent: 32,
    age: "42d",
    containers: [
      { name: "etcd", image: "registry.k8s.io/etcd:3.5.15-0", ready: true, restartCount: 0 }
    ],
    labels: { tier: "control-plane", component: "etcd" },
    localPos: { x: 0.7, y: 0.8, z: -0.7 }
  },
  {
    id: "pod-kube-controller",
    name: "kube-controller-manager-master-01",
    namespace: "kube-system",
    node: "k8s-master-01",
    status: "Running",
    ip: "10.0.1.10",
    restarts: 1,
    cpuUsage: "160m",
    cpuPercent: 16,
    memoryUsage: "410Mi",
    memoryPercent: 20,
    age: "42d",
    containers: [
      { name: "kube-controller-manager", image: "registry.k8s.io/kube-controller-manager:v1.31.2", ready: true, restartCount: 1 }
    ],
    labels: { tier: "control-plane", component: "kube-controller-manager" },
    localPos: { x: 0, y: 0.8, z: 0.8 }
  },

  // k8s-worker-01 (API Gateway & Core Web)
  {
    id: "pod-ingress-nginx-1",
    name: "ingress-nginx-controller-7f44d8-j9x2q",
    namespace: "ingress-nginx",
    node: "k8s-worker-01",
    status: "Running",
    ip: "10.244.1.15",
    restarts: 0,
    cpuUsage: "420m",
    cpuPercent: 42,
    memoryUsage: "780Mi",
    memoryPercent: 39,
    age: "18d",
    containers: [
      { name: "controller", image: "registry.k8s.io/ingress-nginx/controller:v1.11.2", ready: true, restartCount: 0 }
    ],
    labels: { app: "ingress-nginx", component: "controller" },
    localPos: { x: -1.2, y: 0.7, z: -1.0 }
  },
  {
    id: "pod-api-gateway-1",
    name: "api-gateway-v2-56c879d48-8r7kp",
    namespace: "production",
    node: "k8s-worker-01",
    status: "Running",
    ip: "10.244.1.22",
    restarts: 0,
    cpuUsage: "310m",
    cpuPercent: 31,
    memoryUsage: "520Mi",
    memoryPercent: 26,
    age: "12d",
    containers: [
      { name: "gateway", image: "quay.io/kubepulse/api-gateway:v2.4.1", ready: true, restartCount: 0 }
    ],
    labels: { app: "api-gateway", env: "production" },
    localPos: { x: 0, y: 0.7, z: -1.2 }
  },
  {
    id: "pod-auth-service-1",
    name: "auth-service-774dfc989b-m9s8k",
    namespace: "production",
    node: "k8s-worker-01",
    status: "Running",
    ip: "10.244.1.33",
    restarts: 2,
    cpuUsage: "180m",
    cpuPercent: 18,
    memoryUsage: "390Mi",
    memoryPercent: 19,
    age: "8d",
    containers: [
      { name: "auth", image: "quay.io/kubepulse/auth-service:v1.8.0", ready: true, restartCount: 2 }
    ],
    labels: { app: "auth-service", env: "production" },
    localPos: { x: 1.2, y: 0.7, z: -1.0 }
  },
  {
    id: "pod-payment-service-fail",
    name: "payment-processor-6c68bf764-crash",
    namespace: "production",
    node: "k8s-worker-01",
    status: "Failed",
    ip: "10.244.1.78",
    restarts: 14,
    cpuUsage: "0m",
    cpuPercent: 0,
    memoryUsage: "12Mi",
    memoryPercent: 2,
    age: "4h 12m",
    failureReason: "CrashLoopBackOff: exit code 137 (OOMKilled)",
    containers: [
      { name: "payment-worker", image: "quay.io/kubepulse/payment:v3.1.0", ready: false, restartCount: 14 }
    ],
    labels: { app: "payment-processor", env: "production", tier: "financial" },
    localPos: { x: -1.2, y: 0.7, z: 0.8 }
  },
  {
    id: "pod-redis-sentinel-1",
    name: "redis-sentinel-cluster-0",
    namespace: "production",
    node: "k8s-worker-01",
    status: "Running",
    ip: "10.244.1.41",
    restarts: 0,
    cpuUsage: "95m",
    cpuPercent: 9,
    memoryUsage: "310Mi",
    memoryPercent: 15,
    age: "28d",
    containers: [
      { name: "redis", image: "docker.io/library/redis:7.4-alpine", ready: true, restartCount: 0 }
    ],
    labels: { app: "redis-cache", role: "sentinel" },
    localPos: { x: 0, y: 0.7, z: 0.8 }
  },
  {
    id: "pod-prometheus-node-exporter-1",
    name: "node-exporter-daemon-z7x2k",
    namespace: "monitoring",
    node: "k8s-worker-01",
    status: "Running",
    ip: "10.0.2.14",
    restarts: 0,
    cpuUsage: "45m",
    cpuPercent: 4,
    memoryUsage: "110Mi",
    memoryPercent: 5,
    age: "28d",
    containers: [
      { name: "node-exporter", image: "quay.io/prometheus/node-exporter:v1.8.2", ready: true, restartCount: 0 }
    ],
    labels: { app: "node-exporter", component: "telemetry" },
    localPos: { x: 1.2, y: 0.7, z: 0.8 }
  },

  // k8s-worker-02 (Microservices)
  {
    id: "pod-user-service-1",
    name: "user-profile-svc-5c75bfd49-4kl8w",
    namespace: "production",
    node: "k8s-worker-02",
    status: "Running",
    ip: "10.244.2.12",
    restarts: 0,
    cpuUsage: "220m",
    cpuPercent: 22,
    memoryUsage: "450Mi",
    memoryPercent: 22,
    age: "14d",
    containers: [
      { name: "user-svc", image: "quay.io/kubepulse/user-profile:v1.4.0", ready: true, restartCount: 0 }
    ],
    labels: { app: "user-service", tier: "backend" },
    localPos: { x: -1.0, y: 0.7, z: -0.9 }
  },
  {
    id: "pod-catalog-service-1",
    name: "catalog-inventory-789cfb6df-8jjx9",
    namespace: "production",
    node: "k8s-worker-02",
    status: "Running",
    ip: "10.244.2.19",
    restarts: 0,
    cpuUsage: "190m",
    cpuPercent: 19,
    memoryUsage: "380Mi",
    memoryPercent: 19,
    age: "14d",
    containers: [
      { name: "catalog", image: "quay.io/kubepulse/catalog:v2.0.1", ready: true, restartCount: 0 }
    ],
    labels: { app: "catalog-inventory", tier: "backend" },
    localPos: { x: 1.0, y: 0.7, z: -0.9 }
  },
  {
    id: "pod-notification-worker-pending",
    name: "notification-dispatcher-99fb77d-sched",
    namespace: "production",
    node: "k8s-worker-02",
    status: "Pending",
    ip: "Pending",
    restarts: 0,
    cpuUsage: "0m",
    cpuPercent: 0,
    memoryUsage: "0Mi",
    memoryPercent: 0,
    age: "3m 40s",
    failureReason: "0/5 nodes available: Insufficient memory/affinity matching in progress",
    containers: [
      { name: "dispatcher", image: "quay.io/kubepulse/notifier:v1.9.0", ready: false, restartCount: 0 }
    ],
    labels: { app: "notification-dispatcher", tier: "async-worker" },
    localPos: { x: -1.0, y: 0.7, z: 0.9 }
  },
  {
    id: "pod-order-service-1",
    name: "order-orchestrator-6789bfb-k98sq",
    namespace: "production",
    node: "k8s-worker-02",
    status: "Running",
    ip: "10.244.2.44",
    restarts: 1,
    cpuUsage: "340m",
    cpuPercent: 34,
    memoryUsage: "620Mi",
    memoryPercent: 31,
    age: "11d",
    containers: [
      { name: "order-service", image: "quay.io/kubepulse/order-service:v2.2.0", ready: true, restartCount: 1 }
    ],
    labels: { app: "order-orchestrator", tier: "backend" },
    localPos: { x: 1.0, y: 0.7, z: 0.9 }
  },
  {
    id: "pod-rabbitmq-cluster-0",
    name: "rabbitmq-ha-broker-0",
    namespace: "messaging",
    node: "k8s-worker-02",
    status: "Running",
    ip: "10.244.2.61",
    restarts: 0,
    cpuUsage: "280m",
    cpuPercent: 28,
    memoryUsage: "1120Mi",
    memoryPercent: 56,
    age: "28d",
    containers: [
      { name: "rabbitmq", image: "docker.io/library/rabbitmq:3.13-management", ready: true, restartCount: 0 }
    ],
    labels: { app: "rabbitmq", role: "message-broker" },
    localPos: { x: 0, y: 0.7, z: 0 }
  },

  // k8s-worker-03 (Data, Analytics & Monitoring)
  {
    id: "pod-prometheus-server",
    name: "prometheus-server-k8s-5487fc5d7-v7r99",
    namespace: "monitoring",
    node: "k8s-worker-03",
    status: "Running",
    ip: "10.244.3.11",
    restarts: 0,
    cpuUsage: "480m",
    cpuPercent: 48,
    memoryUsage: "1840Mi",
    memoryPercent: 72,
    age: "14d",
    containers: [
      { name: "prometheus", image: "quay.io/prometheus/prometheus:v2.54.1", ready: true, restartCount: 0 }
    ],
    labels: { app: "prometheus", component: "server" },
    localPos: { x: -1.0, y: 0.7, z: -0.8 }
  },
  {
    id: "pod-grafana-dashboard",
    name: "grafana-telemetry-ui-6799db6cf-r45kw",
    namespace: "monitoring",
    node: "k8s-worker-03",
    status: "Running",
    ip: "10.244.3.16",
    restarts: 0,
    cpuUsage: "110m",
    cpuPercent: 11,
    memoryUsage: "320Mi",
    memoryPercent: 16,
    age: "14d",
    containers: [
      { name: "grafana", image: "docker.io/grafana/grafana:11.2.0", ready: true, restartCount: 0 }
    ],
    labels: { app: "grafana", component: "dashboard" },
    localPos: { x: 1.0, y: 0.7, z: -0.8 }
  },
  {
    id: "pod-loki-logger-pending",
    name: "loki-distributed-ingester-0-rolling",
    namespace: "monitoring",
    node: "k8s-worker-03",
    status: "Pending",
    ip: "10.244.3.92",
    restarts: 0,
    cpuUsage: "80m",
    cpuPercent: 8,
    memoryUsage: "240Mi",
    memoryPercent: 12,
    age: "1m 15s",
    failureReason: "ContainerCreating: pull image grafana/loki:3.1.1 in progress",
    containers: [
      { name: "ingester", image: "docker.io/grafana/loki:3.1.1", ready: false, restartCount: 0 }
    ],
    labels: { app: "loki", component: "ingester" },
    localPos: { x: -1.0, y: 0.7, z: 0.8 }
  },
  {
    id: "pod-clickhouse-analytics-1",
    name: "clickhouse-olap-cluster-0",
    namespace: "analytics",
    node: "k8s-worker-03",
    status: "Running",
    ip: "10.244.3.38",
    restarts: 0,
    cpuUsage: "650m",
    cpuPercent: 65,
    memoryUsage: "2400Mi",
    memoryPercent: 78,
    age: "14d",
    containers: [
      { name: "clickhouse", image: "docker.io/clickhouse/clickhouse-server:24.8", ready: true, restartCount: 0 }
    ],
    labels: { app: "clickhouse", role: "olap-db" },
    localPos: { x: 1.0, y: 0.7, z: 0.8 }
  },

  // k8s-worker-edge-04 (AI Inference & Edge processing)
  {
    id: "pod-ai-inference-llm",
    name: "vllm-inference-engine-79bf9c56-k8swq",
    namespace: "ai-workloads",
    node: "k8s-worker-edge-04",
    status: "Running",
    ip: "10.244.4.15",
    restarts: 1,
    cpuUsage: "850m",
    cpuPercent: 85,
    memoryUsage: "3400Mi",
    memoryPercent: 88,
    age: "7d",
    containers: [
      { name: "vllm-server", image: "quay.io/vllm/vllm-openai:v0.6.1", ready: true, restartCount: 1 }
    ],
    labels: { app: "vllm", accelerator: "gpu-sim", workload: "llm-serving" },
    localPos: { x: -0.9, y: 0.7, z: -0.6 }
  },
  {
    id: "pod-embeddings-worker-fail",
    name: "vector-embeddings-worker-crash-892",
    namespace: "ai-workloads",
    node: "k8s-worker-edge-04",
    status: "Failed",
    ip: "10.244.4.29",
    restarts: 8,
    cpuUsage: "0m",
    cpuPercent: 0,
    memoryUsage: "18Mi",
    memoryPercent: 1,
    age: "2h 45m",
    failureReason: "Error: CUDA runtime initialization failed / device busy",
    containers: [
      { name: "embedder", image: "quay.io/kubepulse/embedder:v1.2", ready: false, restartCount: 8 }
    ],
    labels: { app: "vector-embeddings", workload: "ai" },
    localPos: { x: 0.9, y: 0.7, z: -0.6 }
  },
  {
    id: "pod-websocket-streamer-pending",
    name: "ws-realtime-gateway-new-rollout",
    namespace: "production",
    node: "k8s-worker-edge-04",
    status: "Pending",
    ip: "10.244.4.40",
    restarts: 0,
    cpuUsage: "50m",
    cpuPercent: 5,
    memoryUsage: "120Mi",
    memoryPercent: 6,
    age: "45s",
    failureReason: "Init:0/1 - Initializing network security sidecar",
    containers: [
      { name: "streamer", image: "quay.io/kubepulse/streamer:v2.1", ready: false, restartCount: 0 }
    ],
    labels: { app: "ws-realtime-gateway", env: "production" },
    localPos: { x: 0, y: 0.7, z: 0.7 }
  }
];

export const mockDeployments = [
  {
    name: "api-gateway-v2",
    namespace: "production",
    readyReplicas: 2,
    desiredReplicas: 2,
    upToDateReplicas: 2,
    availableReplicas: 2,
    strategy: "RollingUpdate (maxSurge: 25%, maxUnavailable: 0)",
    age: "34d",
    conditions: "Available, Progressing"
  },
  {
    name: "ingress-nginx-controller",
    namespace: "ingress-nginx",
    readyReplicas: 2,
    desiredReplicas: 2,
    upToDateReplicas: 2,
    availableReplicas: 2,
    strategy: "RollingUpdate",
    age: "42d",
    conditions: "Available"
  },
  {
    name: "auth-service",
    namespace: "production",
    readyReplicas: 2,
    desiredReplicas: 2,
    upToDateReplicas: 2,
    availableReplicas: 2,
    strategy: "RollingUpdate",
    age: "24d",
    conditions: "Available"
  },
  {
    name: "payment-processor",
    namespace: "production",
    readyReplicas: 1,
    desiredReplicas: 2,
    upToDateReplicas: 1,
    availableReplicas: 1,
    strategy: "RollingUpdate",
    age: "18d",
    conditions: "ReplicaFailure (Degraded)"
  },
  {
    name: "vllm-inference-engine",
    namespace: "ai-workloads",
    readyReplicas: 1,
    desiredReplicas: 1,
    upToDateReplicas: 1,
    availableReplicas: 1,
    strategy: "Recreate",
    age: "12d",
    conditions: "Available"
  },
  {
    name: "notification-dispatcher",
    namespace: "production",
    readyReplicas: 0,
    desiredReplicas: 1,
    upToDateReplicas: 1,
    availableReplicas: 0,
    strategy: "RollingUpdate",
    age: "5d",
    conditions: "Progressing (SchedulingPending)"
  }
];

export const mockMetricsTimeline = {
  timestamps: ["10:00", "10:10", "10:20", "10:30", "10:40", "10:50", "11:00", "11:10", "11:20", "11:30", "11:40", "11:50"],
  cpuUtilizationPercent: [52, 55, 58, 64, 61, 59, 67, 72, 69, 63, 60, 61],
  memoryUtilizationPercent: [61, 62, 62, 64, 65, 65, 66, 68, 67, 66, 66, 66],
  runningPods: [24, 24, 23, 23, 24, 24, 23, 23, 22, 23, 23, 23],
  failedPods: [1, 1, 2, 2, 1, 1, 2, 2, 3, 2, 2, 2],
  networkIngressMbps: [420, 480, 510, 680, 630, 590, 740, 890, 810, 670, 610, 635],
  networkEgressMbps: [380, 410, 430, 560, 520, 490, 620, 710, 680, 550, 510, 530]
};

export const mockActivityLogs = [
  {
    id: "log-1",
    timestamp: "11:49:12",
    type: "pod_restarted",
    level: "warning",
    resource: "payment-processor-6c68bf764-crash",
    namespace: "production",
    message: "Container payment-worker restarted (exit code 137: OOMKilled). Initiating exponential backoff.",
    details: "Limits: 512Mi, Required: 620Mi. Pod scheduled on node k8s-worker-01."
  },
  {
    id: "log-2",
    timestamp: "11:48:30",
    type: "pod_created",
    level: "info",
    resource: "ws-realtime-gateway-new-rollout",
    namespace: "production",
    message: "Pod created by ReplicaSet ws-realtime-gateway-7b98. Assigned to node k8s-worker-edge-04.",
    details: "Image pull successful: quay.io/kubepulse/streamer:v2.1"
  },
  {
    id: "log-3",
    timestamp: "11:47:04",
    type: "deployment_updated",
    level: "info",
    resource: "ingress-nginx-controller",
    namespace: "ingress-nginx",
    message: "Deployment ingress-nginx updated rollout status: 2/2 replicas up-to-date and serving traffic.",
    details: "ConfigMap ingress-controller-custom-headers reloaded dynamically."
  },
  {
    id: "log-4",
    timestamp: "11:44:18",
    type: "node_ready",
    level: "success",
    resource: "k8s-worker-03",
    namespace: "cluster",
    message: "Node k8s-worker-03 condition KubeletReady set to True. Flannel CNI mesh synchronized.",
    details: "All system daemons reported status OK. 5 pods running."
  },
  {
    id: "log-5",
    timestamp: "11:41:55",
    type: "pod_failed",
    level: "error",
    resource: "vector-embeddings-worker-crash-892",
    namespace: "ai-workloads",
    message: "Pod terminated abnormally. Reason: CUDA initialization error: CUDA driver version insufficient.",
    details: "Container embedder exited with code 1. Pending operator inspection."
  },
  {
    id: "log-6",
    timestamp: "11:38:02",
    type: "pod_deleted",
    level: "info",
    resource: "temp-batch-job-cleanup-998x",
    namespace: "default",
    message: "Completed Job batch-cleanup. Garbage collector terminated pod successfully.",
    details: "TTL controller cleaned up dead pods."
  },
  {
    id: "log-7",
    timestamp: "11:32:40",
    type: "node_unavailable",
    level: "warning",
    resource: "k8s-worker-edge-04",
    namespace: "cluster",
    message: "Node k8s-worker-edge-04 reported MemoryPressure spike (88%). Eviction manager on alert.",
    details: "Cgroup v2 memory throttling engaged for low-priority pods."
  },
  {
    id: "log-8",
    timestamp: "11:28:10",
    type: "pod_created",
    level: "info",
    resource: "notification-dispatcher-99fb77d-sched",
    namespace: "production",
    message: "Pod scheduled: notification-dispatcher. Awaiting node resource allocation.",
    details: "Requested 500m CPU, 1024Mi memory."
  }
];

export const samplePodLogs = {
  "payment-processor-6c68bf764-crash": [
    `2026-11-09T11:48:58.120Z [INFO]  payment-core: Initializing stripe/adyen gateway connectors...`,
    `2026-11-09T11:49:01.442Z [INFO]  payment-core: Loading cryptographic keys from /vault/secrets/tls.key`,
    `2026-11-09T11:49:03.901Z [DEBUG] payment-core: Worker pool spawned with 16 parallel dispatchers`,
    `2026-11-09T11:49:08.520Z [WARN]  payment-core: Heap allocation surged: 498MiB / 512MiB limit`,
    `2026-11-09T11:49:10.890Z [FATAL] payment-core: OutOfMemoryError: Java heap space / container exceeded cgroup limit`,
    `2026-11-09T11:49:11.002Z [SYS]   kernel: [98341.22] oom-killer: killed process 4921 (java) total-vm:849200kB, anon-rss:524288kB`,
    `2026-11-09T11:49:12.100Z [INFO]  kubelet: Container payment-worker failed liveness probe. Restarting...`
  ],
  "api-gateway-v2-56c879d48-8r7kp": [
    `2026-11-09T11:45:00.100Z [INFO]  gateway: Envoy proxy initialized, listening on 0.0.0.0:8080`,
    `2026-11-09T11:46:12.421Z [INFO]  gateway: TLS certificate valid until 2027-04-12 (Let's Encrypt)`,
    `2026-11-09T11:47:33.910Z [INFO]  gateway: Ingress route registered: /api/v2/* -> service/api-gateway`,
    `2026-11-09T11:48:02.115Z [INFO]  gateway: Rate limiter: 12,400 requests/sec passing through smoothly`,
    `2026-11-09T11:49:15.820Z [DEBUG] gateway: Healthcheck OK (upstream latency: 3.2ms)`
  ],
  "default": [
    `2026-11-09T11:40:00.000Z [INFO]  service: Starting application runtime inside Kubernetes Pod...`,
    `2026-11-09T11:40:02.150Z [INFO]  service: Database connection established: postgres-cluster.internal:5432`,
    `2026-11-09T11:40:03.400Z [INFO]  service: Readiness and liveness probes responded HTTP 200 OK`,
    `2026-11-09T11:45:10.812Z [INFO]  service: Processing asynchronous events from RabbitMQ queue`,
    `2026-11-09T11:48:30.900Z [INFO]  service: Telemetry exporter pushing metrics to Prometheus`
  ]
};

export const samplePodYaml = (pod) => `apiVersion: v1
kind: Pod
metadata:
  name: ${pod.name}
  namespace: ${pod.namespace}
  labels:
${Object.entries(pod.labels || {}).map(([k, v]) => `    ${k}: "${v}"`).join('\n')}
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "9090"
spec:
  nodeName: ${pod.node}
  restartPolicy: Always
  containers:
  - name: ${pod.containers?.[0]?.name || 'main'}
    image: ${pod.containers?.[0]?.image || 'registry.k8s.io/pause:3.9'}
    resources:
      requests:
        cpu: ${pod.cpuUsage || '100m'}
        memory: ${pod.memoryUsage || '128Mi'}
      limits:
        cpu: 1000m
        memory: 1024Mi
    ports:
    - containerPort: 8080
      protocol: TCP
status:
  phase: ${pod.status}
  podIP: ${pod.ip}
  hostIP: ${pod.node}
  startTime: "${new Date(Date.now() - 3600000 * 24).toISOString()}"
`;
