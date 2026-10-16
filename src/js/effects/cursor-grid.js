import {
  cappedDpr,
  isCoarsePointer,
  listenReduced,
  prefersReducedMotion,
  tokenColor,
  watchTheme,
} from './support.js';

const FRAGMENT = `#version 300 es
precision highp float;
precision highp int;
uniform vec2 uResolution;
uniform vec2 uOffset;
uniform float uCellSize;
uniform sampler2D uState;
uniform ivec2 uCells;
uniform vec3 uColor;
uniform vec3 uGridColor;
uniform float uLineWidth;
uniform float uMaxOpacity;
uniform float uFillOpacity;
uniform float uGridOpacity;
uniform vec2 uMouse;
uniform float uRadius;
uniform float uSpotlight;
uniform float uPresence;
uniform float uEdgeFade;
uniform float uReveal;
out vec4 outColor;
float level(vec2 cell) {
  if (cell.x < 0.0 || cell.y < 0.0 || cell.x >= float(uCells.x) || cell.y >= float(uCells.y)) return 0.0;
  float v = texelFetch(uState, ivec2(cell), 0).r;
  return v * v * (3.0 - 2.0 * v);
}
float line(float d, float width) {
  float w = max(width, 1.0);
  return clamp(w * 0.5 + 0.5 - d, 0.0, 1.0) * (width / w);
}
void main() {
  vec2 pos = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
  vec2 g = (pos - uOffset) / uCellSize;
  vec2 cell = floor(g);
  vec2 f = g - cell;
  vec2 edge = min(f, 1.0 - f) * uCellSize;
  float vx = line(edge.x, uLineWidth);
  float vy = line(edge.y, uLineWidth);
  float mark = max(vx, vy);
  vec2 toMouse = pos - uMouse;
  float spot = exp(-dot(toMouse, toMouse) / max(uRadius * uRadius, 1.0) * 1.6) * uSpotlight * uPresence;
  vec2 center = uResolution * 0.5;
  float reach = length(center);
  float shown = uReveal >= 1.0 ? 1.0 : smoothstep(uReveal * (reach + uCellSize * 2.0), uReveal * (reach + uCellSize * 2.0) - uCellSize * 2.0, length(pos - center));
  float fade = 1.0;
  if (uEdgeFade > 0.0) {
    vec2 norm = pos / uResolution;
    vec2 a = clamp(norm / uEdgeFade, 0.0, 1.0);
    vec2 b = clamp((1.0 - norm) / uEdgeFade, 0.0, 1.0);
    vec2 sa = a * a * a * (a * (a * 6.0 - 15.0) + 10.0);
    vec2 sb = b * b * b * (b * (b * 6.0 - 15.0) + 10.0);
    fade = sa.x * sa.y * sb.x * sb.y;
  }
  float own = level(cell);
  vec2 side = step(0.5, f) * 2.0 - 1.0;
  float ex = max(own, level(cell + vec2(side.x, 0.0)));
  float ey = max(own, level(cell + vec2(0.0, side.y)));
  float joint = max(max(ex, ey), level(cell + side));
  float lit = max(vx * (edge.y < uLineWidth ? joint : ex), vy * (edge.x < uLineWidth ? joint : ey));
  float litAlpha = lit * uMaxOpacity * fade;
  float fillAlpha = own * uFillOpacity * fade;
  float gridAlpha = mark * min(uGridOpacity + spot * 0.35, 0.55) * fade * shown;
  float cellAlpha = clamp(max(litAlpha, fillAlpha), 0.0, 1.0);
  float alpha = cellAlpha + gridAlpha * (1.0 - cellAlpha);
  vec3 premul = uColor * cellAlpha + uGridColor * gridAlpha * (1.0 - cellAlpha);
  outColor = vec4(premul, alpha);
}`;

const VERTEX = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
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

function play(section) {
  const canvas = document.createElement('canvas');
  canvas.className = 'decor-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  section.appendChild(canvas);
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
  });
  const vertex = gl && compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = gl && compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl?.createProgram();
  if (!gl || !vertex || !fragment || !program) {
    canvas.remove();
    section.dataset.decorState = 'settled';
    return;
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    canvas.remove();
    section.dataset.decorState = 'settled';
    return;
  }

  const vao = gl.createVertexArray();
  const stateTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, stateTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

  const cellSize = 64;
  const radius = 150;
  let cols = 0;
  let rows = 0;
  let levels = new Float32Array(0);
  let targets = new Float32Array(0);
  let touched = new Float32Array(0);
  let pixels = new Uint8Array(0);
  let offX = 0;
  let offY = 0;
  let ratio = 1;
  let width = 1;
  let height = 1;
  let clock = 0;
  let intro = 0;
  let presence = 0;
  let raf = 0;
  let last = 0;
  let visible = true;
  let dirty = true;
  const pointer = { x: 0, y: 0, inside: false };
  const mouse = { x: 0, y: 0 };
  let colors = {
    ink: tokenColor('--color-text-primary'),
    grid: tokenColor('--hero-grid-major'),
  };

  const rebuild = () => {
    width = Math.max(1, section.clientWidth);
    height = Math.max(1, section.clientHeight);
    ratio = cappedDpr(1.35);
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    const nextCols = Math.ceil(width / cellSize) + 1;
    const nextRows = Math.ceil(height / cellSize) + 1;
    offX = (width - nextCols * cellSize) / 2;
    offY = (height - nextRows * cellSize) / 2;
    if (nextCols !== cols || nextRows !== rows) {
      cols = nextCols;
      rows = nextRows;
      levels = new Float32Array(cols * rows);
      targets = new Float32Array(cols * rows);
      touched = new Float32Array(cols * rows).fill(-1e9);
      pixels = new Uint8Array(cols * rows);
      gl.bindTexture(gl.TEXTURE_2D, stateTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, cols, rows, 0, gl.RED, gl.UNSIGNED_BYTE, pixels);
    }
    dirty = true;
  };

  const energize = (x, y) => {
    const minCol = Math.max(0, Math.floor((x - radius - offX) / cellSize));
    const maxCol = Math.min(cols - 1, Math.floor((x + radius - offX) / cellSize));
    const minRow = Math.max(0, Math.floor((y - radius - offY) / cellSize));
    const maxRow = Math.min(rows - 1, Math.floor((y + radius - offY) / cellSize));
    for (let row = minRow; row <= maxRow; row += 1) {
      for (let col = minCol; col <= maxCol; col += 1) {
        const cx = offX + col * cellSize + cellSize / 2;
        const cy = offY + row * cellSize + cellSize / 2;
        const dist = Math.hypot(cx - x, cy - y);
        if (dist > radius) continue;
        const t = 1 - dist / radius;
        const value = t * t * (3 - 2 * t);
        const index = row * cols + col;
        if (value > targets[index]) targets[index] = value;
        touched[index] = clock;
      }
    }
  };

  const draw = () => {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, stateTexture);
    if (dirty) {
      for (let i = 0; i < levels.length; i += 1) pixels[i] = Math.round(Math.min(1, Math.max(0, levels[i])) * 255);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, cols, rows, gl.RED, gl.UNSIGNED_BYTE, pixels);
      dirty = false;
    }
    const lineDevice = 1 * ratio;
    const u = (name) => gl.getUniformLocation(program, name);
    gl.uniform1i(u('uState'), 0);
    gl.uniform2f(u('uResolution'), canvas.width, canvas.height);
    gl.uniform2f(u('uOffset'), offX * ratio, offY * ratio);
    gl.uniform1f(u('uCellSize'), cellSize * ratio);
    gl.uniform2i(u('uCells'), cols, rows);
    gl.uniform3fv(u('uColor'), colors.ink.rgb);
    gl.uniform3fv(u('uGridColor'), colors.grid.rgb);
    gl.uniform1f(u('uLineWidth'), lineDevice);
    gl.uniform1f(u('uMaxOpacity'), 0.32);
    gl.uniform1f(u('uFillOpacity'), 0.045);
    gl.uniform1f(u('uGridOpacity'), Math.max(0.16, colors.grid.a));
    gl.uniform2f(u('uMouse'), mouse.x * ratio, mouse.y * ratio);
    gl.uniform1f(u('uRadius'), radius * ratio);
    gl.uniform1f(u('uSpotlight'), 0.16);
    gl.uniform1f(u('uPresence'), presence);
    gl.uniform1f(u('uEdgeFade'), 0.2);
    gl.uniform1f(u('uReveal'), intro >= 1 ? 1 : 1 - (1 - intro) ** 2.2);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  };

  const frame = (now) => {
    raf = 0;
    if (!visible || document.hidden) return;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    clock += dt;
    if (intro < 1) intro = Math.min(1, intro + dt / 1.8);
    const follow = 1 - Math.exp(-dt / 0.18);
    mouse.x += (pointer.x - mouse.x) * follow;
    mouse.y += (pointer.y - mouse.y) * follow;
    const goal = pointer.inside ? 1 : 0;
    presence += (goal - presence) * (1 - Math.exp(-dt / 0.35));
    const fadeStep = dt / 2.1;
    let busy = intro < 1 || Math.abs(presence - goal) > 0.004;
    for (let i = 0; i < levels.length; i += 1) {
      let target = targets[i];
      if (target <= 0 && levels[i] <= 0) continue;
      if (clock - touched[i] > 0.9) target = Math.max(0, target - fadeStep);
      targets[i] = target;
      const before = levels[i];
      const next = target > before ? before + (target - before) * (1 - Math.exp(-dt / 0.12)) : target;
      levels[i] = next < 0.004 ? 0 : next;
      if (levels[i] !== before) dirty = true;
      if (levels[i] > 0 || targets[i] > 0) busy = true;
    }
    if (Math.abs(mouse.x - pointer.x) + Math.abs(mouse.y - pointer.y) > 0.4 && presence > 0.01) busy = true;
    draw();
    if (intro >= 1 && section.dataset.decorState !== 'settled') section.dataset.decorState = 'settled';
    if (busy) raf = requestAnimationFrame(frame);
  };

  const wake = () => {
    if (!raf && visible && !document.hidden) {
      last = 0;
      raf = requestAnimationFrame(frame);
    }
  };

  const onMove = (event) => {
    if (event.pointerType && event.pointerType !== 'mouse') return;
    const rect = section.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
    pointer.inside = inside;
    if (!inside) {
      wake();
      return;
    }
    pointer.x = x;
    pointer.y = y;
    if (presence < 0.02) {
      mouse.x = x;
      mouse.y = y;
    }
    energize(x, y);
    wake();
  };

  const onLeave = () => {
    pointer.inside = false;
    wake();
  };

  rebuild();
  section.classList.add('is-grid-live');
  section.dataset.decorState = 'running';
  const resizeObserver = new ResizeObserver(() => {
    rebuild();
    draw();
    wake();
  });
  resizeObserver.observe(section);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = Boolean(entry?.isIntersecting);
    if (visible) wake();
  });
  intersection.observe(section);
  window.addEventListener('pointermove', onMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', onLeave);
  document.addEventListener('visibilitychange', wake);
  const untheme = watchTheme(() => {
    colors = {
      ink: tokenColor('--color-text-primary'),
      grid: tokenColor('--hero-grid-major'),
    };
    dirty = true;
    draw();
  });
  const unlisten = listenReduced(() => {
    cancelAnimationFrame(raf);
    canvas.remove();
    section.classList.remove('is-grid-live');
    section.dataset.decorState = 'settled';
    resizeObserver.disconnect();
    intersection.disconnect();
    window.removeEventListener('pointermove', onMove);
    document.documentElement.removeEventListener('pointerleave', onLeave);
    document.removeEventListener('visibilitychange', wake);
    untheme();
    unlisten();
  });
  draw();
  wake();
}

export function init() {
  document.querySelectorAll('[data-decor="cursor-grid"]').forEach((section) => {
    if (prefersReducedMotion() || isCoarsePointer()) {
      section.dataset.decorState = 'settled';
      return;
    }
    play(section);
  });
}
