/**
 * KubePulse - 3D Interactive Kubernetes Cluster Engine
 * Powered by Three.js & OrbitControls
 * 
 * Features:
 * - Holographic Control Plane core with rotating energy rings
 * - Hexagonal Worker Node platforms with status beacons
 * - 3D Pod capsules with realistic status shaders & halos (Green, Red, Yellow)
 * - Dynamic data conduits with traveling packet particles
 * - Raycaster interaction: Hover tooltips, click selection, camera fly-to lerp
 * - Presets: Cluster Overview, Control Plane, Worker Focus, Top-Down Grid
 */

export class Cluster3D {
  constructor(containerElement, onSelectCallback) {
    this.container = containerElement;
    this.onSelect = onSelectCallback || (() => {});
    
    // Core Three.js components
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-1000, -1000);
    
    // Object Registries
    this.interactableObjects = []; // Mesh list for raycasting
    this.nodeMeshes = new Map();   // node.id -> mesh group
    this.podMeshes = new Map();    // pod.id -> mesh group
    this.conduits = [];            // Animated curves & beams
    this.packetSystems = [];       // Traveling data packets
    this.hoveredObject = null;
    this.selectedObject = null;

    // Camera animation state
    this.targetCameraPos = null;
    this.targetLookAt = null;
    this.isTransitioningCamera = false;
    this.autoRotate = true;
    this.particleSpeed = 1.0;
    this.showParticles = true;

    // Hover tooltip DOM element
    this.tooltipEl = null;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 550;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060913); // Deep cyber navy
    this.scene.fog = new THREE.FogExp2(0x060913, 0.018);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 18, 26);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    // 4. Controls
    if (THREE.OrbitControls) {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxDistance = 50;
      this.controls.minDistance = 4;
      this.controls.maxPolarAngle = Math.PI / 2 + 0.05; // Stay above ground plane
      this.controls.autoRotate = this.autoRotate;
      this.controls.autoRotateSpeed = 0.6;
    }

    // 5. Lighting
    this.setupLighting();

    // 6. Environment Ground & Ambient Cyber Grid
    this.setupCyberEnvironment();

    // 7. Tooltip DOM creation
    this.createTooltipDOM();

    // 8. Event Listeners
    this.bindEvents();

    // 9. Start Render Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x1a2639, 1.8);
    this.scene.add(ambientLight);

    const mainDirectional = new THREE.DirectionalLight(0x00f0ff, 1.5);
    mainDirectional.position.set(10, 25, 15);
    this.scene.add(mainDirectional);

    const violetAccent = new THREE.DirectionalLight(0x8b5cf6, 1.2);
    violetAccent.position.set(-15, 20, -10);
    this.scene.add(violetAccent);

    // Central pulsing point light
    this.centerCoreLight = new THREE.PointLight(0x00f0ff, 3, 20);
    this.centerCoreLight.position.set(0, 3, 0);
    this.scene.add(this.centerCoreLight);
  }

  setupCyberEnvironment() {
    // Hexagonal / Polar Grid floor
    const gridHelper = new THREE.PolarGridHelper(26, 16, 8, 64, 0x00f0ff, 0x111c38);
    gridHelper.position.y = -0.05;
    this.scene.add(gridHelper);

    // Subtle outer ring
    const ringGeo = new THREE.RingGeometry(24, 25.5, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.15
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = -0.02;
    this.scene.add(ringMesh);

    // Ambient floating starfield / cyber dust particles
    const dustCount = 400;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPositions[i] = (Math.random() - 0.5) * 50;
      dustPositions[i + 1] = Math.random() * 20;
      dustPositions[i + 2] = (Math.random() - 0.5) * 50;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.12,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    this.dustParticles = new THREE.Points(dustGeo, dustMat);
    this.scene.add(this.dustParticles);
  }

  createTooltipDOM() {
    this.tooltipEl = document.createElement('div');
    this.tooltipEl.className = 'cluster-3d-tooltip';
    this.tooltipEl.style.cssText = `
      position: absolute;
      display: none;
      pointer-events: none;
      z-index: 50;
      padding: 8px 12px;
      border-radius: 8px;
      background: rgba(7, 11, 25, 0.88);
      border: 1px solid rgba(0, 240, 255, 0.4);
      backdrop-filter: blur(12px);
      box-shadow: 0 0 20px rgba(0, 240, 255, 0.25);
      color: #fff;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      line-height: 1.4;
      transform: translate(-50%, -120%);
      transition: opacity 0.15s ease-out;
    `;
    this.container.style.position = 'relative';
    this.container.appendChild(this.tooltipEl);
  }

  /**
   * Load Nodes and Pods into the 3D scene
   */
  loadClusterData(nodes, pods) {
    this.clearClusterObjects();

    // 1. Build Control Plane (master node)
    const masterNode = nodes.find(n => n.role.toLowerCase().includes('control') || n.name.includes('master')) || nodes[0];
    const workerNodes = nodes.filter(n => n !== masterNode);

    this.buildControlPlane(masterNode);

    // 2. Build Worker Nodes
    workerNodes.forEach(node => {
      this.buildWorkerNode(node);
    });

    // 3. Build Pods and Connect to their respective Nodes
    pods.forEach(pod => {
      this.buildPod(pod);
    });

    // 4. Create Animated Conduits from Control Plane to Worker Nodes
    workerNodes.forEach(worker => {
      this.createDataConduit(masterNode.position3D, worker.position3D);
    });
  }

  clearClusterObjects() {
    // Remove all previous nodes, pods, conduits
    this.interactableObjects = [];
    this.nodeMeshes.forEach(group => this.scene.remove(group));
    this.nodeMeshes.clear();
    this.podMeshes.forEach(group => this.scene.remove(group));
    this.podMeshes.clear();

    this.conduits.forEach(c => this.scene.remove(c.mesh));
    this.conduits = [];

    this.packetSystems.forEach(p => this.scene.remove(p.points));
    this.packetSystems = [];

    if (this.controlPlaneGroup) {
      this.scene.remove(this.controlPlaneGroup);
      this.controlPlaneGroup = null;
    }
  }

  buildControlPlane(node) {
    const group = new THREE.Group();
    group.position.set(node.position3D.x, node.position3D.y, node.position3D.z);
    group.userData = { type: 'node', data: node, isControlPlane: true };

    // Hexagonal Pedestal Base
    const baseGeo = new THREE.CylinderGeometry(2.8, 3.2, 0.4, 6);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.9,
      wireframe: false
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.2;
    group.add(baseMesh);

    // Glowing Base Border
    const edgeGeo = new THREE.EdgesGeometry(baseGeo);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, linewidth: 2 });
    const edgeLine = new THREE.LineSegments(edgeGeo, edgeMat);
    edgeLine.position.y = 0.2;
    group.add(edgeLine);

    // Rotating Holographic Dodecahedron Core
    const coreGeo = new THREE.DodecahedronGeometry(1.2, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x0066aa,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.8,
      wireframe: false,
      transparent: true,
      opacity: 0.85
    });
    this.controlPlaneCore = new THREE.Mesh(coreGeo, coreMat);
    this.controlPlaneCore.position.y = 2.2;
    group.add(this.controlPlaneCore);

    // Wireframe Cage around Core
    const cageGeo = new THREE.IcosahedronGeometry(1.6, 1);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      wireframe: true,
      transparent: true,
      opacity: 0.45
    });
    this.controlPlaneCage = new THREE.Mesh(cageGeo, cageMat);
    this.controlPlaneCage.position.y = 2.2;
    group.add(this.controlPlaneCage);

    // Orbiting Rings
    const ringGeo1 = new THREE.TorusGeometry(2.0, 0.03, 16, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.7 });
    this.orbitRing1 = new THREE.Mesh(ringGeo1, ringMat1);
    this.orbitRing1.position.y = 2.2;
    this.orbitRing1.rotation.x = Math.PI / 3;
    group.add(this.orbitRing1);

    const ringGeo2 = new THREE.TorusGeometry(2.2, 0.03, 16, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.6 });
    this.orbitRing2 = new THREE.Mesh(ringGeo2, ringMat2);
    this.orbitRing2.position.y = 2.2;
    this.orbitRing2.rotation.y = Math.PI / 4;
    group.add(this.orbitRing2);

    // Hitbox for raycasting
    const hitGeo = new THREE.CylinderGeometry(3.0, 3.2, 3.5, 8);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.position.y = 1.8;
    hitMesh.userData = { parentGroup: group };
    group.add(hitMesh);
    this.interactableObjects.push(hitMesh);

    this.scene.add(group);
    this.controlPlaneGroup = group;
    this.nodeMeshes.set(node.id, group);
  }

  buildWorkerNode(node) {
    const group = new THREE.Group();
    group.position.set(node.position3D.x, node.position3D.y, node.position3D.z);
    group.userData = { type: 'node', data: node, isControlPlane: false };

    // Hexagonal Worker Platform
    const baseGeo = new THREE.CylinderGeometry(2.2, 2.6, 0.35, 6);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0c1428,
      roughness: 0.3,
      metalness: 0.8
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.17;
    group.add(baseMesh);

    // Edge glowing border
    const edgeGeo = new THREE.EdgesGeometry(baseGeo);
    const edgeColor = node.status === 'Ready' ? 0x00f0ff : 0xff3366;
    const edgeMat = new THREE.LineBasicMaterial({ color: edgeColor, linewidth: 2 });
    const edgeLine = new THREE.LineSegments(edgeGeo, edgeMat);
    edgeLine.position.y = 0.17;
    group.add(edgeLine);

    // Inner glowing ring on platform
    const innerRingGeo = new THREE.RingGeometry(1.6, 1.8, 6);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: edgeColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.36;
    group.add(innerRing);

    // Platform status pillar / beacon
    const pylonGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 8);
    const pylonMat = new THREE.MeshStandardMaterial({
      color: edgeColor,
      emissive: edgeColor,
      emissiveIntensity: 0.8
    });
    const pylon = new THREE.Mesh(pylonGeo, pylonMat);
    pylon.position.set(0, 0.7, -1.8);
    group.add(pylon);

    // Raycast hit target
    const hitGeo = new THREE.CylinderGeometry(2.6, 2.8, 2.5, 8);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.position.y = 1.2;
    hitMesh.userData = { parentGroup: group };
    group.add(hitMesh);
    this.interactableObjects.push(hitMesh);

    this.scene.add(group);
    this.nodeMeshes.set(node.id, group);
  }

  buildPod(pod) {
    const parentNodeGroup = Array.from(this.nodeMeshes.values()).find(
      g => g.userData.data.name === pod.node
    );
    if (!parentNodeGroup) return;

    const group = new THREE.Group();
    // Position relative to the parent node platform
    const local = pod.localPos || { x: 0, y: 0.7, z: 0 };
    group.position.set(
      parentNodeGroup.position.x + local.x,
      parentNodeGroup.position.y + local.y,
      parentNodeGroup.position.z + local.z
    );
    group.userData = { type: 'pod', data: pod, parentNode: parentNodeGroup.userData.data };

    // Status-based colors:
    // Green (Running) = 0x00ff88
    // Red (Failed) = 0xff3366
    // Yellow (Pending) = 0xffb800
    let statusColor = 0x00ff88;
    let emissiveColor = 0x008844;
    let emissiveIntensity = 0.6;

    if (pod.status === 'Failed') {
      statusColor = 0xff3366;
      emissiveColor = 0xaa1133;
      emissiveIntensity = 1.0;
    } else if (pod.status === 'Pending') {
      statusColor = 0xffb800;
      emissiveColor = 0x996600;
      emissiveIntensity = 0.8;
    }

    // Pod Geometry: Futuristic Cyber Capsule / Rounded Core
    const podGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.65, 12);
    const podMat = new THREE.MeshStandardMaterial({
      color: 0x111c38,
      roughness: 0.2,
      metalness: 0.8
    });
    const podBody = new THREE.Mesh(podGeo, podMat);
    group.add(podBody);

    // Glowing Core Center Band
    const bandGeo = new THREE.CylinderGeometry(0.30, 0.30, 0.18, 12);
    const bandMat = new THREE.MeshStandardMaterial({
      color: statusColor,
      emissive: statusColor,
      emissiveIntensity: emissiveIntensity,
      roughness: 0.1
    });
    const podBand = new THREE.Mesh(bandGeo, bandMat);
    group.add(podBand);

    // Status Aura / Halo Ring
    const haloGeo = new THREE.RingGeometry(0.38, 0.48, 16);
    const haloMat = new THREE.MeshBasicMaterial({
      color: statusColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.rotation.x = -Math.PI / 2;
    haloMesh.position.y = -0.32;
    group.add(haloMesh);

    // Pulsing Beacon Light for Failed or Pending pods
    if (pod.status === 'Failed' || pod.status === 'Pending') {
      const beaconLight = new THREE.PointLight(statusColor, 1.2, 3);
      beaconLight.position.y = 0.4;
      group.add(beaconLight);
      group.userData.beaconLight = beaconLight;
    }

    // Raycast hit target
    const hitGeo = new THREE.SphereGeometry(0.55, 8, 8);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.userData = { parentGroup: group };
    group.add(hitMesh);
    this.interactableObjects.push(hitMesh);

    this.scene.add(group);
    this.podMeshes.set(pod.id, group);
  }

  createDataConduit(startPos, endPos) {
    // Elegant 3D arc curve between points
    const midX = (startPos.x + endPos.x) / 2;
    const midZ = (startPos.z + endPos.z) / 2;
    const midY = 2.4; // Arch upwards

    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(startPos.x, startPos.y + 0.5, startPos.z),
      new THREE.Vector3(midX, midY, midZ),
      new THREE.Vector3(endPos.x, endPos.y + 0.3, endPos.z)
    );

    // Glowing Conduit Tube
    const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.04, 6, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    this.scene.add(tubeMesh);
    this.conduits.push({ mesh: tubeMesh, curve });

    // Traveling Data Packets along the curve
    const packetCount = 4;
    const packetGeo = new THREE.BufferGeometry();
    const packetPositions = new Float32Array(packetCount * 3);
    packetGeo.setAttribute('position', new THREE.BufferAttribute(packetPositions, 3));
    
    const packetMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.28,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const packetPoints = new THREE.Points(packetGeo, packetMat);
    this.scene.add(packetPoints);

    // Tracking progress for each packet
    const offsets = Array.from({ length: packetCount }, (_, i) => i / packetCount);
    this.packetSystems.push({
      points: packetPoints,
      curve: curve,
      offsets: offsets,
      speed: 0.003
    });
  }

  bindEvents() {
    // Window Resize
    this.onResize = () => {
      if (!this.container) return;
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      if (width === 0 || height === 0) return;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    };
    window.addEventListener('resize', this.onResize);

    // Mouse Move for Raycasting & Tooltips
    const dom = this.renderer.domElement;
    dom.addEventListener('mousemove', (e) => {
      const rect = dom.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.handleHover(e.clientX - rect.left, e.clientY - rect.top);
    });

    dom.addEventListener('mouseleave', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
      this.hideTooltip();
    });

    // Click Selection
    dom.addEventListener('click', () => {
      this.handleClick();
    });
  }

  handleHover(screenX, screenY) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactableObjects);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const group = hit.userData.parentGroup;

      if (this.hoveredObject !== group) {
        this.hoveredObject = group;
        document.body.style.cursor = 'pointer';
      }

      this.showTooltip(group.userData, screenX, screenY);
    } else {
      if (this.hoveredObject) {
        this.hoveredObject = null;
        document.body.style.cursor = 'default';
        this.hideTooltip();
      }
    }
  }

  handleClick() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactableObjects);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const group = hit.userData.parentGroup;
      this.selectEntity(group);
    }
  }

  selectEntity(group) {
    this.selectedObject = group;
    const userData = group.userData;

    // Trigger external callback for side panel update
    this.onSelect(userData.type, userData.data);

    // Smoothly fly camera toward target
    const targetPos = group.position;
    if (userData.type === 'node') {
      this.flyCameraTo(
        new THREE.Vector3(targetPos.x, targetPos.y + 6, targetPos.z + 10),
        new THREE.Vector3(targetPos.x, targetPos.y + 1, targetPos.z)
      );
    } else if (userData.type === 'pod') {
      this.flyCameraTo(
        new THREE.Vector3(targetPos.x, targetPos.y + 3, targetPos.z + 5),
        new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z)
      );
    }
  }

  selectEntityById(type, id) {
    let target = null;
    if (type === 'node') {
      target = this.nodeMeshes.get(id);
    } else if (type === 'pod') {
      target = this.podMeshes.get(id);
    }
    if (target) {
      this.selectEntity(target);
    }
  }

  showTooltip(userData, x, y) {
    if (!this.tooltipEl) return;
    let content = '';

    if (userData.type === 'node') {
      const n = userData.data;
      const statusColor = n.status === 'Ready' ? '#00ff88' : '#ff3366';
      content = `
        <div style="font-weight: 700; color: #00f0ff; margin-bottom: 2px;">NODE: ${n.name}</div>
        <div>Role: <span style="color: #c084fc;">${n.role}</span></div>
        <div>Status: <span style="color: ${statusColor}; font-weight: 600;">${n.status}</span></div>
        <div>CPU: ${n.cpuUsagePercent}% | Mem: ${n.memoryUsagePercent}%</div>
        <div style="color: #94a3b8; font-size: 10px; margin-top: 2px;">Click to inspect node details</div>
      `;
    } else if (userData.type === 'pod') {
      const p = userData.data;
      let statusColor = '#00ff88';
      if (p.status === 'Failed') statusColor = '#ff3366';
      if (p.status === 'Pending') statusColor = '#ffb800';

      content = `
        <div style="font-weight: 700; color: #00f0ff; margin-bottom: 2px;">POD: ${p.name.slice(0, 24)}...</div>
        <div>NS: <span style="color: #a855f7;">${p.namespace}</span></div>
        <div>Status: <span style="color: ${statusColor}; font-weight: 600;">${p.status}</span></div>
        <div>Restarts: ${p.restarts} | CPU: ${p.cpuUsage}</div>
        <div style="color: #94a3b8; font-size: 10px; margin-top: 2px;">Click to view logs & specs</div>
      `;
    }

    this.tooltipEl.innerHTML = content;
    this.tooltipEl.style.display = 'block';
    this.tooltipEl.style.left = `${x}px`;
    this.tooltipEl.style.top = `${y}px`;
  }

  hideTooltip() {
    if (this.tooltipEl) {
      this.tooltipEl.style.display = 'none';
    }
  }

  flyCameraTo(pos, lookAt) {
    this.targetCameraPos = pos;
    this.targetLookAt = lookAt;
    this.isTransitioningCamera = true;
    if (this.controls) this.controls.autoRotate = false;
  }

  // Camera Presets
  setPresetView(viewName) {
    if (viewName === 'overview') {
      this.flyCameraTo(new THREE.Vector3(0, 18, 26), new THREE.Vector3(0, 0, 0));
    } else if (viewName === 'controlPlane') {
      this.flyCameraTo(new THREE.Vector3(0, 5, 8), new THREE.Vector3(0, 2, 0));
    } else if (viewName === 'workers') {
      this.flyCameraTo(new THREE.Vector3(12, 10, 14), new THREE.Vector3(0, 0, 0));
    } else if (viewName === 'topDown') {
      this.flyCameraTo(new THREE.Vector3(0, 32, 0.1), new THREE.Vector3(0, 0, 0));
    }
  }

  toggleAutoRotate(enable) {
    this.autoRotate = enable !== undefined ? enable : !this.autoRotate;
    if (this.controls) this.controls.autoRotate = this.autoRotate;
    return this.autoRotate;
  }

  animate() {
    requestAnimationFrame(this.animate);
    const time = performance.now() * 0.001;

    // 1. Orbit Controls
    if (this.controls) {
      this.controls.update();
    }

    // 2. Camera Lerp Animation
    if (this.isTransitioningCamera && this.targetCameraPos && this.targetLookAt) {
      this.camera.position.lerp(this.targetCameraPos, 0.06);
      if (this.controls) {
        this.controls.target.lerp(this.targetLookAt, 0.06);
      }
      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.2) {
        this.isTransitioningCamera = false;
        if (this.controls && this.autoRotate) {
          this.controls.autoRotate = true;
        }
      }
    }

    // 3. Control Plane Hologram Animations
    if (this.controlPlaneCore) {
      this.controlPlaneCore.rotation.y = time * 0.8;
      this.controlPlaneCore.rotation.x = Math.sin(time * 0.5) * 0.3;
    }
    if (this.controlPlaneCage) {
      this.controlPlaneCage.rotation.y = -time * 0.5;
    }
    if (this.orbitRing1) {
      this.orbitRing1.rotation.z = time * 0.6;
    }
    if (this.orbitRing2) {
      this.orbitRing2.rotation.x = -time * 0.7;
    }
    if (this.centerCoreLight) {
      this.centerCoreLight.intensity = 2.5 + Math.sin(time * 3) * 0.8;
    }

    // 4. Pod Halos & Floating Oscillation
    this.podMeshes.forEach(podGroup => {
      const podData = podGroup.userData.data;
      if (podData.status === 'Running') {
        // Subtle levitation
        podGroup.position.y += Math.sin(time * 2 + podGroup.position.x) * 0.0015;
      } else if (podData.status === 'Failed') {
        // Red flashing beacon
        if (podGroup.userData.beaconLight) {
          podGroup.userData.beaconLight.intensity = 1.0 + Math.sin(time * 8) * 1.0;
        }
      } else if (podData.status === 'Pending') {
        // Slow yellow pulse
        if (podGroup.userData.beaconLight) {
          podGroup.userData.beaconLight.intensity = 0.6 + Math.sin(time * 3) * 0.5;
        }
      }
    });

    // 5. Data Packet Flow on Conduits
    if (this.showParticles) {
      this.packetSystems.forEach(sys => {
        const positions = sys.points.geometry.attributes.position.array;
        for (let i = 0; i < sys.offsets.length; i++) {
          sys.offsets[i] = (sys.offsets[i] + sys.speed * this.particleSpeed) % 1.0;
          const pt = sys.curve.getPointAt(sys.offsets[i]);
          positions[i * 3] = pt.x;
          positions[i * 3 + 1] = pt.y;
          positions[i * 3 + 2] = pt.z;
        }
        sys.points.geometry.attributes.position.needsUpdate = true;
      });
    }

    // 6. Dust particle drift
    if (this.dustParticles) {
      this.dustParticles.rotation.y = time * 0.02;
    }

    // 7. Render
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    window.removeEventListener('resize', this.onResize);
    if (this.renderer && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
