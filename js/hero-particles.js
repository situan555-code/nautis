/**
 * Three.js Hero — Animated particle field with interactive mouse tracking.
 * Creates a flowing constellation-style particle system that responds to cursor movement.
 */

(function() {
  'use strict';

  const PARTICLE_COUNT = 1800;
  const CONNECTION_DISTANCE = 120;
  const MOUSE_INFLUENCE = 200;

  let scene, camera, renderer, particles, mouse, clock;
  let positions, velocities, colors;
  let mouseWorld = { x: 0, y: 0 };

  function init() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    scene = new THREE.Scene();
    clock = new THREE.Clock();

    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 400;

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Particle Geometry
    const geometry = new THREE.BufferGeometry();
    positions = new Float32Array(PARTICLE_COUNT * 3);
    velocities = new Float32Array(PARTICLE_COUNT * 3);
    colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);

    const cyan = new THREE.Color(0x00e5ff);
    const blue = new THREE.Color(0x0066ff);
    const white = new THREE.Color(0x8899bb);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Spread particles in a sphere-ish volume
      positions[i3]     = (Math.random() - 0.5) * 800;
      positions[i3 + 1] = (Math.random() - 0.5) * 600;
      positions[i3 + 2] = (Math.random() - 0.5) * 400;

      // Slow drift velocities
      velocities[i3]     = (Math.random() - 0.5) * 0.3;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.2;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.15;

      // Color variation
      const colorChoice = Math.random();
      const color = colorChoice < 0.4 ? cyan : (colorChoice < 0.7 ? blue : white);
      colors[i3]     = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = Math.random() * 2.5 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Shader Material for particles
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float uTime;
        uniform float uPixelRatio;

        void main() {
          vColor = color;
          vec3 pos = position;
          pos.y += sin(uTime * 0.3 + position.x * 0.01) * 5.0;
          pos.x += cos(uTime * 0.2 + position.z * 0.01) * 3.0;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = size * uPixelRatio * (200.0 / -mvPosition.z);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;

          float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
          alpha *= 0.7;
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Connection lines (draw fewer for performance)
    createConnectionLines();

    // Events
    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    animate();
  }

  // Lightweight line connections between nearby particles
  let lineGeometry, lineMaterial, linesMesh;

  function createConnectionLines() {
    const maxLines = 600;
    lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(maxLines * 6);
    const lineColors = new Float32Array(maxLines * 6);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
    lineGeometry.setDrawRange(0, 0);

    lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(linesMesh);
  }

  function updateConnectionLines() {
    const linePositions = lineGeometry.attributes.position.array;
    const lineColors = lineGeometry.attributes.color.array;
    let lineCount = 0;
    const maxLines = 600;
    const distSq = CONNECTION_DISTANCE * CONNECTION_DISTANCE;

    // Only check a subset for performance
    const step = Math.max(1, Math.floor(PARTICLE_COUNT / 300));

    for (let i = 0; i < PARTICLE_COUNT && lineCount < maxLines; i += step) {
      const i3 = i * 3;
      for (let j = i + step; j < PARTICLE_COUNT && lineCount < maxLines; j += step) {
        const j3 = j * 3;
        const dx = positions[i3] - positions[j3];
        const dy = positions[i3 + 1] - positions[j3 + 1];
        const dz = positions[i3 + 2] - positions[j3 + 2];
        const d = dx * dx + dy * dy + dz * dz;

        if (d < distSq) {
          const idx = lineCount * 6;
          linePositions[idx]     = positions[i3];
          linePositions[idx + 1] = positions[i3 + 1];
          linePositions[idx + 2] = positions[i3 + 2];
          linePositions[idx + 3] = positions[j3];
          linePositions[idx + 4] = positions[j3 + 1];
          linePositions[idx + 5] = positions[j3 + 2];

          const alpha = 1 - (d / distSq);
          lineColors[idx]     = 0 * alpha;
          lineColors[idx + 1] = 0.9 * alpha;
          lineColors[idx + 2] = 1 * alpha;
          lineColors[idx + 3] = 0 * alpha;
          lineColors[idx + 4] = 0.9 * alpha;
          lineColors[idx + 5] = 1 * alpha;

          lineCount++;
        }
      }
    }

    lineGeometry.setDrawRange(0, lineCount * 2);
    lineGeometry.attributes.position.needsUpdate = true;
    lineGeometry.attributes.color.needsUpdate = true;
  }

  function onMouseMove(e) {
    mouseWorld.x = ((e.clientX / window.innerWidth) * 2 - 1) * 300;
    mouseWorld.y = -((e.clientY / window.innerHeight) * 2 - 1) * 200;
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    particles.material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
  }

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    particles.material.uniforms.uTime.value = t;

    // Drift particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      positions[i3]     += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];

      // Gentle mouse attraction
      const dx = mouseWorld.x - positions[i3];
      const dy = mouseWorld.y - positions[i3 + 1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_INFLUENCE && dist > 10) {
        const force = (1 - dist / MOUSE_INFLUENCE) * 0.02;
        positions[i3]     += dx * force;
        positions[i3 + 1] += dy * force;
      }

      // Wrap around boundaries
      if (positions[i3] > 400) positions[i3] = -400;
      if (positions[i3] < -400) positions[i3] = 400;
      if (positions[i3 + 1] > 300) positions[i3 + 1] = -300;
      if (positions[i3 + 1] < -300) positions[i3 + 1] = 300;
    }

    particles.geometry.attributes.position.needsUpdate = true;

    // Update line connections every few frames for performance
    if (Math.floor(t * 10) % 3 === 0) {
      updateConnectionLines();
    }

    // Subtle camera sway
    camera.position.x += (mouseWorld.x * 0.05 - camera.position.x) * 0.02;
    camera.position.y += (mouseWorld.y * 0.03 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  // Start when DOM and Three.js are ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
