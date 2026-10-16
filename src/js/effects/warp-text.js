import {
  bindActivity,
  cappedDpr,
  listenReduced,
  measureGlyphs,
  mountLayer,
  prefersReducedMotion,
  readInk,
  settle,
  whenShown,
} from './support.js';

const VERTEX = `#version 300 es
in vec2 position;
out vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform sampler2D uText;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uPointerActive;
uniform float uTime;
uniform float uAmp;
in vec2 vUv;
out vec4 fragColor;

void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 fromPointer = uv - uPointer;
  vec2 scaled = vec2(fromPointer.x * aspect, fromPointer.y);
  float dist = length(scaled);
  float reach = 0.55;
  float lens = smoothstep(reach, 0.0, dist) * uPointerActive;
  vec2 dir = dist > 0.0001 ? fromPointer / dist : vec2(0.0);
  float wave = sin(uv.y * 10.0 + uTime * 1.7) * sin(uv.x * 7.0 - uTime * 1.15);
  vec2 warp = vec2(wave * 0.28, wave) * uAmp;
  warp += dir * lens * 0.06;
  vec2 sampleUv = uv + warp;
  float split = (0.004 + lens * 0.012) * uAmp * 40.0;
  vec4 red = texture(uText, sampleUv + vec2(split, 0.0));
  vec4 green = texture(uText, sampleUv);
  vec4 blue = texture(uText, sampleUv - vec2(split, 0.0));
  float alpha = max(max(red.a, green.a), blue.a);
  vec3 color = vec3(red.r, green.g, blue.b);
  fragColor = vec4(color, alpha);
}`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function raster(layout, dpr, color) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(layout.width * dpr));
  canvas.height = Math.max(1, Math.round(layout.height * dpr));
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, layout.width, layout.height);
  ctx.font = layout.font;
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  for (const glyph of layout.glyphs) ctx.fillText(glyph.char, glyph.x, glyph.top);
  return canvas;
}

function play(el) {
  if (prefersReducedMotion()) {
    el.dataset.textEffectState = 'settled';
    return;
  }

  const layout = measureGlyphs(el);
  layout.font = getComputedStyle(el).font;
  const ink = readInk(el);
  if (!layout.glyphs.length) {
    el.dataset.textEffectState = 'settled';
    return;
  }

  const canvas = mountLayer(el);
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false, antialias: false });
  const vertex = gl && compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = gl && compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl?.createProgram();
  if (!gl || !vertex || !fragment || !program) {
    settle(el, canvas);
    return;
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.bindAttribLocation(program, 0, 'position');
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    settle(el, canvas);
    return;
  }

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const narrow = window.innerWidth < 760;
  const dpr = cappedDpr(narrow ? 1.15 : 1.35);
  const image = raster(layout, dpr, ink);
  const box = el.getBoundingClientRect();
  canvas.width = Math.max(1, Math.round((box.width || layout.width) * dpr));
  canvas.height = Math.max(1, Math.round((box.height || layout.height) * dpr));
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  const loc = {
    text: gl.getUniformLocation(program, 'uText'),
    resolution: gl.getUniformLocation(program, 'uResolution'),
    pointer: gl.getUniformLocation(program, 'uPointer'),
    pointerActive: gl.getUniformLocation(program, 'uPointerActive'),
    time: gl.getUniformLocation(program, 'uTime'),
    amp: gl.getUniformLocation(program, 'uAmp'),
  };

  const pointer = { x: 0.5, y: 0.62, tx: 0.5, ty: 0.62, active: 0 };
  let alive = true;
  let active = true;
  let raf = 0;
  let start = 0;
  let last = 0;

  const draw = (now) => {
    const elapsed = start ? (now - start) * 0.001 : 0;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.uniform1i(loc.text, 0);
    gl.uniform2f(loc.resolution, canvas.width, canvas.height);
    gl.uniform2f(loc.pointer, pointer.x, pointer.y);
    gl.uniform1f(loc.pointerActive, pointer.active);
    gl.uniform1f(loc.time, elapsed);
    gl.uniform1f(loc.amp, narrow ? 0.03 : 0.042);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const stop = () => {
    if (!alive) return;
    alive = false;
    if (raf) cancelAnimationFrame(raf);
    unbind();
    unlisten();
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerleave', onLeave);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    settle(el, canvas);
  };

  const frame = (now) => {
    raf = 0;
    if (!alive || !active) return;
    if (!start) start = now;
    const dt = last ? Math.min(40, now - last) : 16;
    last = now;
    const follow = 1 - Math.exp(-dt / 90);
    pointer.x += (pointer.tx - pointer.x) * follow;
    pointer.y += (pointer.ty - pointer.y) * follow;
    if (!pointer.active && elapsedEnough(now)) el.dataset.textEffectState = 'settled';
    draw(now);
    raf = requestAnimationFrame(frame);
  };

  const elapsedEnough = (now) => start && now - start > 700;

  const onMove = (event) => {
    if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const inside = x >= 0 && y >= 0 && x <= 1 && y <= 1;
    pointer.active = inside ? 1 : 0;
    if (!inside) return;
    pointer.tx = x;
    pointer.ty = 1 - y;
  };

  const onLeave = () => {
    pointer.active = 0;
  };

  const unbind = bindActivity(el, (on) => {
    active = on;
    if (on && alive && !raf) raf = requestAnimationFrame(frame);
    if (!on && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  });
  const unlisten = listenReduced(stop);
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerleave', onLeave);
  raf = requestAnimationFrame(frame);
}

export function init() {
  document.querySelectorAll('[data-text-effect="warp"]').forEach((el) => {
    whenShown(el, () => play(el));
  });
}
