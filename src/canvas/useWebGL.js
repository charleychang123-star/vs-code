import { useRef, useEffect, useCallback } from 'react';

const VERT_SRC = `#version 300 es
in vec2 aPos;
out vec2 vUV;
void main() {
  vUV = vec2(aPos.x * 0.5 + 0.5, aPos.y * -0.5 + 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

function compileShader(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error('[Shader error]', gl.getShaderInfoLog(s), '\n---\n', src);
    gl.deleteShader(s);
    return null;
  }
  return s;
}

function buildProgram(gl, fragSrc) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  if (!vs || !fs) return null;
  const p = gl.createProgram();
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error('[Program error]', gl.getProgramInfoLog(p));
    gl.deleteProgram(p);
    return null;
  }
  return p;
}

function createFBO(gl, w, h) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return { fbo, tex };
}

function deleteFBO(gl, fboObj) {
  if (!fboObj) return;
  gl.deleteFramebuffer(fboObj.fbo);
  gl.deleteTexture(fboObj.tex);
}

// ─────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────
export function useWebGL({ sceneFragSrc, blurHFragSrc, blurVFragSrc, warpDirFragSrc }) {
  const canvasRef = useRef(null);
  const st = useRef({
    gl: null,
    vao: null,
    programs: { scene: null, blurH: null, blurV: null, warpDir: null },
    ulocs: { scene: {}, blurH: {}, blurV: {}, warpDir: {} },
    fbos: { a: null, b: null, c: null },
    size: { w: 0, h: 0 },
  });

  // ── Init GL + fullscreen quad ────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true });
    if (!gl) { console.error('WebGL2 not supported'); return; }
    st.current.gl = gl;

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    st.current.vao = vao;

    return () => {
      gl.deleteBuffer(buf);
      gl.deleteVertexArray(vao);
    };
  }, []);

  // ── Build scene program when source changes ──────────
  useEffect(() => {
    const { gl } = st.current;
    if (!gl || !sceneFragSrc) return;
    if (st.current.programs.scene) gl.deleteProgram(st.current.programs.scene);
    st.current.programs.scene = buildProgram(gl, sceneFragSrc);
    st.current.ulocs.scene = {};
  }, [sceneFragSrc]);

  // ── Build blur programs ──────────────────────────────
  useEffect(() => {
    const { gl } = st.current;
    if (!gl || !blurHFragSrc || !blurVFragSrc) return;
    if (st.current.programs.blurH) gl.deleteProgram(st.current.programs.blurH);
    if (st.current.programs.blurV) gl.deleteProgram(st.current.programs.blurV);
    st.current.programs.blurH = buildProgram(gl, blurHFragSrc);
    st.current.programs.blurV = buildProgram(gl, blurVFragSrc);
    st.current.ulocs.blurH = {};
    st.current.ulocs.blurV = {};
  }, [blurHFragSrc, blurVFragSrc]);

  // ── Build warpDir program ────────────────────────────
  useEffect(() => {
    const { gl } = st.current;
    if (!gl || !warpDirFragSrc) return;
    if (st.current.programs.warpDir) gl.deleteProgram(st.current.programs.warpDir);
    st.current.programs.warpDir = buildProgram(gl, warpDirFragSrc);
    st.current.ulocs.warpDir = {};
  }, [warpDirFragSrc]);

  // ── Resize + FBO management ──────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);
      if (w === st.current.size.w && h === st.current.size.h) return;
      canvas.width = w;
      canvas.height = h;
      st.current.size = { w, h };

      const { gl } = st.current;
      if (!gl || w === 0 || h === 0) return;
      gl.viewport(0, 0, w, h);

      deleteFBO(gl, st.current.fbos.a);
      deleteFBO(gl, st.current.fbos.b);
      deleteFBO(gl, st.current.fbos.c);
      st.current.fbos.a = createFBO(gl, w, h);
      st.current.fbos.b = createFBO(gl, w, h);
      st.current.fbos.c = createFBO(gl, w, h);
    };

    const obs = new ResizeObserver(resize);
    obs.observe(canvas);
    resize();
    return () => obs.disconnect();
  }, []);

  // ── Internal: set one uniform on the currently-bound program ──
  const _setU = useCallback((progKey, name, type, value) => {
    const { gl, programs, ulocs } = st.current;
    const prog = programs[progKey];
    if (!gl || !prog) return;
    const cache = ulocs[progKey];
    if (!(name in cache)) cache[name] = gl.getUniformLocation(prog, name);
    const loc = cache[name];
    if (loc === null) return;
    switch (type) {
      case '1f':  gl.uniform1f(loc, value); break;
      case '2f':  gl.uniform2f(loc, value[0], value[1]); break;
      case '3f':  gl.uniform3f(loc, value[0], value[1], value[2]); break;
      case '1i':  gl.uniform1i(loc, value); break;
      case '1fv': gl.uniform1fv(loc, value); break;
      case '2fv': gl.uniform2fv(loc, value); break;
      case '1iv': gl.uniform1iv(loc, value); break;
    }
  }, []);

  // ── Render: up to 4-pass pipeline ───────────────────
  // sceneUniforms:   { name: { type, value } }
  // blurUniforms:    same structure (pass null to skip blur)
  // warpDirUniforms: same structure (pass null to skip dir-warp)
  const render = useCallback((sceneUniforms, blurUniforms, warpDirUniforms) => {
    const { gl, programs, fbos, size } = st.current;
    if (!gl || !programs.scene) return;
    const { w, h } = size;
    if (w === 0 || h === 0) return;

    const setAll = (progKey, uniforms) => {
      for (const [name, { type, value }] of Object.entries(uniforms)) {
        _setU(progKey, name, type, value);
      }
    };

    const hasBlur    = programs.blurH && programs.blurV && blurUniforms && fbos.a && fbos.b;
    const hasWarpDir = programs.warpDir && warpDirUniforms && fbos.c;

    // Determine intermediate target for scene pass
    const sceneTarget = (hasBlur || hasWarpDir) ? fbos.a.fbo : null;

    // ── Pass 1: scene → FBO A (or screen) ───────────
    gl.bindFramebuffer(gl.FRAMEBUFFER, sceneTarget);
    gl.viewport(0, 0, w, h);
    gl.useProgram(programs.scene);
    setAll('scene', sceneUniforms);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    if (!hasBlur && !hasWarpDir) return;

    const blurBase = {
      uResolution:   { type: '2f', value: [w, h] },
      uCanvasAspect: { type: '1f', value: w / h },
      uSceneTex:     { type: '1i', value: 0 },
      ...(blurUniforms || {}),
    };

    if (hasBlur) {
      // ── Pass 2: H-blur (FBO A → FBO B) ────────────
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbos.b.fbo);
      gl.viewport(0, 0, w, h);
      gl.useProgram(programs.blurH);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fbos.a.tex);
      setAll('blurH', blurBase);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // ── Pass 3: V-blur (FBO B → FBO A or screen) ──
      const vBlurTarget = hasWarpDir ? fbos.a.fbo : null;
      gl.bindFramebuffer(gl.FRAMEBUFFER, vBlurTarget);
      gl.viewport(0, 0, w, h);
      gl.useProgram(programs.blurV);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fbos.b.tex);
      setAll('blurV', blurBase);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    if (hasWarpDir) {
      // ── Pass 4: dir-warp (FBO A → screen) ─────────
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, w, h);
      gl.useProgram(programs.warpDir);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fbos.a.tex);
      const warpBase = {
        uResolution: { type: '2f', value: [w, h] },
        uSceneTex:   { type: '1i', value: 0 },
        ...warpDirUniforms,
      };
      setAll('warpDir', warpBase);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  }, [_setU]);

  const getCanvas = useCallback(() => canvasRef.current, []);

  return { canvasRef, render, getCanvas };
}
