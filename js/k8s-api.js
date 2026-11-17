/**
 * KubePulse - Kubernetes API Client Layer
 * 
 * Reusable asynchronous API service functions designed for seamless future transition
 * to Python FastAPI backend endpoints (e.g. /api/v1/cluster, /api/v1/nodes, etc.).
 */

import {
  mockClusterStatus,
  mockNodes,
  mockPods,
  mockDeployments,
  mockMetricsTimeline,
  mockActivityLogs,
  samplePodLogs,
  samplePodYaml
} from './mock-data.js';

// In-memory state for live simulation mutations
let currentCluster = { ...mockClusterStatus };
let currentNodes = JSON.parse(JSON.stringify(mockNodes));
let currentPods = JSON.parse(JSON.stringify(mockPods));
let currentLogs = JSON.parse(JSON.stringify(mockActivityLogs));
let currentMetrics = JSON.parse(JSON.stringify(mockMetricsTimeline));

/**
 * Retrieve overall cluster status, health score, and control plane telemetry.
 * Future endpoint: GET /api/v1/cluster/status
 */
export async function getClusterStatus() {
  // Simulate network latency (20ms - 80ms)
  await new Promise(res => setTimeout(res, 50));

  // Recalculate dynamic totals from current state
  const totalPods = currentPods.length;
  const runningPods = currentPods.filter(p => p.status === 'Running').length;
  const failedPods = currentPods.filter(p => p.status === 'Failed').length;
  const pendingPods = currentPods.filter(p => p.status === 'Pending').length;

  const totalNodes = currentNodes.length;
  const readyNodes = currentNodes.filter(n => n.status === 'Ready').length;

  // Compute dynamic health score
  let healthScore = 100;
  if (failedPods > 0) healthScore -= (failedPods * 4);
  if (pendingPods > 0) healthScore -= (pendingPods * 1.5);
  if (readyNodes < totalNodes) healthScore -= 20;
  healthScore = Math.max(70, Math.min(100, Math.round(healthScore * 10) / 10));

  return {
    ...currentCluster,
    totalPods,
    runningPods,
    failedPods,
    pendingPods,
    totalNodes,
    readyNodes,
    clusterHealthScore: healthScore,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Retrieve list of Kubernetes nodes with specs, utilization, and conditions.
 * Future endpoint: GET /api/v1/nodes
 */
export async function getNodes() {
  await new Promise(res => setTimeout(res, 60));
  // Recalculate pod counts per node
  return currentNodes.map(node => {
    const nodePods = currentPods.filter(p => p.node === node.name);
    return {
      ...node,
      podCount: nodePods.length
    };
  });
}

/**
 * Retrieve list of all Pods across namespaces or filtered by namespace/node.
 * Future endpoint: GET /api/v1/pods
 */
export async function getPods(filter = {}) {
  await new Promise(res => setTimeout(res, 50));
  let result = [...currentPods];

  if (filter.namespace && filter.namespace !== 'all') {
    result = result.filter(p => p.namespace === filter.namespace);
  }
  if (filter.node && filter.node !== 'all') {
    result = result.filter(p => p.node === filter.node);
  }
  if (filter.status && filter.status !== 'all') {
    result = result.filter(p => p.status.toLowerCase() === filter.status.toLowerCase());
  }
  if (filter.search) {
    const query = filter.search.toLowerCase();
    result = result.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.namespace.toLowerCase().includes(query) ||
      p.node.toLowerCase().includes(query)
    );
  }

  return result;
}

/**
 * Retrieve historical metrics timeline for CPU, memory, pods, and network.
 * Future endpoint: GET /api/v1/metrics/cluster
 */
export async function getPodMetrics(timeRange = '1h') {
  await new Promise(res => setTimeout(res, 40));
  return {
    timeRange,
    ...currentMetrics
  };
}

/**
 * Retrieve Kubernetes Deployments.
 * Future endpoint: GET /api/v1/deployments
 */
export async function getDeployments() {
  await new Promise(res => setTimeout(res, 40));
  return [...mockDeployments];
}

/**
 * Retrieve cluster activity logs and Kubernetes events.
 * Future endpoint: GET /api/v1/events
 */
export async function getActivityLogs(limit = 50) {
  await new Promise(res => setTimeout(res, 30));
  return currentLogs.slice(0, limit);
}

/**
 * Get container logs for a specific Pod.
 * Future endpoint: GET /api/v1/pods/{podName}/logs
 */
export async function getPodLogs(podName) {
  await new Promise(res => setTimeout(res, 80));
  if (samplePodLogs[podName]) {
    return samplePodLogs[podName];
  }
  return samplePodLogs['default'];
}

/**
 * Get YAML definition for a specific Pod.
 * Future endpoint: GET /api/v1/pods/{podName}/yaml
 */
export async function getPodYaml(podName) {
  await new Promise(res => setTimeout(res, 40));
  const pod = currentPods.find(p => p.name === podName);
  if (!pod) throw new Error(`Pod ${podName} not found`);
  return samplePodYaml(pod);
}

/**
 * Action: Restart a Pod (simulates rollout restart / delete-recreate).
 * Future endpoint: POST /api/v1/pods/{podName}/restart
 */
export async function restartPod(podName) {
  await new Promise(res => setTimeout(res, 300));
  const podIndex = currentPods.findIndex(p => p.name === podName);
  if (podIndex === -1) throw new Error(`Pod ${podName} not found`);

  // Reset restarts and transition from Pending -> Running
  currentPods[podIndex].status = 'Pending';
  currentPods[podIndex].restarts += 1;
  currentPods[podIndex].age = '10s';

  // Add event log
  const newLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toTimeString().split(' ')[0],
    type: 'pod_restarted',
    level: 'info',
    resource: podName,
    namespace: currentPods[podIndex].namespace,
    message: `Manual rollout restart requested for pod ${podName}. New container starting.`,
    details: `Restart triggered via KubePulse Dashboard by operator.`
  };
  currentLogs.unshift(newLog);

  setTimeout(() => {
    if (currentPods[podIndex]) {
      currentPods[podIndex].status = 'Running';
      currentPods[podIndex].cpuUsage = '120m';
      currentPods[podIndex].memoryUsage = '280Mi';
    }
  }, 4000);

  return { success: true, pod: currentPods[podIndex] };
}

/**
 * Action: Delete a Pod.
 * Future endpoint: DELETE /api/v1/pods/{podName}
 */
export async function deletePod(podName) {
  await new Promise(res => setTimeout(res, 250));
  const pod = currentPods.find(p => p.name === podName);
  if (!pod) throw new Error(`Pod ${podName} not found`);

  currentPods = currentPods.filter(p => p.name !== podName);

  const newLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toTimeString().split(' ')[0],
    type: 'pod_deleted',
    level: 'warning',
    resource: podName,
    namespace: pod.namespace,
    message: `Pod ${podName} terminated and removed from etcd registry.`,
    details: `Grace period: 30s. Resources deallocated on node ${pod.node}.`
  };
  currentLogs.unshift(newLog);

  return { success: true, podName };
}

/**
 * Action: Cordon or Uncordon a Node.
 * Future endpoint: POST /api/v1/nodes/{nodeName}/cordon
 */
export async function toggleCordonNode(nodeName) {
  await new Promise(res => setTimeout(res, 200));
  const node = currentNodes.find(n => n.name === nodeName);
  if (!node) throw new Error(`Node ${nodeName} not found`);

  const wasCordoned = node.status === 'SchedulingDisabled';
  node.status = wasCordoned ? 'Ready' : 'SchedulingDisabled';

  const newLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toTimeString().split(' ')[0],
    type: wasCordoned ? 'node_ready' : 'node_unavailable',
    level: wasCordoned ? 'success' : 'warning',
    resource: nodeName,
    namespace: 'cluster',
    message: wasCordoned ? `Node ${nodeName} uncordoned and schedulable.` : `Node ${nodeName} cordoned: SchedulingDisabled.`,
    details: `Node spec.unschedulable = ${!wasCordoned}`
  };
  currentLogs.unshift(newLog);

  return { success: true, node };
}

/**
 * Helper to simulate real-time cluster telemetry jitter
 */
export function simulateMetricsTick() {
  // Minor realistic fluctuations
  currentNodes.forEach(node => {
    const delta = (Math.random() - 0.5) * 4;
    node.cpuUsagePercent = Math.max(10, Math.min(95, Math.round(node.cpuUsagePercent + delta)));
  });

  currentPods.forEach(pod => {
    if (pod.status === 'Running') {
      const delta = (Math.random() - 0.5) * 10;
      pod.cpuPercent = Math.max(2, Math.min(90, Math.round(pod.cpuPercent + delta)));
      pod.cpuUsage = `${Math.round(pod.cpuPercent * 10)}m`;
    }
  });
}
