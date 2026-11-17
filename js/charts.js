/**
 * KubePulse - Analytics & Telemetry Charts Engine
 * Built with Chart.js and customized with glowing cyberpunk neon aesthetics.
 */

import { getPodMetrics } from './k8s-api.js';

export class KubePulseCharts {
  constructor() {
    this.charts = {};
  }

  /**
   * Initialize all analytics charts on the #analytics view
   */
  async initAnalyticsCharts() {
    if (typeof Chart === 'undefined') {
      console.warn("Chart.js not yet loaded, waiting...");
      setTimeout(() => this.initAnalyticsCharts(), 300);
      return;
    }

    // Chart.js global theme configuration
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'JetBrains Mono', monospace";
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.07)';

    const metrics = await getPodMetrics();

    this.renderCpuChart('chart-cpu-history', metrics);
    this.renderMemoryChart('chart-mem-history', metrics);
    this.renderPodsTimelineChart('chart-pods-timeline', metrics);
    this.renderNetworkChart('chart-network-io', metrics);
    this.renderActivityBarChart('chart-activity-freq');
  }

  renderCpuChart(canvasId, metrics) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
    gradient.addColorStop(1, 'rgba(0, 240, 255, 0.02)');

    this.charts[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: metrics.timestamps,
        datasets: [{
          label: 'CPU Usage (%)',
          data: metrics.cpuUtilizationPercent,
          borderColor: '#00f0ff',
          backgroundColor: gradient,
          borderWidth: 2.5,
          tension: 0.35,
          fill: true,
          pointBackgroundColor: '#00f0ff',
          pointBorderColor: '#070b19',
          pointHoverRadius: 6,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(7, 11, 25, 0.95)',
            borderColor: 'rgba(0, 240, 255, 0.4)',
            borderWidth: 1,
            titleColor: '#00f0ff',
            bodyColor: '#ffffff',
            padding: 10,
            callbacks: {
              label: (ctx) => ` CPU: ${ctx.parsed.y}%`
            }
          }
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { callback: v => `${v}%` }
          },
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.03)' }
          }
        }
      }
    });
  }

  renderMemoryChart(canvasId, metrics) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(168, 85, 247, 0.45)');
    gradient.addColorStop(1, 'rgba(168, 85, 247, 0.02)');

    this.charts[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: metrics.timestamps,
        datasets: [{
          label: 'Memory Usage (%)',
          data: metrics.memoryUtilizationPercent,
          borderColor: '#a855f7',
          backgroundColor: gradient,
          borderWidth: 2.5,
          tension: 0.35,
          fill: true,
          pointBackgroundColor: '#a855f7',
          pointBorderColor: '#070b19',
          pointHoverRadius: 6,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(7, 11, 25, 0.95)',
            borderColor: 'rgba(168, 85, 247, 0.4)',
            borderWidth: 1,
            titleColor: '#c084fc',
            bodyColor: '#ffffff',
            padding: 10,
            callbacks: {
              label: (ctx) => ` Mem: ${ctx.parsed.y}%`
            }
          }
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { callback: v => `${v}%` }
          },
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.03)' }
          }
        }
      }
    });
  }

  renderPodsTimelineChart(canvasId, metrics) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    this.charts[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: metrics.timestamps,
        datasets: [
          {
            label: 'Running Pods',
            data: metrics.runningPods,
            borderColor: '#00ff88',
            backgroundColor: 'rgba(0, 255, 136, 0.1)',
            borderWidth: 2,
            tension: 0.2,
            fill: true,
            pointRadius: 3
          },
          {
            label: 'Failed Pods',
            data: metrics.failedPods,
            borderColor: '#ff3366',
            backgroundColor: 'rgba(255, 51, 102, 0.1)',
            borderWidth: 2,
            tension: 0.2,
            fill: true,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { boxWidth: 12, color: '#e2e8f0' }
          },
          tooltip: {
            backgroundColor: 'rgba(7, 11, 25, 0.95)',
            borderColor: 'rgba(0, 240, 255, 0.3)',
            borderWidth: 1
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.03)' }
          }
        }
      }
    });
  }

  renderNetworkChart(canvasId, metrics) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    this.charts[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: metrics.timestamps,
        datasets: [
          {
            label: 'Ingress (Mbps)',
            data: metrics.networkIngressMbps,
            borderColor: '#38bdf8',
            borderWidth: 2,
            tension: 0.3,
            fill: false,
            pointRadius: 2
          },
          {
            label: 'Egress (Mbps)',
            data: metrics.networkEgressMbps,
            borderColor: '#e879f9',
            borderWidth: 2,
            tension: 0.3,
            fill: false,
            pointRadius: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { boxWidth: 12, color: '#e2e8f0' }
          }
        },
        scales: {
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { callback: v => `${v} M` }
          },
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.03)' }
          }
        }
      }
    });
  }

  renderActivityBarChart(canvasId) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    this.charts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00'],
        datasets: [{
          label: 'Cluster Events Count',
          data: [14, 28, 45, 82, 64, 91, 52],
          backgroundColor: 'rgba(0, 240, 255, 0.6)',
          hoverBackgroundColor: '#00f0ff',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  /**
   * Helper to draw a sleek mini sparkline onto any 2D canvas element
   */
  static drawMiniSparkline(canvas, dataPoints, strokeColor = '#00f0ff') {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (!dataPoints || dataPoints.length < 2) return;

    const min = Math.min(...dataPoints);
    const max = Math.max(...dataPoints);
    const range = (max - min) || 1;

    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';

    dataPoints.forEach((val, i) => {
      const x = (i / (dataPoints.length - 1)) * (w - 4) + 2;
      const y = h - ((val - min) / range) * (h - 8) - 4;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();
  }
}
