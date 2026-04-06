/**
 * AKF_TRUST_METADATA_STAMP: VALIDATED
 * Provenance: Antigravity Agent
 * Module: WebGPU Hero Particles (TSL NodeMaterial)
 * Security: Zero-Trust Compliant
 */
import {
  Scene,
  Clock,
  PerspectiveCamera,
  Raycaster,
  Plane,
  Vector2,
  Vector3,
  Color,
  InstancedMesh,
  PlaneGeometry,
  AdditiveBlending,
  ACESFilmicToneMapping,
  InstancedBufferAttribute,
  StorageInstancedBufferAttribute,
  WebGPURenderer,
  Matrix4,
  Euler
} from 'three/webgpu';
import { MeshBasicNodeMaterial, time, positionLocal, modelViewMatrix, length, uv, smoothstep, float, vec2, max, sin, vec4, vec3, storage, instanceIndex, Fn, uniform, mx_noise_float, attribute } from 'three/tsl';
import Stats from 'three/addons/libs/stats.module.js';

// ── Config ─────────────────────────────────────────────
const PARTICLE_COUNT = 30000;
const SPHERE_RADIUS = 200;
const MOUSE_RADIUS = 180;
const NOISE_AMPLITUDE = 35;
const NOISE_SPEED = 0.4;
const ROTATION_SPEED = 0.08;

let scene, camera, renderer, clock, stats;
let particleSystem;
let basePosStorage, posStorage, prevPosStorage, computeNode;
let mousePosUniform3D, mouseClickStateUniform, aspectUniform;
let mouseTarget = new Vector2(0, 0);
let mouseCurrent = new Vector2(0, 0);
let mouseWorld3D = new Vector3(0, 0, 0);

// ── Init ───────────────────────────────────────────────
export async function initHero() {
  console.log("⚡ initHero() started");
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) {
    console.error("❌ canvas not found!");
    return;
  }

  scene = new Scene();
  clock = new Clock();

  camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.z = 500;

  mousePosUniform3D = uniform(new Vector3(0, 0, 0));
  mouseClickStateUniform = uniform(0.0);
  aspectUniform = uniform(window.innerWidth / window.innerHeight);

  stats = new Stats();
  stats.dom.style.position = 'absolute';
  stats.dom.style.top = '10px';
  stats.dom.style.right = '10px';
  
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('debug') === 'true') {
    document.body.appendChild(stats.dom);
  }

  window.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.key.toLowerCase() === 'd') {
      if (document.body.contains(stats.dom)) {
        document.body.removeChild(stats.dom);
      } else {
        document.body.appendChild(stats.dom);
      }
    }
  });

  renderer = new WebGPURenderer({ canvas, alpha: true, antialias: true, forceWebGL: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  createParticles();

  window.addEventListener('resize', onResize);
  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('mousedown', () => { mouseClickStateUniform.value = 1.0; });
  window.addEventListener('mouseup', () => { mouseClickStateUniform.value = 0.0; });

  renderer.setAnimationLoop(animate);
}

function createParticles() {
  const basePositions = new Float32Array(PARTICLE_COUNT * 3);
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

  // 1. Dynamic explicit storage buffers for GPU computation
  const basePosBuffer = new StorageInstancedBufferAttribute(basePositions, 3);
  const posBuffer = new StorageInstancedBufferAttribute(new Float32Array(basePositions), 3);
  const prevPosBuffer = new StorageInstancedBufferAttribute(new Float32Array(basePositions), 3);
  
  basePosStorage = storage(basePosBuffer, 'vec3', PARTICLE_COUNT);
  posStorage = storage(posBuffer, 'vec3', PARTICLE_COUNT);
  prevPosStorage = storage(prevPosBuffer, 'vec3', PARTICLE_COUNT);

  // 2. Compute physics safely
  const computePhysics = Fn(() => {
    const baseNode = basePosStorage.element(instanceIndex);
    const posNode = posStorage.element(instanceIndex);
    const prevNode = prevPosStorage.element(instanceIndex);

    // Double buffering: store previous frame position
    prevNode.assign(posNode);

    const noiseTime = time.mul(NOISE_SPEED);
    const len = length(baseNode);
    const normal = baseNode.div(max(len, 1.0));

    const nx = baseNode.x.mul(0.008).add(noiseTime);
    const ny = baseNode.y.mul(0.008).add(noiseTime.mul(0.7));
    const nz = baseNode.z.mul(0.008).add(noiseTime.mul(0.5));
    
    // TSL standard 3D noise mapping
    const nVal = mx_noise_float(vec3(nx, ny, nz));
    const displaceAmount = nVal.mul(NOISE_AMPLITUDE);
    const displacedPos = baseNode.add(normal.mul(displaceAmount));
    
    // TSL Gravity Well Mathematics (Reading accurate 3D Inverse space)
    const dx = mousePosUniform3D.x.sub(displacedPos.x);
    const dy = mousePosUniform3D.y.sub(displacedPos.y);
    const dz = mousePosUniform3D.z.sub(displacedPos.z);
    
    // Use 3D length for perfect volumetric intersection mapping
    const mDist = length(vec3(dx, dy, dz));

    // Calculate fluid influence zone limit
    const interactionRadius = float(180.0);
    const influence = float(1.0).sub(mDist.div(interactionRadius)).max(0.0);
    
    // Determine polarity: hover repels (-1), click attracts (+1)
    const polarity = mouseClickStateUniform.mul(2.0).sub(1.0);
    
    // Calculate final force vector safely to prevent NaN from 0-length vectors
    const mDistSafe = max(mDist, float(0.001));
    const linearDir = vec2(dx, dy).div(mDistSafe);
    const orthogonalDir = vec2(dy.negate(), dx).div(mDistSafe);
    
    // Combine linear and orbital forces based on click state
    const combinedForceVec = linearDir.mix(orthogonalDir, mouseClickStateUniform.mul(float(0.6)));
    
    // Smooth nonlinear scaling of force power 
    const strength = influence.mul(influence).mul(80.0);
    const pullDir = combinedForceVec.mul(strength).mul(polarity);

    const fluidPos = displacedPos.add(vec3(pullDir, influence.mul(20.0)));

    const breathe = float(1.0).add(sin(time.mul(0.5)).mul(0.03));
    posNode.assign(fluidPos.mul(breathe));
  });

  computeNode = computePhysics().compute(PARTICLE_COUNT);

  // 3. Static attributes for instance configuration
  const geometry = new PlaneGeometry(1, 1);
  geometry.setAttribute('instanceColor', new InstancedBufferAttribute(colors, 3));
  geometry.setAttribute('instanceSize', new InstancedBufferAttribute(sizes, 1));
  geometry.setAttribute('instanceAlpha', new InstancedBufferAttribute(alphas, 1));

  // 4. MeshMaterial using explicit instance mapping without division errors
  const material = new MeshBasicNodeMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending
  });

  const pColor = attribute('instanceColor', 'vec3');
  const pSize = attribute('instanceSize', 'float');
  const pAlpha = attribute('instanceAlpha', 'float');

  // Read dynamically computed values from storage securely configured for vertex pipeline execution!
  const physPos = posStorage.toReadOnly().element(instanceIndex);
  const prevPos = prevPosStorage.toReadOnly().element(instanceIndex);
  
  const pulseNode = sin(
    time.mul(1.5).add(physPos.x.mul(0.02)).add(physPos.y.mul(0.015))
  ).mul(0.2).add(0.8);
  const finalAlpha = pAlpha.mul(pulseNode);

  const mvPosition = modelViewMatrix.mul(vec4(physPos, 1.0));
  const zDepth = max(mvPosition.z.negate(), 0.1); 
  const dPR = window.devicePixelRatio || 1;
  const sizeScale = pSize.mul(float(dPR)).mul( float(250.0).div(zDepth) );

  const dist = length(uv().sub(vec2(0.5)));
  const core = float(1.0).sub(smoothstep(0.0, 0.15, dist));
  const glow = float(1.0).sub(smoothstep(0.15, 0.5, dist));
  
  const finalColorVec = pColor.mul( core.mul(2.0).add(glow.mul(0.6)) );
  const fragAlpha = core.add(glow.mul(0.4)).mul(finalAlpha);

  const scaledVertexPos = positionLocal.mul(max(sizeScale, 1.0));
  
  // Velocity Stretch
  const velocity = physPos.sub(prevPos);
  const speed = length(velocity);
  const stretchDir = velocity.div(max(speed, float(0.001)));
  const stretchAmount = speed.mul(float(8.0)); 

  // Stretch particle along velocity. Using positionLocal.y isolates a directional bias over the Quad.
  const stretchOffset = stretchDir.mul(positionLocal.y).mul(stretchAmount);
  
  material.positionNode = physPos.add(scaledVertexPos).add(stretchOffset);
  material.colorNode = finalColorVec;
  material.opacityNode = fragAlpha;

  // 5. Explicitly create the 30k Instanced Mesh with identity matrices
  particleSystem = new InstancedMesh(geometry, material, PARTICLE_COUNT);
  
  const dummyMatrix = new Matrix4();
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particleSystem.setMatrixAt(i, dummyMatrix);
  }
  particleSystem.instanceMatrix.needsUpdate = true;
  
  scene.add(particleSystem);
  window.__particleSystem = particleSystem;
  console.log("✅ Particles initialized array:", posBuffer.array.length);
}

function onMouseMove(e) {
  mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouseTarget.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  aspectUniform.value = camera.aspect;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Use synchronous tick function to avoid WebGPU Promise deadlocks.
function animate() {
  const t = clock.getElapsedTime();

  // GPU Uniform Lerp Execution (CPU handles nothing but smooth interpolation of 2 floats)
  mouseCurrent.lerp(mouseTarget, 0.08);

  const rotY = t * ROTATION_SPEED;
  const rotX = Math.sin(t * 0.15) * 0.15;

  particleSystem.rotation.y = rotY;
  particleSystem.rotation.x = rotX;
  
  // Inverse Rotation Math to accurately cast mouse 2D Screen hits onto the rotated 3D Object Space
  const worldExtentsY = 288.675; 
  const worldExtentsX = worldExtentsY * camera.aspect;
  
  mouseWorld3D.set(mouseCurrent.x * worldExtentsX, mouseCurrent.y * worldExtentsY, 0);
  
  const inverseEuler = new Euler(-rotX, -rotY, 0, 'YXZ');
  mouseWorld3D.applyEuler(inverseEuler);
  
  mousePosUniform3D.value.copy(mouseWorld3D);

  camera.position.x += (mouseCurrent.x * 30 - camera.position.x) * 0.03;
  camera.position.y += (mouseCurrent.y * 30 - camera.position.y) * 0.03;
  camera.lookAt(0, 0, 0);

  // Trigger GPU compute (Queues natively into WebGPU buffer)
  if (computeNode) renderer.compute(computeNode);

  renderer.render(scene, camera);
  
  if (document.body.contains(stats.dom)) {
    stats.update();
  }
}
