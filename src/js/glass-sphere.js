/**
 * Glass Sphere Background Effect
 * Full-screen fixed canvas behind all site content.
 * Uses MeshPhysicalMaterial with high transmission for refractive glass look.
 */
import * as THREE from 'three';

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
  renderer.toneMappingExposure = 1.8;

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
    roughness: 0.03,
    transmission: 0.95,
    thickness: 2.0,
    ior: 1.5,
    envMapIntensity: 3.0,
    clearcoat: 0.3,
    clearcoatRoughness: 0.05,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide,
    specularIntensity: 1.0,
    specularColor: new THREE.Color(0xffffff),
  });

  sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  // --- Lighting ---
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0x00e5ff, 8, 30);
  pointLight1.position.set(3, 3, 3);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x7c4dff, 5, 30);
  pointLight2.position.set(-3, -2, 2);
  scene.add(pointLight2);

  const spotLight = new THREE.SpotLight(0xffffff, 4, 20, Math.PI / 6, 0.5, 1);
  spotLight.position.set(0, 5, 5);
  spotLight.lookAt(0, 0, 0);
  scene.add(spotLight);

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
        // Brighter gradient for stronger refractions
        vec3 bottomColor = vec3(0.05, 0.06, 0.12);
        vec3 topColor = vec3(0.1, 0.2, 0.4);
        vec3 accentColor = vec3(0.0, 0.4, 0.6);
        vec3 color = mix(bottomColor, topColor, smoothstep(-0.5, 0.5, h));
        color += accentColor * smoothstep(0.0, 0.3, h) * 0.5;
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  envScene.add(sky);

  // Add bright spots for refraction highlights
  const lightGeo = new THREE.SphereGeometry(1.0, 16, 16);
  const lightMat1 = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x00e5ff).multiplyScalar(3) });
  const lightMat2 = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x7c4dff).multiplyScalar(3) });
  const lightMat3 = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffffff).multiplyScalar(2) });

  const l1 = new THREE.Mesh(lightGeo, lightMat1);
  l1.position.set(5, 3, -2);
  envScene.add(l1);

  const l2 = new THREE.Mesh(lightGeo, lightMat2);
  l2.position.set(-4, -2, 3);
  envScene.add(l2);

  const l3 = new THREE.Mesh(lightGeo, lightMat3);
  l3.position.set(0, 5, 0);
  envScene.add(l3);

  const l4 = new THREE.Mesh(lightGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd700).multiplyScalar(2) }));
  l4.position.set(3, -4, -3);
  envScene.add(l4);

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
