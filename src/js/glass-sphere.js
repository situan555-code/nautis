/**
 * Glass Sphere Background Effect
 * Full-screen fixed canvas behind all site content.
 * Uses MeshPhysicalMaterial with high transmission for refractive glass look.
 */
import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

let scene, camera, renderer, sphere, clock;
let mouseTarget = { x: 0, y: 0 };
let mouseCurrent = { x: 0, y: 0 };

export function initGlassSphere() {
  const canvas = document.createElement('canvas');
  canvas.id = 'glass-sphere-canvas';
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -1;
    pointer-events: none;
  `;
  document.body.prepend(canvas);

  scene = new THREE.Scene();
  clock = new THREE.Clock();

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  // --- Environment for refractions ---
  // Generate a procedural environment instead of loading an HDR
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const envScene = createEnvironmentScene();
  const envMap = pmremGenerator.fromScene(envScene, 0.04).texture;
  scene.environment = envMap;
  envScene.dispose();
  pmremGenerator.dispose();

  // --- Glass Sphere ---
  const geometry = new THREE.IcosahedronGeometry(1.6, 128);
  const posAttr = geometry.getAttribute('position');

  // Store original positions for wobble
  const originalPositions = new Float32Array(posAttr.array);
  geometry.userData.originalPositions = originalPositions;

  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xffffff),
    metalness: 0.0,
    roughness: 0.02,
    transmission: 0.97,
    thickness: 1.5,
    ior: 1.45,
    envMapIntensity: 1.2,
    clearcoat: 0.1,
    clearcoatRoughness: 0.1,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
  });

  sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  // --- Subtle ambient light ---
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0x00e5ff, 2, 20);
  pointLight1.position.set(3, 3, 3);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x7c4dff, 1.5, 20);
  pointLight2.position.set(-3, -2, 2);
  scene.add(pointLight2);

  // --- Events ---
  window.addEventListener('resize', onResize);
  window.addEventListener('mousemove', (e) => {
    mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseTarget.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, { passive: true });

  animate();
}

function createEnvironmentScene() {
  const envScene = new THREE.Scene();

  // Create a gradient sky dome
  const skyGeo = new THREE.SphereGeometry(10, 32, 32);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {},
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition).y;
        // Dark gradient from deep navy to subtle teal
        vec3 bottomColor = vec3(0.02, 0.03, 0.06);
        vec3 topColor = vec3(0.04, 0.08, 0.15);
        vec3 accentColor = vec3(0.0, 0.15, 0.25);
        vec3 color = mix(bottomColor, topColor, smoothstep(-0.5, 0.5, h));
        color += accentColor * smoothstep(0.0, 0.3, h) * 0.3;
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  envScene.add(sky);

  // Add some bright spots for refraction highlights
  const lightGeo = new THREE.SphereGeometry(0.5, 16, 16);
  const lightMat1 = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
  const lightMat2 = new THREE.MeshBasicMaterial({ color: 0x7c4dff });
  const lightMat3 = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const l1 = new THREE.Mesh(lightGeo, lightMat1);
  l1.position.set(5, 3, -2);
  envScene.add(l1);

  const l2 = new THREE.Mesh(lightGeo, lightMat2);
  l2.position.set(-4, -2, 3);
  envScene.add(l2);

  const l3 = new THREE.Mesh(lightGeo, lightMat3);
  l3.position.set(0, 5, 0);
  l3.scale.setScalar(0.3);
  envScene.add(l3);

  return envScene;
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();

  // Smooth mouse follow
  mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * 0.03;
  mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * 0.03;

  // Subtle rotation following mouse
  sphere.rotation.y = t * 0.15 + mouseCurrent.x * 0.3;
  sphere.rotation.x = Math.sin(t * 0.1) * 0.1 + mouseCurrent.y * 0.2;

  // --- Organic liquid wobble ---
  const geometry = sphere.geometry;
  const posAttr = geometry.getAttribute('position');
  const original = geometry.userData.originalPositions;

  for (let i = 0; i < posAttr.count; i++) {
    const i3 = i * 3;
    const ox = original[i3];
    const oy = original[i3 + 1];
    const oz = original[i3 + 2];

    const len = Math.sqrt(ox * ox + oy * oy + oz * oz);
    const nx = ox / len;
    const ny = oy / len;
    const nz = oz / len;

    // Multi-frequency noise for organic feel
    const wobble =
      Math.sin(ox * 2.5 + t * 0.8) * 0.015 +
      Math.sin(oy * 3.0 + t * 0.6) * 0.012 +
      Math.sin(oz * 2.0 + t * 1.0) * 0.01 +
      Math.sin((ox + oy) * 1.5 + t * 0.4) * 0.008;

    const scale = 1 + wobble;

    posAttr.array[i3] = ox * scale;
    posAttr.array[i3 + 1] = oy * scale;
    posAttr.array[i3 + 2] = oz * scale;
  }
  posAttr.needsUpdate = true;

  renderer.render(scene, camera);
}
