import {
  bindActivity,
  cappedDpr,
  cssColorToRgb,
  listenReduced,
  measureGlyphs,
  mountLayer,
  readInk,
  settle,
  whenShown,
} from './support.js';

const INTRO_MS = 1700;

const VERTEX = `#version 300 es
in vec2 position;
out vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform sampler2D uTextTexture;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uPointerActive;
uniform float uTime;
uniform float uWarpStrength;
uniform float uWarpScale;
uniform float uSpeed;
uniform float uPointerInfluence;
uniform float uPointerStrength;
uniform float uRefraction;
uniform float uChromatic;
uniform float uRipple;
uniform float uMotion;
uniform float uLens;
uniform float uIntro;
uniform float uReveal;
uniform float uBackdrop;
uniform vec4 uClicks[4];
in vec2 vUv;
out vec4 fragColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p *= 2.02;
    amplitude *= 0.5;
  }
  return value;
}
vec4 sampleText(vec2 uv) {
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return vec4(0.0);
  return texture(uTextTexture, uv);
}
void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float time = uTime * uSpeed;
  float scale = max(uWarpScale, 0.001);
  vec2 drift = vec2(time * 0.055, -time * 0.045);
  float n1 = fbm(uv * scale * 3.1 + drift);
  float n2 = fbm((uv + 19.17) * scale * 3.4 - drift.yx);
  vec2 ambient = (vec2(n1, n2) - 0.5) * (uWarpStrength * 0.045 * uMotion + uIntro * 0.18);
  vec2 pointerDelta = uv - uPointer;
  vec2 aspectDelta = vec2(pointerDelta.x * aspect, pointerDelta.y);
  float dist = length(aspectDelta);
  float radius = max(uPointerInfluence, 0.001);
  float t = clamp(dist / radius, 0.0, 1.0);
  float lens = smoothstep(radius, 0.0, dist) * uPointerActive;
  float bulge = t * (1.0 - t) * (1.0 - t) * 6.75 * uPointerActive;
  vec2 dir = dist > 0.0001 ? vec2(aspectDelta.x / aspect, aspectDelta.y) / dist : vec2(0.0);
  float rippleWave = sin(dist * 28.0 - time * 4.2) * 0.5 + 0.5;
  float rippleRing = (rippleWave - 0.5) * uRipple;
  vec2 pointerWarp = dir * rippleRing * bulge * uPointerStrength * 0.016;
  float side = uLens > 0.5 ? -1.0 : 1.0;
  pointerWarp -= dir * side * bulge * uPointerStrength * 0.045;
  vec2 shock = vec2(0.0);
  float shockLight = 0.0;
  for (int i = 0; i < 4; i++) {
    vec4 click = uClicks[i];
    if (click.w <= 0.0) continue;
    vec2 clickDelta = uv - click.xy;
    vec2 clickAspect = vec2(clickDelta.x * aspect, clickDelta.y);
    float clickDist = length(clickAspect);
    float age = click.z;
    float offset = (clickDist - age * 0.9) / (0.06 + age * 0.06);
    float fade = 1.0 - smoothstep(0.0, 1.6, age);
    float energy = exp(-offset * offset) * fade * smoothstep(0.0, 0.08, age) * click.w;
    vec2 clickDir = clickDist > 0.0001 ? vec2(clickAspect.x / aspect, clickAspect.y) / clickDist : vec2(0.0);
    shock -= clickDir * offset * energy * 0.09;
    shockLight += energy;
  }
  vec2 bend = pointerWarp + shock;
  vec2 rest = uv + ambient;
  vec2 splitDir = ambient + bend;
  float splitLen = length(splitDir);
  splitDir = splitLen > 0.00001 ? splitDir / splitLen : vec2(0.7071, 0.7071);
  vec2 split = splitDir * uRefraction * 0.16 * (0.35 + lens * 1.65 + uIntro * 3.0);
  float dispersion = uChromatic * 0.5;
  vec3 ink = vec3(0.0);
  vec3 cover = vec3(0.0);
  vec3 weight = vec3(0.0);
  for (int i = 0; i < 7; i++) {
    float k = 1.0 - float(i) / 3.0;
    vec4 tap = sampleText(rest + bend * (1.0 + dispersion * k) + split * k);
    vec3 band = vec3(max(k, 0.0), 1.0 - abs(k), max(-k, 0.0));
    ink += tap.rgb * band;
    cover += tap.a * band;
    weight += band;
  }
  ink /= weight;
  cover /= weight;
  float a = max(max(cover.r, cover.g), cover.b);
  vec3 color = ink + (a - cover) * uBackdrop;
  color = min(color + (lens + shockLight * 0.5) * cover.g * 0.055, vec3(a));
  fragColor = vec4(color, a) * uReveal;
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
  ctx.font = layout.font;
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  for (const glyph of layout.glyphs) ctx.fillText(glyph.char, glyph.x, glyph.top);
  return canvas;
}

function play(el) {
  const canvas = mountLayer(el);
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false, antialias: true });
  if (!gl) {
    settle(el, canvas);
    return;
  }

  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) {
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
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  const loc = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i += 1) {
    const info = gl.getActiveUniform(program, i);
    if (info) loc[info.name] = gl.getUniformLocation(program, info.name);
  }

  const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, active: 0 };
  let alive = true;
  let active = true;
  let raf = 0;
  let start = 0;
  let last = 0;
  let intro = 0;
  const clicks = new Float32Array(16);

  const upload = () => {
    const layout = measureGlyphs(el);
    const ink = readInk(el);
    const dpr = cappedDpr(1.5);
    const box = el.getBoundingClientRect();
    if (box.width < 2 || box.height < 2 || !layout.glyphs.length) return null;
    canvas.width = Math.max(1, Math.round(box.width * dpr));
    canvas.height = Math.max(1, Math.round(box.height * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    const image = raster({ ...layout, width: box.width, height: box.height }, dpr, ink);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    const { rgb } = cssColorToRgb(ink);
    const luminance = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    return { luminance, width: canvas.width, height: canvas.height };
  };

  const frameInfo = upload();

  const draw = (now) => {
    if (!frameInfo) return;
    const elapsed = (now - start) * 0.001;
    const reveal = Math.min(1, intro / 0.45);
    const smooth = reveal * reveal * (3 - 2 * reveal);
    const settleAmt = 1 - intro;
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.uniform1i(loc.uTextTexture, 0);
    gl.uniform2f(loc.uResolution, frameInfo.width, frameInfo.height);
    gl.uniform2f(loc.uPointer, pointer.x, pointer.y);
    gl.uniform1f(loc.uPointerActive, pointer.active);
    gl.uniform1f(loc.uTime, elapsed);
    gl.uniform1f(loc.uWarpStrength, 0.08 * intro);
    gl.uniform1f(loc.uWarpScale, 1.7);
    gl.uniform1f(loc.uSpeed, 0.55);
    gl.uniform1f(loc.uPointerInfluence, 0.42);
    gl.uniform1f(loc.uPointerStrength, 0.38);
    gl.uniform1f(loc.uRefraction, 0.018);
    gl.uniform1f(loc.uChromatic, 0);
    gl.uniform1f(loc.uRipple, 1);
    gl.uniform1f(loc.uMotion, 1);
    gl.uniform1f(loc.uLens, 0);
    gl.uniform1f(loc.uIntro, settleAmt * settleAmt * settleAmt);
    gl.uniform1f(loc.uReveal, smooth);
    gl.uniform1f(loc.uBackdrop, frameInfo.luminance < 0.5 ? 1 : 0);
    gl.uniform4fv(loc.uClicks, clicks);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const stop = () => {
    if (!alive) return;
    alive = false;
    if (raf) cancelAnimationFrame(raf);
    unbind();
    unlisten();
    el.removeEventListener('pointermove', onMove);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    settle(el, canvas);
  };

  const frame = (now) => {
    raf = 0;
    if (!alive) return;
    if (!start) start = now;
    const dt = last ? Math.min(50, now - last) : 16;
    last = now;
    if (active) intro = Math.min(1, intro + dt / INTRO_MS);
    const follow = 1 - Math.exp(-dt / 140);
    pointer.x += (pointer.tx - pointer.x) * follow;
    pointer.y += (pointer.ty - pointer.y) * follow;
    draw(now);
    if (intro >= 1) {
      stop();
      return;
    }
    if (active) raf = requestAnimationFrame(frame);
  };

  const onMove = (event) => {
    if (event.pointerType && event.pointerType !== 'mouse') return;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    pointer.tx = (event.clientX - rect.left) / rect.width;
    pointer.ty = 1 - (event.clientY - rect.top) / rect.height;
    pointer.active = 1;
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
  window.setTimeout(stop, 6000);
  if (!frameInfo) {
    stop();
    return;
  }
  raf = requestAnimationFrame(frame);
}

export function init() {
  document.querySelectorAll('[data-text-effect="warp"]').forEach((el) => {
    whenShown(el, () => play(el));
  });
}
