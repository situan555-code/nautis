import {
  bindActivity,
  cappedDpr,
  isCoarsePointer,
  listenReduced,
  prefersReducedMotion,
  tokenColor,
  watchTheme,
} from './support.js';

const MAX_BALLS = 8;
const SLOTS = MAX_BALLS + 1;

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uScale;
uniform vec4 uBalls[${SLOTS}];
uniform int uCount;
uniform float uThreshold;
uniform vec3 uColor;
out vec4 outColor;
void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) * uScale;
  float field = 0.0;
  for (int i = 0; i < ${SLOTS}; i++) {
    if (i >= uCount) break;
    vec4 ball = uBalls[i];
    vec2 d = p - ball.xy;
    float qq = max(dot(d, d), 1e-4);
    field += ball.z / qq;
  }
  float alpha = field > 3.0 * uThreshold ? 1.0 : clamp((field - uThreshold) * 1.4 + 0.5, 0.0, 1.0);
  outColor = vec4(uColor * alpha, alpha);
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

function makeBalls(count) {
  return Array.from({ length: count }, (_, index) => {
    const seed = (index + 1) * 12.9898;
    const angle = (index / count) * Math.PI * 2;
    return {
      angle,
      rate: index === 0 ? 0.15 : 0.22 + (index % 3) * 0.05,
      reach: index === 0 ? 0.8 : 3.2 + (index % 4) * 0.7,
      radius: index === 0 ? 2.35 : 0.7 + ((seed * 3.1) % 1) * 0.45,
      x: Math.cos(angle) * (index === 0 ? 0.4 : 3),
      y: Math.sin(angle) * (index === 0 ? 0.2 : 2.4),
    };
  });
}

function staticMark(host) {
  host.classList.add('is-static');
  host.dataset.decorState = 'settled';
}

function play(host) {
  const canvas = document.createElement('canvas');
  canvas.className = 'decor-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });
  const vertex = gl && compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = gl && compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl?.createProgram();
  if (!gl || !vertex || !fragment || !program) {
    canvas.remove();
    staticMark(host);
    return;
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.bindAttribLocation(program, 0, 'position');
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    canvas.remove();
    staticMark(host);
    return;
  }
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const narrow = window.innerWidth < 800;
  const count = narrow ? 3 : 5;
  const balls = makeBalls(count);
  const ballData = new Float32Array(SLOTS * 4);
  const pointer = { x: 0, y: 0, inside: false };
  let color = tokenColor('--color-accent').rgb;
  let raf = 0;
  let last = 0;
  let phase = 0;
  let active = true;
  let alive = true;
  let intro = 0;
  const interactive = !narrow && !isCoarsePointer();

  const resize = () => {
    const rect = host.getBoundingClientRect();
    const ratio = cappedDpr(narrow ? 1 : 1.35);
    canvas.width = Math.max(1, Math.round(rect.width * ratio));
    canvas.height = Math.max(1, Math.round(rect.height * ratio));
    gl.viewport(0, 0, canvas.width, canvas.height);
  };

  const draw = () => {
    const spread = Math.min(1, intro);
    for (let i = 0; i < count; i += 1) {
      const ball = balls[i];
      const angle = ball.angle + phase * ball.rate;
      ball.x = Math.cos(angle) * ball.reach * spread;
      ball.y = Math.sin(angle * 0.85 + i) * ball.reach * 0.72 * spread;
      if (i === 0) {
        ball.x *= 0.25;
        ball.y *= 0.25;
      }
      ballData[i * 4] = ball.x;
      ballData[i * 4 + 1] = ball.y;
      ballData[i * 4 + 2] = ball.radius * ball.radius * spread * spread;
      ballData[i * 4 + 3] = 0;
    }
    let drawCount = count;
    if (interactive && pointer.inside) {
      ballData[count * 4] = pointer.x;
      ballData[count * 4 + 1] = pointer.y;
      ballData[count * 4 + 2] = 1.6 * 1.6;
      ballData[count * 4 + 3] = 0;
      drawCount += 1;
    }
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.uniform2f(gl.getUniformLocation(program, 'uResolution'), canvas.width, canvas.height);
    gl.uniform1f(gl.getUniformLocation(program, 'uScale'), 18 / Math.max(1, canvas.height));
    gl.uniform4fv(gl.getUniformLocation(program, 'uBalls'), ballData);
    gl.uniform1i(gl.getUniformLocation(program, 'uCount'), drawCount);
    gl.uniform1f(gl.getUniformLocation(program, 'uThreshold'), 1.15);
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
    canvas.remove();
    staticMark(host);
  };

  const frame = (now) => {
    raf = 0;
    if (!alive || !active) return;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    intro = Math.min(1, intro + dt / 1.4);
    phase += dt * 0.55;
    draw();
    if (intro >= 1 && host.dataset.decorState !== 'settled') host.dataset.decorState = 'settled';
    raf = requestAnimationFrame(frame);
  };

  const onMove = (event) => {
    if (!interactive || (event.pointerType && event.pointerType !== 'mouse')) return;
    const rect = host.getBoundingClientRect();
    const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    pointer.inside = inside;
    if (!inside || rect.height < 2) return;
    const scale = 18 / rect.height;
    pointer.x = (event.clientX - rect.left - rect.width / 2) * scale;
    pointer.y = (rect.top + rect.height / 2 - event.clientY) * scale;
  };

  const unbind = bindActivity(host, (on) => {
    active = on;
    if (on && alive && !raf) raf = requestAnimationFrame(frame);
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
      staticMark(host);
      return;
    }
    play(host);
  });
}
