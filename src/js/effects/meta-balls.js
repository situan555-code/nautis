import {
  bindActivity,
  cappedDpr,
  isCoarsePointer,
  listenReduced,
  prefersReducedMotion,
  tokenColor,
  watchTheme,
} from './support.js';

const MAX_BALLS = 6;

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uScale;
uniform vec4 uBalls[${MAX_BALLS}];
uniform int uCount;
uniform vec3 uColor;
out vec4 outColor;
void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) * uScale;
  float field = 0.0;
  for (int i = 0; i < ${MAX_BALLS}; i++) {
    if (i >= uCount) break;
    vec4 ball = uBalls[i];
    vec2 d = p - ball.xy;
    field += ball.z / max(dot(d, d), 1e-4);
  }
  float alpha = smoothstep(0.85, 1.15, field);
  outColor = vec4(uColor, alpha);
}`;

const VERTEX = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

function play(host) {
  const canvas = document.createElement('canvas');
  canvas.className = 'decor-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false, antialias: false });
  const vertex = gl && compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = gl && compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl?.createProgram();
  if (!gl || !vertex || !fragment || !program) {
    canvas.remove();
    host.classList.add('is-static');
    host.dataset.decorState = 'settled';
    return;
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.bindAttribLocation(program, 0, 'position');
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    canvas.remove();
    host.classList.add('is-static');
    host.dataset.decorState = 'settled';
    return;
  }
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const narrow = window.innerWidth < 800;
  const coarse = isCoarsePointer();
  const orbitCount = narrow ? 2 : 4;
  const ballData = new Float32Array(MAX_BALLS * 4);
  const pointer = { x: 1.2, y: 0.2, tx: 1.2, ty: 0.2, inside: false };
  let color = tokenColor('--color-accent').rgb;
  let raf = 0;
  let last = 0;
  let phase = 0;
  let active = true;
  let alive = true;

  const resize = () => {
    const rect = host.getBoundingClientRect();
    const ratio = cappedDpr(narrow ? 1 : 1.25);
    canvas.width = Math.max(1, Math.round(Math.max(rect.width, 1) * ratio));
    canvas.height = Math.max(1, Math.round(Math.max(rect.height, 1) * ratio));
    gl.viewport(0, 0, canvas.width, canvas.height);
  };

  const draw = (dt) => {
    const rect = host.getBoundingClientRect();
    const scale = (narrow ? 7.2 : 8.4) / Math.max(rect.height, 1);
    phase += dt * 0.45;
    const spread = narrow ? 1.15 : 1.7;
    for (let i = 0; i < orbitCount; i += 1) {
      const angle = phase * (0.55 + i * 0.08) + (i / orbitCount) * Math.PI * 2;
      const radius = i === 0 ? 2.15 : 0.85 + (i % 3) * 0.28;
      ballData[i * 4] = Math.cos(angle) * spread;
      ballData[i * 4 + 1] = Math.sin(angle * 0.9) * spread * 0.62;
      ballData[i * 4 + 2] = radius * radius;
      ballData[i * 4 + 3] = 0;
    }
    const follow = 1 - Math.exp(-Math.min(0.05, dt) / 0.12);
    pointer.x += (pointer.tx - pointer.x) * follow;
    pointer.y += (pointer.ty - pointer.y) * follow;
    const cursor = orbitCount;
    ballData[cursor * 4] = pointer.x;
    ballData[cursor * 4 + 1] = pointer.y;
    ballData[cursor * 4 + 2] = (narrow ? 1.15 : 1.45) ** 2;
    ballData[cursor * 4 + 3] = 0;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.uniform2f(gl.getUniformLocation(program, 'uResolution'), canvas.width, canvas.height);
    gl.uniform1f(gl.getUniformLocation(program, 'uScale'), scale);
    gl.uniform4fv(gl.getUniformLocation(program, 'uBalls'), ballData);
    gl.uniform1i(gl.getUniformLocation(program, 'uCount'), orbitCount + 1);
    gl.uniform3fv(gl.getUniformLocation(program, 'uColor'), color);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const stop = () => {
    if (!alive) return;
    alive = false;
    if (raf) cancelAnimationFrame(raf);
    unbind();
    unlisten();
    untheme();
    window.removeEventListener('pointermove', onMove);
    resizeObserver.disconnect();
    canvas.remove();
    host.classList.add('is-static');
    host.dataset.decorState = 'settled';
  };

  const frame = (now) => {
    raf = 0;
    if (!alive || !active) return;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    draw(dt);
    if (host.dataset.decorState !== 'settled') host.dataset.decorState = 'settled';
    raf = requestAnimationFrame(frame);
  };

  const onMove = (event) => {
    if (coarse && event.pointerType === 'touch') return;
    const rect = host.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    pointer.inside = inside;
    if (!inside) return;
    const scale = (narrow ? 7.2 : 8.4) / rect.height;
    pointer.tx = (event.clientX - (rect.left + rect.width / 2)) * scale;
    pointer.ty = ((rect.top + rect.height / 2) - event.clientY) * scale;
  };

  const unbind = bindActivity(host, (on) => {
    active = on;
    if (on && alive && !raf) {
      last = 0;
      raf = requestAnimationFrame(frame);
    }
    if (!on && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  });
  const unlisten = listenReduced(stop);
  const untheme = watchTheme(() => {
    color = tokenColor('--color-accent').rgb;
  });
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  window.addEventListener('pointermove', onMove, { passive: true });
  host.dataset.decorState = 'running';
  resize();
  raf = requestAnimationFrame(frame);
}

export function init() {
  document.querySelectorAll('[data-decor="meta-balls"]').forEach((host) => {
    if (prefersReducedMotion()) {
      host.classList.add('is-static');
      host.dataset.decorState = 'settled';
      return;
    }
    play(host);
  });
}
