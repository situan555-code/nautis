/**
 * AKF_TRUST_METADATA_STAMP: VALIDATED
 * Provenance: Antigravity Agent
 * Module: WebGPU Hero Particles (TSL NodeMaterial)
 * Security: Zero-Trust Compliant
 */
/**
 * Three.js Hero — "The Cortex"
 * A morphing 3D sphere of interconnected particles with noise displacement,
 * mouse-reactive warping, bloom glow, and flowing energy.
 *
 * Tree-shaken WebGPU implementation using TSL (Three.js Shading Language)
 */

import {
  Scene,
  Clock,
  PerspectiveCamera,
  Raycaster,
  Plane,
  Vector3,
  Color,
  BufferGeometry,
  BufferAttribute,
  Points,
  LineSegments,
  AdditiveBlending,
  ACESFilmicToneMapping,
  Float32BufferAttribute,
  WebGPURenderer, 
  PointsNodeMaterial, 
  LineBasicNodeMaterial 
} from 'three/webgpu';
import { time, attribute, positionLocal, modelViewMatrix, length, pointUV, smoothstep, float, vec2, max, sin, vec4 } from 'three/tsl';

// ── Config ─────────────────────────────────────────────
const PARTICLE_COUNT = 3000;
const SPHERE_RADIUS = 200;
const CONNECTION_DISTANCE = 28;
const MAX_CONNECTIONS = 800;
const MOUSE_RADIUS = 180;
const NOISE_AMPLITUDE = 35;
const NOISE_SPEED = 0.4;
const ROTATION_SPEED = 0.08;

let scene, camera, renderer, clock;
let particleSystem, linesMesh;
let basePositions, positions;
let mouseNDC = { x: 0, y: 0 };
let mouseWorld = new Vector3();
let raycaster, mousePlane;

// ── Simplex-style 3D noise ─────────────────────────────
function noise3D(x, y, z) {
  const p = [
    151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69,
    142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252,
    219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168,
    68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211,
    133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80,
    73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100,
    109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82,
    85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248,
    152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108,
    110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210,
    144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199,
    106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114,
    67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180,
  ];
  const perm = new Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

  function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function lerp(a, b, t) { return a + t * (b - a); }
  function grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
  x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
  const u = fade(x), v = fade(y), w = fade(z);
  const A = perm[X] + Y, AA = perm[A] + Z, AB = perm[A + 1] + Z;
  const B = perm[X + 1] + Y, BA = perm[B] + Z, BB = perm[B + 1] + Z;

  return lerp(
    lerp(
      lerp(grad(perm[AA], x, y, z), grad(perm[BA], x - 1, y, z), u),
      lerp(grad(perm[AB], x, y - 1, z), grad(perm[BB], x - 1, y - 1, z), u), v
    ),
    lerp(
      lerp(grad(perm[AA + 1], x, y, z - 1), grad(perm[BA + 1], x - 1, y, z - 1), u),
      lerp(grad(perm[AB + 1], x, y - 1, z - 1), grad(perm[BB + 1], x - 1, y - 1, z - 1), u), v
    ),
    w
  );
}

// ── Init ───────────────────────────────────────────────
export async function initHero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  scene = new Scene();
  clock = new Clock();

  // Camera
  camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.z = 500;

  // Renderer
  renderer = new WebGPURenderer({ canvas, alpha: true, antialias: true, forceWebGL: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // Wait for WebGPU Backend to initialize
  await renderer.init();

  // Raycaster for mouse → 3D world
  raycaster = new Raycaster();
  mousePlane = new Plane(new Vector3(0, 0, 1), 0);

  // Create particle sphere & connections
  createParticles();
  createConnections();

  // Events
  window.addEventListener('resize', onResize);
  window.addEventListener('mousemove', onMouseMove, { passive: true });

  // WebGPU compatible render loop
  renderer.setAnimationLoop(animate);
}

function createParticles() {
  const geometry = new BufferGeometry();
  basePositions = new Float32Array(PARTICLE_COUNT * 3);
  positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const alphas = new Float32Array(PARTICLE_COUNT);

  const cyan = new Color(0x00e5ff);
  const electricBlue = new Color(0x4466ff);
  const violet = new Color(0x7c4dff);
  const white = new Color(0xeeeeff);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    const phi = Math.acos(1 - (2 * (i + 0.5)) / PARTICLE_COUNT);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const r = SPHERE_RADIUS;
    basePositions[i3] = r * Math.sin(phi) * Math.cos(theta);
    basePositions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    basePositions[i3 + 2] = r * Math.cos(phi);

    positions[i3] = basePositions[i3];
    positions[i3 + 1] = basePositions[i3 + 1];
    positions[i3 + 2] = basePositions[i3 + 2];

    const yNorm = (basePositions[i3 + 1] + r) / (2 * r);
    let color;
    if (yNorm > 0.6) {
      color = cyan.clone().lerp(white, ((yNorm - 0.6) / 0.4) * 0.3);
    } else if (yNorm > 0.3) {
      color = electricBlue.clone().lerp(cyan, (yNorm - 0.3) / 0.3);
    } else {
      color = violet.clone().lerp(electricBlue, yNorm / 0.3);
    }
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;

    sizes[i] = Math.random() * 3.0 + 1.0;
    alphas[i] = Math.random() * 0.5 + 0.5;
  }

  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('color', new BufferAttribute(colors, 3));
  geometry.setAttribute('size', new BufferAttribute(sizes, 1));
  geometry.setAttribute('alpha', new BufferAttribute(alphas, 1));

  // TSL Node setup
  const pSize = attribute('size');
  const pAlpha = attribute('alpha');
  const pColor = attribute('color', 'vec3');

  // Pulse
  const pulseNode = sin(
    time.mul(1.5).add(positionLocal.x.mul(0.02)).add(positionLocal.y.mul(0.015))
  ).mul(0.2).add(0.8);
  const finalAlpha = pAlpha.mul(pulseNode);

  // Size scale
  const mvPosition = modelViewMatrix.mul(vec4(positionLocal, 1.0));
  const dPR = window.devicePixelRatio || 1;
  const sizeScale = pSize.mul(float(dPR)).mul( float(250.0).div(mvPosition.z.negate()) );
  
  // Fragment dist glow
  const dist = length(pointUV.sub(vec2(0.5)));
  const core = float(1.0).sub(smoothstep(0.0, 0.15, dist));
  const glow = float(1.0).sub(smoothstep(0.15, 0.5, dist));
  
  // Apply final mixes
  const finalColorVec = pColor.mul( core.mul(2.0).add(glow.mul(0.6)) );
  const fragAlpha = core.add(glow.mul(0.4)).mul(finalAlpha);

  const material = new PointsNodeMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending
  });

  material.colorNode = finalColorVec;
  material.opacityNode = fragAlpha;
  material.sizeNode = max(sizeScale, 1.0);

  particleSystem = new Points(geometry, material);
  scene.add(particleSystem);
}

// ── Connection lines ───────────────────────────────────
let lineGeometry;

function createConnections() {
  lineGeometry = new BufferGeometry();
  const linePositions = new Float32Array(MAX_CONNECTIONS * 6);
  const lineColors = new Float32Array(MAX_CONNECTIONS * 6);
  lineGeometry.setAttribute('position', new BufferAttribute(linePositions, 3));
  lineGeometry.setAttribute('color', new BufferAttribute(lineColors, 3));
  lineGeometry.setDrawRange(0, 0);

  const lineMaterial = new LineBasicNodeMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.5,
    blending: AdditiveBlending,
    depthWrite: false,
  });

  linesMesh = new LineSegments(lineGeometry, lineMaterial);
  scene.add(linesMesh);
}

function updateConnections() {
  const lp = lineGeometry.attributes.position.array;
  const lc = lineGeometry.attributes.color.array;
  let count = 0;
  const distSq = CONNECTION_DISTANCE * CONNECTION_DISTANCE;
  const step = Math.max(1, Math.floor(PARTICLE_COUNT / 500));

  for (let i = 0; i < PARTICLE_COUNT && count < MAX_CONNECTIONS; i += step) {
    const i3 = i * 3;
    for (let j = i + step; j < PARTICLE_COUNT && count < MAX_CONNECTIONS; j += step) {
      const j3 = j * 3;
      const dx = positions[i3] - positions[j3];
      const dy = positions[i3 + 1] - positions[j3 + 1];
      const dz = positions[i3 + 2] - positions[j3 + 2];
      const d = dx * dx + dy * dy + dz * dz;

      if (d < distSq) {
        const idx = count * 6;
        lp[idx] = positions[i3];  lp[idx + 1] = positions[i3 + 1];  lp[idx + 2] = positions[i3 + 2];
        lp[idx + 3] = positions[j3]; lp[idx + 4] = positions[j3 + 1]; lp[idx + 5] = positions[j3 + 2];

        const alpha = 1 - Math.sqrt(d) / CONNECTION_DISTANCE;
        const intensity = alpha * 0.6;
        lc[idx] = 0.0 * intensity; lc[idx + 1] = 0.8 * intensity; lc[idx + 2] = 1.0 * intensity;
        lc[idx + 3] = 0.0 * intensity; lc[idx + 4] = 0.8 * intensity; lc[idx + 5] = 1.0 * intensity;

        count++;
      }
    }
  }

  lineGeometry.setDrawRange(0, count * 2);
  lineGeometry.attributes.position.needsUpdate = true;
  lineGeometry.attributes.color.needsUpdate = true;
}

// ── Mouse ──────────────────────────────────────────────
function onMouseMove(e) {
  mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouseNDC, camera);
  raycaster.ray.intersectPlane(mousePlane, mouseWorld);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ── Animation loop ─────────────────────────────────────
const smoothMouse = new Vector3();

async function animate() {
  const t = clock.getElapsedTime();

  // Smooth mouse tracking
  smoothMouse.lerp(mouseWorld, 0.08);

  // Noise displacement + mouse warping
  const noiseTime = t * NOISE_SPEED;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    const bx = basePositions[i3];
    const by = basePositions[i3 + 1];
    const bz = basePositions[i3 + 2];

    const nx = bx * 0.008;
    const ny = by * 0.008;
    const nz = bz * 0.008;

    const noiseVal = noise3D(nx + noiseTime, ny + noiseTime * 0.7, nz + noiseTime * 0.5);
    const displaceAmount = noiseVal * NOISE_AMPLITUDE;

    const len = Math.sqrt(bx * bx + by * by + bz * bz) || 1;
    const normalX = bx / len;
    const normalY = by / len;
    const normalZ = bz / len;

    let px = bx + normalX * displaceAmount;
    let py = by + normalY * displaceAmount;
    let pz = bz + normalZ * displaceAmount;

    // Mouse influence: gravitational pull
    const dx = smoothMouse.x - px;
    const dy = smoothMouse.y - py;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < MOUSE_RADIUS && dist > 5) {
      const force = 1 - dist / MOUSE_RADIUS;
      const strength = force * force * 50;
      px += (dx / dist) * strength;
      py += (dy / dist) * strength;
      pz += force * 20;
    }

    // Breathing
    const breathe = 1 + Math.sin(t * 0.5) * 0.03;
    positions[i3] = px * breathe;
    positions[i3 + 1] = py * breathe;
    positions[i3 + 2] = pz * breathe;
  }

  particleSystem.geometry.attributes.position.needsUpdate = true;

  // Rotate the whole system slowly
  particleSystem.rotation.y = t * ROTATION_SPEED;
  linesMesh.rotation.y = t * ROTATION_SPEED;
  particleSystem.rotation.x = Math.sin(t * 0.15) * 0.15;
  linesMesh.rotation.x = Math.sin(t * 0.15) * 0.15;

  // Update connections every few frames
  if (Math.floor(t * 15) % 2 === 0) {
    updateConnections();
  }

  // Camera drift following mouse
  camera.position.x += (smoothMouse.x * 0.08 - camera.position.x) * 0.03;
  camera.position.y += (smoothMouse.y * 0.06 - camera.position.y) * 0.03;
  camera.lookAt(0, 0, 0);

  // Native WebGPU Render Call
  await renderer.renderAsync(scene, camera);
}
