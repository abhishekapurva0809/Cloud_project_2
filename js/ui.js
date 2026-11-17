/**
 * KubePulse - UI Controller & State Manager
 * Handles page routing, interactive tables, side drawers, modals, toasts, and audio.
 */

import {
  getClusterStatus,
  getNodes,
  getPods,
  getDeployments,
  getActivityLogs,
  getPodLogs,
  getPodYaml,
  restartPod,
  deletePod,
  toggleCordonNode
} from './k8s-api.js';

export class KubePulseUI {
  constructor(cluster3D, chartsEngine) {
    this.cluster3D = cluster3D;
    this.chartsEngine = chartsEngine;
    this.currentTab = 'dashboard';
    this.soundEnabled = true;
    this.audioCtx = null;
    this.liveStreamPaused = false;
    this.podFilter = { status: 'all', namespace: 'all', search: '' };

    this.initAudio();
    this.initNavigation();
    this.initEventListeners();
  }

  // --- Cyber Audio Synthesizer (Web Audio API) ---
  initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    } catch (e) {
      console.warn("Web Audio not supported", e);
    }
  }

  playSound(type = 'click') {
    if (!this.soundEnabled || !this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'select') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(980, now + 0.12);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'alert') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.setValueAtTime(440, now + 0.1);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.setValueAtTime(900, now + 0.08);
      osc.frequency.setValueAtTime(1200, now + 0.16);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  }

  // --- Page Navigation ---
  initNavigation() {
    const navButtons = document.querySelectorAll('[data-nav-target]');
    navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = btn.getAttribute('data-nav-target');
        this.switchTab(target);
        this.playSound('click');
      });
    });

    // Keyboard navigation shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'Escape') {
        this.closeSideDrawer();
        this.closeModal();
      } else if (e.key === '1') this.switchTab('dashboard');
      else if (e.key === '2') this.switchTab('monitoring');
      else if (e.key === '3') this.switchTab('pods');
      else if (e.key === '4') this.switchTab('nodes');
      else if (e.key === '5') this.switchTab('analytics');
      else if (e.key === '6') this.switchTab('logs');
    });
  }

  switchTab(tabId) {
    this.currentTab = tabId;

    // Update active nav button
    document.querySelectorAll('[data-nav-target]').forEach(b => {
      if (b.getAttribute('data-nav-target') === tabId) {
        b.classList.add('nav-link-active');
      } else {
        b.classList.remove('nav-link-active');
      }
    });

    // Show target section, hide others
    document.querySelectorAll('.app-page-view').forEach(view => {
      if (view.id === `view-${tabId}`) {
        view.classList.remove('hidden');
        view.classList.add('active-view');
      } else {
        view.classList.add('hidden');
        view.classList.remove('active-view');
      }
    });

    // Trigger tab-specific loaders
    if (tabId === 'dashboard') {
      if (this.cluster3D) this.cluster3D.onResize();
      this.refreshDashboardKPIs();
    } else if (tabId === 'monitoring') {
      this.refreshMonitoringPage();
    } else if (tabId === 'pods') {
      this.refreshPodsTable();
    } else if (tabId === 'nodes') {
      this.refreshNodesPage();
    } else if (tabId === 'analytics') {
      if (this.chartsEngine) this.chartsEngine.initAnalyticsCharts();
    } else if (tabId === 'logs') {
      this.refreshActivityLogsPage();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Initial Data Refresh & Bindings ---
  initEventListeners() {
    // Sound Toggle
    const soundBtn = document.getElementById('btn-toggle-sound');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        this.soundEnabled = !this.soundEnabled;
        soundBtn.classList.toggle('text-cyan-400', this.soundEnabled);
        soundBtn.classList.toggle('text-slate-500', !this.soundEnabled);
        this.showToast(`Audio Effects: ${this.soundEnabled ? 'Enabled' : 'Muted'}`);
      });
    }

    // 3D HUD Controls
    document.querySelectorAll('[data-cam-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.getAttribute('data-cam-preset');
        if (this.cluster3D) this.cluster3D.setPresetView(preset);
        this.playSound('click');
      });
    });

    const autoRotateBtn = document.getElementById('btn-toggle-autorotate');
    if (autoRotateBtn && this.cluster3D) {
      autoRotateBtn.addEventListener('click', () => {
        const active = this.cluster3D.toggleAutoRotate();
        autoRotateBtn.classList.toggle('btn-hud-active', active);
        this.playSound('click');
      });
    }

    // Side Drawer Close
    const closeDrawerBtn = document.getElementById('btn-close-drawer');
    if (closeDrawerBtn) {
      closeDrawerBtn.addEventListener('click', () => this.closeSideDrawer());
    }

    // Modal Close
    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', () => this.closeModal());
    });

    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
      modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) this.closeModal();
      });
    }

    // Pod Search & Filter Listeners
    const podSearchInput = document.getElementById('input-pod-search');
    if (podSearchInput) {
      podSearchInput.addEventListener('input', (e) => {
        this.podFilter.search = e.target.value;
        this.refreshPodsTable();
      });
    }

    const podNamespaceSelect = document.getElementById('select-pod-namespace');
    if (podNamespaceSelect) {
      podNamespaceSelect.addEventListener('change', (e) => {
        this.podFilter.namespace = e.target.value;
        this.refreshPodsTable();
      });
    }

    document.querySelectorAll('.filter-pod-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.filter-pod-pill').forEach(p => p.classList.remove('pill-active'));
        pill.classList.add('pill-active');
        this.podFilter.status = pill.getAttribute('data-status-filter');
        this.refreshPodsTable();
        this.playSound('click');
      });
    });

    // Log Streamer Controls
    const pauseBtn = document.getElementById('btn-pause-logs');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        this.liveStreamPaused = !this.liveStreamPaused;
        pauseBtn.innerHTML = this.liveStreamPaused ? '▶ Resume Stream' : '⏸ Pause Stream';
        this.showToast(this.liveStreamPaused ? 'Live event stream paused' : 'Live event stream active');
        this.playSound('click');
      });
    }

    const testEventBtn = document.getElementById('btn-generate-test-event');
    if (testEventBtn) {
      testEventBtn.addEventListener('click', () => {
        this.simulateRandomClusterEvent();
        this.playSound('alert');
      });
    }

    const exportLogsBtn = document.getElementById('btn-export-logs');
    if (exportLogsBtn) {
      exportLogsBtn.addEventListener('click', async () => {
        const logs = await getActivityLogs(100);
        const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kubepulse-events-${Date.now()}.json`;
        a.click();
        this.showToast("Cluster activity logs exported to JSON");
      });
    }
  }

  // --- Toast Notification System ---
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `cyber-toast cyber-toast-${type}`;
    
    let icon = 'ℹ';
    if (type === 'success') icon = '✓';
    if (type === 'warning') icon = '⚠';
    if (type === 'error') icon = '✕';

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-msg">${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast-fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // --- Dashboard KPI Updates ---
  async refreshDashboardKPIs() {
    const status = await getClusterStatus();

    this.setText('kpi-total-nodes', status.totalNodes);
    this.setText('kpi-ready-nodes-badge', `${status.readyNodes}/${status.totalNodes} Ready`);
    
    this.setText('kpi-total-pods', status.totalPods);
    this.setText('kpi-pod-capacity', `Cap: ${status.podCapacity}`);

    this.setText('kpi-running-pods', status.runningPods);
    const runningRatio = Math.round((status.runningPods / status.totalPods) * 100);
    this.setText('kpi-running-ratio', `${runningRatio}%`);

    this.setText('kpi-failed-pods', status.failedPods);
    const failedCard = document.getElementById('kpi-failed-card');
    if (failedCard) {
      failedCard.classList.toggle('border-rose-500/50', status.failedPods > 0);
    }

    this.setText('kpi-pending-pods', status.pendingPods);
    this.setText('kpi-cluster-health', `${status.clusterHealthScore}%`);

    // Top Header Status
    this.setText('header-cluster-name', status.name.toUpperCase());
    this.setText('header-k8s-version', status.kubernetesVersion);
    this.setText('header-uptime', status.uptime);
  }

  // --- Side Drawer Details (Clicked Node or Pod) ---
  showEntitySideDrawer(type, entity) {
    const drawer = document.getElementById('side-drawer');
    const titleEl = document.getElementById('drawer-title');
    const badgeEl = document.getElementById('drawer-badge');
    const contentEl = document.getElementById('drawer-body');
    if (!drawer || !contentEl) return;

    this.playSound('select');

    if (type === 'node') {
      titleEl.innerText = `Node: ${entity.name}`;
      badgeEl.innerText = entity.role;
      badgeEl.className = 'px-2 py-0.5 rounded text-xs font-mono font-medium bg-cyan-950/80 text-cyan-400 border border-cyan-800';

      const statusColor = entity.status === 'Ready' ? 'text-emerald-400' : 'text-rose-400';

      contentEl.innerHTML = `
        <div class="space-y-4">
          <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
            <div class="flex justify-between text-xs">
              <span class="text-slate-400">Status</span>
              <span class="font-bold ${statusColor}">${entity.status}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-slate-400">Internal IP</span>
              <span class="font-mono text-cyan-300">${entity.internalIp}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-slate-400">Zone</span>
              <span class="font-mono text-slate-300">${entity.zone}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-slate-400">Instance Type</span>
              <span class="font-mono text-purple-300">${entity.instanceType}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-slate-400">Kubelet</span>
              <span class="font-mono text-slate-300">${entity.kubeletVersion}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-slate-400">OS / Kernel</span>
              <span class="text-slate-300">${entity.osImage}</span>
            </div>
          </div>

          <!-- Gauges -->
          <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-3">
            <div class="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Resource Allocation</div>
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-slate-400">CPU (${entity.cpuUsedCores} / ${entity.cpuCores} Cores)</span>
                <span class="font-mono text-cyan-400">${entity.cpuUsagePercent}%</span>
              </div>
              <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div class="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full" style="width: ${entity.cpuUsagePercent}%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-slate-400">Memory (${entity.memoryUsedGiB} / ${entity.memoryGiB} GiB)</span>
                <span class="font-mono text-purple-400">${entity.memoryUsagePercent}%</span>
              </div>
              <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div class="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style="width: ${entity.memoryUsagePercent}%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-slate-400">Allocated Pods</span>
                <span class="font-mono text-emerald-400">${entity.podCount} / ${entity.maxPods}</span>
              </div>
              <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div class="bg-emerald-500 h-2 rounded-full" style="width: ${(entity.podCount / entity.maxPods) * 100}%"></div>
              </div>
            </div>
          </div>

          <!-- Conditions -->
          <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Node Conditions</div>
            <div class="grid grid-cols-2 gap-2 text-xs font-mono">
              <div class="px-2 py-1 rounded bg-slate-800/80 text-emerald-400">✓ Ready: True</div>
              <div class="px-2 py-1 rounded bg-slate-800/80 text-slate-300">✓ MemPressure: False</div>
              <div class="px-2 py-1 rounded bg-slate-800/80 text-slate-300">✓ DiskPressure: False</div>
              <div class="px-2 py-1 rounded bg-slate-800/80 text-slate-300">✓ PIDPressure: False</div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 pt-2">
            <button id="btn-drawer-cordon" class="btn-cyber flex-1 text-xs py-2">
              ${entity.status === 'SchedulingDisabled' ? 'Uncordon Node' : 'Cordon Node'}
            </button>
            <button id="btn-drawer-jump-nodes" class="btn-cyber-outline text-xs py-2 px-3">
              View in Nodes Tab
            </button>
          </div>
        </div>
      `;

      // Cordon toggle handler
      const cordonBtn = document.getElementById('btn-drawer-cordon');
      if (cordonBtn) {
        cordonBtn.addEventListener('click', async () => {
          const res = await toggleCordonNode(entity.name);
          this.showToast(`Node ${entity.name}: ${res.node.status}`, 'warning');
          this.showEntitySideDrawer('node', res.node);
          this.refreshDashboardKPIs();
        });
      }

      const jumpBtn = document.getElementById('btn-drawer-jump-nodes');
      if (jumpBtn) {
        jumpBtn.addEventListener('click', () => {
          this.switchTab('nodes');
          this.closeSideDrawer();
        });
      }

    } else if (type === 'pod') {
      titleEl.innerText = entity.name.length > 28 ? `${entity.name.slice(0, 28)}...` : entity.name;
      badgeEl.innerText = entity.namespace;
      badgeEl.className = 'px-2 py-0.5 rounded text-xs font-mono font-medium bg-purple-950/80 text-purple-400 border border-purple-800';

      let statusColor = 'text-emerald-400';
      if (entity.status === 'Failed') statusColor = 'text-rose-400';
      if (entity.status === 'Pending') statusColor = 'text-amber-400';

      contentEl.innerHTML = `
        <div class="space-y-4">
          <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-400">Status</span>
              <span class="font-bold ${statusColor} uppercase tracking-wider">${entity.status}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Assigned Node</span>
              <span class="font-mono text-cyan-300">${entity.node}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Pod IP</span>
              <span class="font-mono text-slate-300">${entity.ip}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Restarts</span>
              <span class="font-mono ${entity.restarts > 0 ? 'text-rose-400 font-bold' : 'text-slate-300'}">${entity.restarts}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Age</span>
              <span class="font-mono text-slate-300">${entity.age}</span>
            </div>
          </div>

          ${entity.failureReason ? `
            <div class="p-3 rounded-lg bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs">
              <div class="font-bold text-rose-400 uppercase tracking-wider mb-1">Failure Diagnostics</div>
              <div>${entity.failureReason}</div>
            </div>
          ` : ''}

          <!-- Telemetry -->
          <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-3">
            <div class="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Container Usage</div>
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-slate-400">CPU Usage</span>
                <span class="font-mono text-cyan-400">${entity.cpuUsage} (${entity.cpuPercent || 0}%)</span>
              </div>
              <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div class="bg-cyan-500 h-2 rounded-full" style="width: ${entity.cpuPercent || 5}%"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-slate-400">Memory Usage</span>
                <span class="font-mono text-purple-400">${entity.memoryUsage} (${entity.memoryPercent || 0}%)</span>
              </div>
              <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div class="bg-purple-500 h-2 rounded-full" style="width: ${entity.memoryPercent || 5}%"></div>
              </div>
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div class="grid grid-cols-2 gap-2 pt-2">
            <button id="btn-pod-view-logs" class="btn-cyber text-xs py-2 flex items-center justify-center gap-1.5">
              <span>📋</span> View Logs
            </button>
            <button id="btn-pod-view-yaml" class="btn-cyber-outline text-xs py-2 flex items-center justify-center gap-1.5">
              <span>📄</span> View YAML
            </button>
            <button id="btn-pod-restart" class="btn-cyber-outline text-amber-400 border-amber-600/40 hover:bg-amber-950/50 text-xs py-2 flex items-center justify-center gap-1.5">
              <span>🔄</span> Restart
            </button>
            <button id="btn-pod-delete" class="btn-cyber-outline text-rose-400 border-rose-600/40 hover:bg-rose-950/50 text-xs py-2 flex items-center justify-center gap-1.5">
              <span>🗑</span> Delete
            </button>
          </div>
        </div>
      `;

      // Pod actions binding
      document.getElementById('btn-pod-view-logs')?.addEventListener('click', () => {
        this.openPodLogsModal(entity.name);
      });
      document.getElementById('btn-pod-view-yaml')?.addEventListener('click', () => {
        this.openPodYamlModal(entity.name);
      });
      document.getElementById('btn-pod-restart')?.addEventListener('click', async () => {
        this.showToast(`Initiating rollout restart for ${entity.name}...`, 'info');
        await restartPod(entity.name);
        this.showToast(`Pod ${entity.name} restarted successfully!`, 'success');
        this.refreshPodsTable();
        this.refreshDashboardKPIs();
        this.closeSideDrawer();
      });
      document.getElementById('btn-pod-delete')?.addEventListener('click', async () => {
        if (confirm(`Are you sure you want to delete pod ${entity.name}?`)) {
          await deletePod(entity.name);
          this.showToast(`Pod ${entity.name} deleted from cluster.`, 'warning');
          this.refreshPodsTable();
          this.refreshDashboardKPIs();
          this.closeSideDrawer();
        }
      });
    }

    drawer.classList.remove('translate-x-full');
    drawer.classList.add('drawer-open');
  }

  closeSideDrawer() {
    const drawer = document.getElementById('side-drawer');
    if (drawer) {
      drawer.classList.add('translate-x-full');
      drawer.classList.remove('drawer-open');
    }
  }

  // --- Modals (Logs & YAML) ---
  async openPodLogsModal(podName) {
    const modal = document.getElementById('modal-container');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    if (!modal || !modalBody) return;

    modalTitle.innerHTML = `<span class="text-cyan-400">Container Logs:</span> ${podName}`;
    modalBody.innerHTML = `<div class="p-6 text-center text-slate-400 font-mono text-sm">Streaming logs from kubelet...</div>`;
    modal.classList.remove('hidden');

    const logs = await getPodLogs(podName);

    modalBody.innerHTML = `
      <div class="space-y-2">
        <div class="flex justify-between items-center bg-slate-900/90 px-3 py-2 rounded border border-slate-800 text-xs font-mono">
          <span class="text-emerald-400 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Log Stream
          </span>
          <span class="text-slate-400">${logs.length} lines captured</span>
        </div>
        <div class="terminal-logs-window bg-black/90 p-4 rounded-lg font-mono text-xs overflow-y-auto max-h-[420px] leading-relaxed border border-cyan-950">
          ${logs.map(line => {
            let color = 'text-slate-300';
            if (line.includes('[WARN]')) color = 'text-amber-400';
            if (line.includes('[FATAL]') || line.includes('[ERROR]')) color = 'text-rose-400';
            if (line.includes('[DEBUG]')) color = 'text-purple-400';
            return `<div class="${color}">${line}</div>`;
          }).join('')}
        </div>
      </div>
    `;
    this.playSound('click');
  }

  async openPodYamlModal(podName) {
    const modal = document.getElementById('modal-container');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    if (!modal || !modalBody) return;

    modalTitle.innerHTML = `<span class="text-purple-400">Kubernetes Resource Manifest:</span> ${podName}`;
    modalBody.innerHTML = `<div class="p-6 text-center text-slate-400 font-mono text-sm">Fetching YAML manifest from API server...</div>`;
    modal.classList.remove('hidden');

    const yaml = await getPodYaml(podName);

    modalBody.innerHTML = `
      <div class="space-y-2">
        <div class="flex justify-between items-center bg-slate-900/90 px-3 py-2 rounded border border-slate-800 text-xs font-mono">
          <span class="text-purple-400">kind: Pod</span>
          <button id="btn-copy-yaml" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200">Copy YAML</button>
        </div>
        <pre class="bg-black/90 p-4 rounded-lg font-mono text-xs overflow-y-auto max-h-[420px] text-emerald-300 leading-relaxed border border-purple-950">${yaml}</pre>
      </div>
    `;

    document.getElementById('btn-copy-yaml')?.addEventListener('click', () => {
      navigator.clipboard.writeText(yaml);
      this.showToast("YAML manifest copied to clipboard!");
    });
    this.playSound('click');
  }

  closeModal() {
    const modal = document.getElementById('modal-container');
    if (modal) modal.classList.add('hidden');
  }

  // --- Pods Management Page Table ---
  async refreshPodsTable() {
    const pods = await getPods(this.podFilter);
    const tbody = document.getElementById('pods-table-body');
    if (!tbody) return;

    if (pods.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="p-8 text-center text-slate-500 font-mono text-sm">
            No Kubernetes pods found matching your current filters.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = pods.map(pod => {
      let statusBadge = '<span class="status-badge status-badge-running">● Running</span>';
      if (pod.status === 'Failed') {
        statusBadge = '<span class="status-badge status-badge-failed">✕ Failed</span>';
      } else if (pod.status === 'Pending') {
        statusBadge = '<span class="status-badge status-badge-pending">▲ Pending</span>';
      }

      return `
        <tr class="table-row-cyber cursor-pointer" data-pod-id="${pod.id}">
          <td class="p-3">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full ${pod.status === 'Running' ? 'bg-emerald-400' : pod.status === 'Failed' ? 'bg-rose-500' : 'bg-amber-400'}"></span>
              <span class="font-mono font-medium text-slate-200 hover:text-cyan-400">${pod.name}</span>
            </div>
          </td>
          <td class="p-3">
            <span class="px-2 py-0.5 rounded text-xs font-mono bg-purple-950/60 text-purple-300 border border-purple-800/40">
              ${pod.namespace}
            </span>
          </td>
          <td class="p-3 font-mono text-xs text-slate-400">${pod.node}</td>
          <td class="p-3">${statusBadge}</td>
          <td class="p-3 font-mono text-xs ${pod.restarts > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}">${pod.restarts}</td>
          <td class="p-3">
            <div class="w-24">
              <div class="flex justify-between text-[10px] font-mono text-slate-400 mb-0.5">
                <span>${pod.cpuUsage}</span>
                <span>${pod.cpuPercent || 0}%</span>
              </div>
              <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div class="bg-cyan-400 h-1.5 rounded-full" style="width: ${pod.cpuPercent || 5}%"></div>
              </div>
            </div>
          </td>
          <td class="p-3">
            <div class="w-24">
              <div class="flex justify-between text-[10px] font-mono text-slate-400 mb-0.5">
                <span>${pod.memoryUsage}</span>
                <span>${pod.memoryPercent || 0}%</span>
              </div>
              <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div class="bg-purple-400 h-1.5 rounded-full" style="width: ${pod.memoryPercent || 5}%"></div>
              </div>
            </div>
          </td>
          <td class="p-3 font-mono text-xs text-slate-400">${pod.age}</td>
          <td class="p-3">
            <div class="flex items-center gap-1.5">
              <button class="btn-action-inspect px-2 py-1 rounded text-xs bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800" data-action="inspect" title="Inspect">🔍</button>
              <button class="btn-action-logs px-2 py-1 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-300" data-action="logs" title="Logs">📋</button>
              <button class="btn-action-restart px-2 py-1 rounded text-xs bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800" data-action="restart" title="Restart">🔄</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach row and button event listeners
    tbody.querySelectorAll('tr[data-pod-id]').forEach(row => {
      const podId = row.getAttribute('data-pod-id');
      const pod = pods.find(p => p.id === podId);
      if (!pod) return;

      row.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        this.showEntitySideDrawer('pod', pod);
        if (this.cluster3D) this.cluster3D.selectEntityById('pod', pod.id);
      });

      row.querySelector('[data-action="inspect"]')?.addEventListener('click', () => {
        this.showEntitySideDrawer('pod', pod);
        this.switchTab('dashboard');
        if (this.cluster3D) this.cluster3D.selectEntityById('pod', pod.id);
      });

      row.querySelector('[data-action="logs"]')?.addEventListener('click', () => {
        this.openPodLogsModal(pod.name);
      });

      row.querySelector('[data-action="restart"]')?.addEventListener('click', async () => {
        this.showToast(`Restarting pod ${pod.name}...`);
        await restartPod(pod.name);
        this.showToast(`Pod ${pod.name} restarted!`, 'success');
        this.refreshPodsTable();
      });
    });

    // Update pod count badge
    this.setText('pod-table-count-badge', `${pods.length} Pods`);
  }

  // --- Nodes Monitoring Page ---
  async refreshNodesPage() {
    const nodes = await getNodes();
    const container = document.getElementById('nodes-grid-container');
    if (!container) return;

    container.innerHTML = nodes.map(node => {
      const isReady = node.status === 'Ready';
      const statusColor = isReady ? 'text-emerald-400' : 'text-rose-400';

      return `
        <div class="cyber-card p-5 space-y-4">
          <div class="flex justify-between items-start">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full ${isReady ? 'bg-emerald-400 shadow-emerald-500/50 shadow-md' : 'bg-rose-500 shadow-rose-500/50 shadow-md'}"></span>
                <h3 class="font-bold text-base text-slate-100 font-mono tracking-tight">${node.name}</h3>
              </div>
              <p class="text-xs text-purple-400 font-mono mt-0.5">${node.role} • ${node.zone}</p>
            </div>
            <span class="px-2.5 py-1 rounded-full text-xs font-mono font-semibold ${isReady ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' : 'bg-rose-950/80 text-rose-400 border border-rose-800'}">
              ${node.status}
            </span>
          </div>

          <!-- Specs Summary -->
          <div class="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <div>
              <span class="text-slate-500 block text-[10px]">INTERNAL IP</span>
              <span class="text-cyan-300">${node.internalIp}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[10px]">UPTIME</span>
              <span class="text-slate-300">${node.uptime}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[10px]">PODS ALLOCATED</span>
              <span class="text-emerald-400 font-bold">${node.podCount} / ${node.maxPods}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[10px]">KUBELET</span>
              <span class="text-slate-300">${node.kubeletVersion}</span>
            </div>
          </div>

          <!-- Resource Dials / Bars -->
          <div class="space-y-3">
            <div>
              <div class="flex justify-between text-xs font-mono mb-1">
                <span class="text-slate-400">CPU: ${node.cpuUsedCores} / ${node.cpuCores} Cores</span>
                <span class="text-cyan-400 font-bold">${node.cpuUsagePercent}%</span>
              </div>
              <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div class="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full" style="width: ${node.cpuUsagePercent}%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs font-mono mb-1">
                <span class="text-slate-400">Memory: ${node.memoryUsedGiB} / ${node.memoryGiB} GiB</span>
                <span class="text-purple-400 font-bold">${node.memoryUsagePercent}%</span>
              </div>
              <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div class="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style="width: ${node.memoryUsagePercent}%"></div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="flex gap-2 pt-2 border-t border-slate-800/80">
            <button class="btn-node-inspect btn-cyber text-xs py-1.5 flex-1" data-node-id="${node.id}">
              Inspect in 3D
            </button>
            <button class="btn-node-cordon btn-cyber-outline text-xs py-1.5 px-3" data-node-name="${node.name}">
              ${node.status === 'SchedulingDisabled' ? 'Uncordon' : 'Cordon'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach Node listeners
    container.querySelectorAll('.btn-node-inspect').forEach(btn => {
      btn.addEventListener('click', () => {
        const nodeId = btn.getAttribute('data-node-id');
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
          this.switchTab('dashboard');
          if (this.cluster3D) this.cluster3D.selectEntityById('node', node.id);
          this.showEntitySideDrawer('node', node);
        }
      });
    });

    container.querySelectorAll('.btn-node-cordon').forEach(btn => {
      btn.addEventListener('click', async () => {
        const name = btn.getAttribute('data-node-name');
        const res = await toggleCordonNode(name);
        this.showToast(`Node ${name}: status updated to ${res.node.status}`, 'warning');
        this.refreshNodesPage();
      });
    });
  }

  // --- Kubernetes Monitoring Page ---
  async refreshMonitoringPage() {
    const status = await getClusterStatus();
    const deployments = await getDeployments();
    const pods = await getPods();

    // Health overview
    this.setText('mon-k8s-version', status.kubernetesVersion);
    this.setText('mon-api-latency', `${status.apiServerLatencyMs} ms`);
    this.setText('mon-etcd', status.etcdStatus);
    this.setText('mon-cni', status.networkPlugin);
    this.setText('mon-uptime', status.uptime);

    // Deployments Table
    const depContainer = document.getElementById('deployments-table-body');
    if (depContainer) {
      depContainer.innerHTML = deployments.map(dep => `
        <tr class="table-row-cyber">
          <td class="p-3 font-mono font-medium text-slate-200">${dep.name}</td>
          <td class="p-3"><span class="px-2 py-0.5 rounded text-xs font-mono bg-purple-950/60 text-purple-300">${dep.namespace}</span></td>
          <td class="p-3 font-mono text-emerald-400">${dep.readyReplicas}/${dep.desiredReplicas}</td>
          <td class="p-3 font-mono text-xs text-slate-400">${dep.strategy}</td>
          <td class="p-3 font-mono text-xs text-slate-400">${dep.age}</td>
          <td class="p-3">
            <span class="px-2 py-0.5 rounded text-xs font-mono ${dep.readyReplicas === dep.desiredReplicas ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}">
              ${dep.conditions}
            </span>
          </td>
        </tr>
      `).join('');
    }

    // Top Restart Offenders
    const restartOffenders = pods.filter(p => p.restarts > 0).sort((a, b) => b.restarts - a.restarts);
    const offendersContainer = document.getElementById('restart-offenders-list');
    if (offendersContainer) {
      offendersContainer.innerHTML = restartOffenders.map(p => `
        <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between items-center">
          <div>
            <div class="font-mono text-xs font-bold text-slate-200">${p.name}</div>
            <div class="text-[10px] text-slate-500 font-mono">${p.namespace} • Node: ${p.node}</div>
          </div>
          <div class="flex items-center gap-3">
            <span class="px-2 py-1 rounded bg-rose-950/80 text-rose-400 font-mono text-xs font-bold border border-rose-800">
              ${p.restarts} restarts
            </span>
            <button class="btn-cyber-outline text-xs px-2 py-1" onclick="window.kubepulseApp.ui.openPodLogsModal('${p.name}')">Logs</button>
          </div>
        </div>
      `).join('');
    }
  }

  // --- Activity Logs Page ---
  async refreshActivityLogsPage() {
    const logs = await getActivityLogs();
    const container = document.getElementById('activity-logs-container');
    if (!container) return;

    container.innerHTML = logs.map(log => {
      let badgeClass = 'text-cyan-400 bg-cyan-950/80 border-cyan-800';
      if (log.level === 'warning') badgeClass = 'text-amber-400 bg-amber-950/80 border-amber-800';
      if (log.level === 'error') badgeClass = 'text-rose-400 bg-rose-950/80 border-rose-800';
      if (log.level === 'success') badgeClass = 'text-emerald-400 bg-emerald-950/80 border-emerald-800';

      return `
        <div class="p-3.5 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition flex items-start gap-3">
          <span class="font-mono text-xs text-slate-500 pt-0.5">${log.timestamp}</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${badgeClass}">
            ${log.type.replace('_', ' ')}
          </span>
          <div class="flex-1 space-y-1">
            <div class="text-xs text-slate-200">
              <span class="font-mono font-bold text-cyan-300">[${log.resource}]</span> ${log.message}
            </div>
            ${log.details ? `<div class="text-[11px] text-slate-400 font-mono">${log.details}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  simulateRandomClusterEvent() {
    const eventTypes = [
      {
        type: 'pod_restarted',
        level: 'warning',
        resource: 'api-gateway-v2-56c879d48-8r7kp',
        message: 'Liveness probe timed out (TCP ping :8080 > 5000ms). Container restarting.',
        details: 'Restart policy: Always. Kubelet restarted envoy container.'
      },
      {
        type: 'pod_created',
        level: 'info',
        resource: 'cache-cleaner-batch-job-77a',
        message: 'Job pod spawned by cronjob/cache-purger on node k8s-worker-02.',
        details: 'Allocated 100m CPU, 64Mi Memory.'
      },
      {
        type: 'deployment_updated',
        level: 'info',
        resource: 'catalog-inventory',
        message: 'RollingUpdate: Pod replacement 1/1 ready. Image pulled in 1.4s.',
        details: 'Target digest: sha256:7bc94...'
      }
    ];

    const chosen = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    this.showToast(`[EVENT] ${chosen.resource}: ${chosen.message}`, chosen.level);

    if (this.currentTab === 'logs') {
      this.refreshActivityLogsPage();
    }
    this.refreshDashboardKPIs();
  }

  setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
  }
}
