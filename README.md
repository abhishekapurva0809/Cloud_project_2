# KubePulse - Futuristic 3D Kubernetes Command Center

KubePulse is an interactive, cyberpunk-inspired 3D Kubernetes monitoring command center built with vanilla **HTML5, CSS3, and modern JavaScript (ES6+ Modules)**, powered by **Three.js** and **Chart.js**.

---

## ⚡ Features & Capabilities

### 1. Interactive 3D Kubernetes Cluster Environment (The Centerpiece)
- **Control Plane**: Floating holographic dodecahedron core with dual counter-rotating energy rings, wireframe cage, and central status aura.
- **Worker Nodes**: Radial hexagonal cyber platforms (`k8s-worker-01`, `k8s-worker-02`, `k8s-worker-03`, `k8s-worker-edge-04`) with glowing edge boundaries and telemetry pylons.
- **Pods with Status Indicators**:
  - 🟢 **Green**: Running pods (smooth ambient levitation)
  - 🔴 **Red**: Failed pods (pulsing emergency alert beacon)
  - 🟡 **Yellow**: Pending pods (slow rhythmic oscillation)
- **Animated Data Conduits**: Quadratic Bézier cyber-tubes connecting the Control Plane to Worker Nodes.
- **Network Packet Particles**: Continuous flowing particle streams along conduits simulating live Kubernetes network traffic.
- **Camera & Interaction Controls**:
  - OrbitControls (rotate, pan, zoom)
  - Raycaster hover tooltips with real-time specs
  - Click any Node or Pod to trigger smooth camera fly-to lerp animation and open the slide-out Telemetry HUD
  - Camera presets: **Overview**, **Control Plane**, **Worker Orbit**, **Top-Down Grid**, plus **Auto-Rotate** toggle.

### 2. Overview Dashboard
- **6 KPI Cards**: Total Nodes, Total Pods, Running Pods (with ratio), Failed Pods (with alert glow), Pending Pods, Cluster Health Score (98.6%).
- Quick telemetry bars for Cluster CPU and Memory allocation.
- Active Crash Diagnostic banner with 1-click container log inspection.

### 3. Kubernetes Monitoring (`#monitoring`)
- Cluster Architecture Specs: Kubernetes v1.31.2, API Latency 14ms, etcd Quorum 3/3, Cilium eBPF CNI, Uptime 42d 18h.
- Deployments Table: Replicas (ready/desired), strategy (RollingUpdate/Recreate), conditions.
- Top Restart Offenders with crash reasons (`OOMKilled`, CUDA runtime errors) and direct log viewer.

### 4. Pod Management (`#pods`)
- Searchable by pod name, namespace, or node.
- Status filters: **All**, **Running**, **Failed**, **Pending**.
- Namespace selector (`production`, `kube-system`, `monitoring`, `ingress-nginx`, `ai-workloads`, `messaging`).
- Interactive table with live CPU and Memory usage progress bars, restart counters, age, and quick actions:
  - 🔍 **Inspect**: Focuses camera in 3D and opens slide-out drawer
  - 📋 **Logs**: Opens live streaming terminal modal with syntax coloring
  - 🔄 **Restart**: Simulates rollout restart with animated transition
  - 🗑 **Delete**: Simulates pod eviction and removal

### 5. Node Monitoring (`#nodes`)
- Node cards displaying Role, Zone, Internal IP, Uptime, Kubelet version, OS/Kernel.
- Real-time CPU & Memory utilization progress gauges.
- Allocated pods vs node capacity.
- Node conditions: `Ready: True`, `MemoryPressure: False`, `DiskPressure: False`, `PIDPressure: False`.
- Interactive **Cordon / Uncordon** toggle action.

### 6. Analytics (`#analytics`)
- High-performance Chart.js visualizer with custom neon cyan and violet gradients:
  - CPU Utilization over time (%)
  - Memory Utilization over time (%)
  - Running Pods vs Failed Pods timeline
  - Network Ingress & Egress throughput (Mbps)
  - Hourly cluster API event frequency bar chart

### 7. Activity Logs (`#logs`)
- Live audit stream of cluster events (`pod_created`, `pod_deleted`, `pod_restarted`, `node_ready`, `node_unavailable`, `deployment_updated`).
- Stream pause/resume toggle.
- "Simulate Event" button to trigger realistic cluster mutations on demand.
- "Export JSON" button to download log events.

### 8. Cyber Audio Feedback
- Synthesized audio effects via the Web Audio API (sine, triangle, and sawtooth waves for clicks, selections, alerts, and successes), toggleable via header button.

---

## 🗂 Project Structure

```
cloud project_2/
├── index.html              # Main application structure, views, modals, 3D viewport
├── css/
│   ├── style.css           # Futuristic cyber-kubernetes theme, glassmorphism, animations
│   └── components.css      # KPI cards, cyber tables, badges, buttons, modals, toasts
├── js/
│   ├── mock-data.js        # Realistic simulated Kubernetes dataset (nodes, pods, deployments, logs)
│   ├── k8s-api.js          # Reusable asynchronous service functions (getClusterStatus, getNodes, etc.)
│   ├── cluster-3d.js       # Three.js 3D interactive engine (Control Plane, Nodes, Pods, Raycaster)
│   ├── charts.js           # Chart.js analytics engine with glowing neon cyberpunk styles
│   ├── ui.js               # UI controller (tabs, tables, search, filters, modals, toasts, audio)
│   └── app.js              # Application entry point and live telemetry ticker
└── README.md
```

---

## 🚀 Running the Project

Because KubePulse uses native ES6 JavaScript modules (`import` / `export`), open the project through any local HTTP server:

```bash
# Using Python
python -m http.server 3000

# Using Node.js (npx)
npx serve .

# Or using VS Code "Live Server" extension
# Right click index.html -> "Open with Live Server"
```

Open `http://localhost:3000` (or `http://127.0.0.1:5500`) in your browser.

---

## 🔌 Future Architecture: Python FastAPI & Kubernetes Integration

The client-side API service layer in `js/k8s-api.js` is structured to seamlessly plug into a Python FastAPI backend communicating with the official Kubernetes Python client (`kubernetes` / `client-go`):

| Service Function | Client Call | Target FastAPI Endpoint | Kubernetes Client API |
|---|---|---|---|
| `getClusterStatus()` | `GET /api/v1/cluster/status` | `CoreV1Api.list_node()`, `CoreV1Api.list_pod_for_all_namespaces()` |
| `getNodes()` | `GET /api/v1/nodes` | `CoreV1Api.list_node()` |
| `getPods(filter)` | `GET /api/v1/pods` | `CoreV1Api.list_pod_for_all_namespaces()` |
| `getPodMetrics()` | `GET /api/v1/metrics/cluster` | Metrics Server API (`/apis/metrics.k8s.io/v1beta1`) |
| `getActivityLogs()` | `GET /api/v1/events` | `CoreV1Api.list_event_for_all_namespaces()` |
| `restartPod(podName)` | `POST /api/v1/pods/{podName}/restart` | `AppsV1Api.patch_namespaced_deployment()` |
| `deletePod(podName)` | `DELETE /api/v1/pods/{podName}` | `CoreV1Api.delete_namespaced_pod()` |
| `toggleCordonNode(nodeName)`| `POST /api/v1/nodes/{nodeName}/cordon`| `CoreV1Api.patch_node(spec={'unschedulable': True/False})` |
| `getPodLogs(podName)` | `GET /api/v1/pods/{podName}/logs` | `CoreV1Api.read_namespaced_pod_log()` |
