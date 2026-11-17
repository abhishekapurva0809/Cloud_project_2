/**
 * KubePulse - Main Application Entry Point
 * Orchestrates 3D rendering, API service layers, charts, and user interface.
 */

import { getClusterStatus, getNodes, getPods, simulateMetricsTick } from './k8s-api.js';
import { Cluster3D } from './cluster-3d.js';
import { KubePulseCharts } from './charts.js';
import { KubePulseUI } from './ui.js';

class KubePulseApp {
  constructor() {
    this.cluster3D = null;
    this.charts = null;
    this.ui = null;
    this.tickerInterval = null;
  }

  async init() {
    console.log("⚡ [KubePulse] Initializing Kubernetes 3D Command Center...");

    // 1. Fetch initial simulated cluster state
    const [status, nodes, pods] = await Promise.all([
      getClusterStatus(),
      getNodes(),
      getPods()
    ]);

    // 2. Initialize 3D Cluster Environment (Centerpiece)
    const container3D = document.getElementById('cluster-3d-viewport');
    if (container3D) {
      this.cluster3D = new Cluster3D(container3D, (type, entity) => {
        if (this.ui) {
          this.ui.showEntitySideDrawer(type, entity);
        }
      });
      this.cluster3D.loadClusterData(nodes, pods);
    }

    // 3. Initialize Charts Engine
    this.charts = new KubePulseCharts();

    // 4. Initialize UI Controller
    this.ui = new KubePulseUI(this.cluster3D, this.charts);

    // 5. Populate initial dashboard views
    await this.ui.refreshDashboardKPIs();
    await this.ui.refreshPodsTable();
    await this.ui.refreshNodesPage();
    await this.ui.refreshMonitoringPage();

    // 6. Start real-time cluster telemetry ticker (every 4 seconds)
    this.startLiveTelemetrySimulation();

    console.log("🚀 [KubePulse] Core Online. 3D Cluster Environment Ready.");
  }

  startLiveTelemetrySimulation() {
    this.tickerInterval = setInterval(() => {
      // Simulate minor fluctuating node & pod CPU / memory jitter
      simulateMetricsTick();

      // If viewing dashboard or monitoring, refresh KPI numbers smoothly
      if (this.ui.currentTab === 'dashboard') {
        this.ui.refreshDashboardKPIs();
      }
    }, 4000);
  }
}

// Bootstrap once DOM content is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new KubePulseApp();
  window.kubepulseApp = app;
  app.init();
});
