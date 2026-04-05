import { useState, useCallback, useRef, useEffect } from 'react';
import ShaderCanvas from './canvas/ShaderCanvas';
import Panel from './ui/Panel';
import CanvasSizeToggle from './ui/controls/CanvasSizeToggle';
import ShapePlacementMap from './ui/controls/ShapePlacementMap';
import sphereFrag from './shaders/sphere.frag.glsl?raw';
import { DEFAULT_PARAMS, CANVAS_SIZES, DIR_OPTIONS, FLIP_DIR } from './constants/defaults';
import { useHistory } from './hooks/useHistory';

const MAX_COPIES = 6;
const GRADIENT_MODES = { radial: 0, follow: 1, reverse: 2 };
const SHAPE_TYPES = ['circle', 'square', 'diamond', 'blob'];

// ── Helpers ──────────────────────────────────────────
function hexToGL(hex) {
  return [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ];
}

function buildUniforms(params) {
  const shapeKeys = ['A', 'B', 'C'];
  const activeShapes = shapeKeys
    .map(k => params.shapes[k])
    .filter(s => s.active);
  const count = activeShapes.length;

  const scaleBase = params.copyScaleStep / 100;
  const opacBase  = params.copyOpacityStep / 100;
  const computedCopyScale   = Array.from({ length: MAX_COPIES }, (_, i) => Math.pow(scaleBase, i + 1));
  const computedCopyOpacity = Array.from({ length: MAX_COPIES }, (_, i) => Math.pow(opacBase, i + 1));

  const shapeType      = new Int32Array(3);
  const shapePos       = new Float32Array(6);
  const shapeRadius    = new Float32Array(3);
  const shapeAspect    = new Float32Array(3);
  const shapeWarp      = new Float32Array(3);
  const copyCount      = new Int32Array(3);
  const copySpacing    = new Float32Array(3);
  const copyDir        = new Int32Array(3);
  const copyDirAngle   = new Float32Array(3);
  const copyScale      = new Float32Array(3 * MAX_COPIES);
  const copyOpacity    = new Float32Array(3 * MAX_COPIES);
  const blurEnabled    = new Int32Array(3);
  const blurDir        = new Int32Array(3);
  const blurStr        = new Float32Array(3);
  const shapeMaxRadius = new Float32Array(3);

  activeShapes.forEach((s, i) => {
    shapeType[i]        = SHAPE_TYPES.indexOf(params.shapeType);
    shapePos[i * 2]     = s.posX;
    shapePos[i * 2 + 1] = s.posY;
    shapeRadius[i]  = params.radius;
    shapeAspect[i]  = params.aspect;
    shapeWarp[i]    = params.warp;
    copyCount[i]    = params.copyCount;
    copySpacing[i]  = params.copySpacing;

    const baseDir      = params.copyDir === 'custom' ? 5 : DIR_OPTIONS.indexOf(params.copyDir);
    const isFlipped    = s.flip === true;
    const effectiveDir = (isFlipped && baseDir <= 3) ? FLIP_DIR[baseDir] : baseDir;
    copyDir[i]      = effectiveDir;
    copyDirAngle[i] = isFlipped && baseDir === 5
      ? ((params.copyDirAngle + 180) % 360)
      : params.copyDirAngle;
    blurDir[i] = effectiveDir;

    computedCopyScale.forEach((v, c)   => { copyScale[i * MAX_COPIES + c]   = v; });
    computedCopyOpacity.forEach((v, c) => { copyOpacity[i * MAX_COPIES + c] = v; });

    blurEnabled[i] = params.blurEnabled ? 1 : 0;
    blurStr[i]     = params.blurStr;

    const maxCopyScale = params.copyCount > 0 ? Math.pow(scaleBase, params.copyCount) : 1;
    const maxR = Math.max(params.radius, params.radius * maxCopyScale)
               + params.copyCount * params.copySpacing;
    shapeMaxRadius[i] = maxR;
  });

  const sceneUniforms = {
    uColorA:         { type: '3f',  value: hexToGL(params.colorA) },
    uColorB:         { type: '3f',  value: hexToGL(params.colorB) },
    uColorC:         { type: '3f',  value: hexToGL(params.colorC) },
    uStop1:          { type: '1f',  value: params.stop1 },
    uGradientMode:   { type: '1i',  value: GRADIENT_MODES[params.gradientMode] ?? 0 },
    uEdgeSoft:       { type: '1f',  value: params.edgeSoft / 100 },
    uGrain:          { type: '1f',  value: params.grain },
    uShapeCount:     { type: '1i',  value: count },
    uShapeType:      { type: '1iv', value: shapeType },
    uShapePos:       { type: '2fv', value: shapePos },
    uShapeRadius:    { type: '1fv', value: shapeRadius },
    uShapeAspect:    { type: '1fv', value: shapeAspect },
    uShapeWarp:      { type: '1fv', value: shapeWarp },
    uCopyCount:      { type: '1iv', value: copyCount },
    uCopySpacing:    { type: '1fv', value: copySpacing },
    uCopyDir:        { type: '1iv', value: copyDir },
    uCopyDirAngle:   { type: '1fv', value: copyDirAngle },
    uCopyScale:      { type: '1fv', value: copyScale },
    uCopyOpacity:    { type: '1fv', value: copyOpacity },
    uCopyScaleStep:  { type: '1f',  value: scaleBase },
    uBiWarpStr:      { type: '1f',  value: params.biWarpEnabled ? params.biWarpStr : 0 },
    uBiWarpXOn:      { type: '1i',  value: (params.biWarpEnabled && params.biWarpXOn) ? 1 : 0 },
    uBiWarpYOn:      { type: '1i',  value: (params.biWarpEnabled && params.biWarpYOn) ? 1 : 0 },
    uDirWarpEnabled: { type: '1i',  value: params.dirWarpEnabled ? 1 : 0 },
  };

  const blurUniforms = {
    uShapeCount:     { type: '1i',  value: count },
    uShapePos:       { type: '2fv', value: shapePos },
    uShapeRadius:    { type: '1fv', value: shapeRadius },
    uShapeMaxRadius: { type: '1fv', value: shapeMaxRadius },
    uBlurEnabled:    { type: '1iv', value: blurEnabled },
    uBlurDir:        { type: '1iv', value: blurDir },
    uBlurStr:        { type: '1fv', value: blurStr },
  };

  const warpDirUniforms = {
    uDirWarpEnabled: { type: '1i', value: params.dirWarpEnabled ? 1 : 0 },
    uDirWarpAngle:   { type: '1f', value: params.dirWarpAngle },
    uDirWarpStr:     { type: '1f', value: params.dirWarpStr },
  };

  const hasBlur = params.blurEnabled && count > 0;

  return { sceneUniforms, blurUniforms, warpDirUniforms, hasBlur };
}

// ── App ───────────────────────────────────────────────
export default function App() {
  const { params, updateGlobal, updateShape, undo, redo, canUndo, canRedo } = useHistory(DEFAULT_PARAMS);
  const containerRef = useRef(null);
  const [displaySize, setDisplaySize] = useState({ w: 800, h: 450 });

  // Compute canvas display size from container + target aspect ratio
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const compute = () => {
      const { clientWidth: cw, clientHeight: ch } = el;
      const ratio = CANVAS_SIZES[params.canvasSize].ratio;
      let w, h;
      if (cw / ch > ratio) { h = ch; w = Math.round(ch * ratio); }
      else                  { w = cw; h = Math.round(cw / ratio); }
      setDisplaySize({ w, h });
    };
    const obs = new ResizeObserver(compute);
    obs.observe(el);
    compute();
    return () => obs.disconnect();
  }, [params.canvasSize]);

  // ── Export ───────────────────────────────────────────
  const handleExport = useCallback(() => {
    const wrapper = document.querySelector('.canvas-wrapper');
    if (!wrapper) return;
    const canvas = wrapper.querySelector('canvas');
    if (!canvas) return;
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `brand-visual-${params.canvasSize.replace(':', 'x')}-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }, [params.canvasSize]);

  // ── Build uniforms ───────────────────────────────────
  const { sceneUniforms, blurUniforms, warpDirUniforms, hasBlur } = buildUniforms(params);

  return (
    <div className="app">
      <Panel
        params={params}
        updateGlobal={updateGlobal}
        updateShape={updateShape}
        onExport={handleExport}
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <div className="canvas-area" ref={containerRef}>
        <div
          className="canvas-wrapper"
          style={{ width: displaySize.w, height: displaySize.h }}
        >
          <ShaderCanvas
            fragmentSource={sphereFrag}
            sceneUniforms={sceneUniforms}
            blurUniforms={blurUniforms}
            hasBlur={hasBlur}
            warpDirUniforms={warpDirUniforms}
          />
        </div>

        <CanvasSizeToggle
          current={params.canvasSize}
          onChange={v => updateGlobal('canvasSize', v)}
        />

        <ShapePlacementMap
          params={params}
          updateShape={updateShape}
          updateGlobal={updateGlobal}
        />
      </div>
    </div>
  );
}
