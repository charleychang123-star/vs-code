import { useEffect, useCallback } from 'react';
import { useWebGL } from './useWebGL';
import blurHSrc from '../shaders/blur-h.frag.glsl?raw';
import blurVSrc from '../shaders/blur-v.frag.glsl?raw';

export default function ShaderCanvas({
  fragmentSource,
  sceneUniforms,
  blurUniforms,
  hasBlur,
  onCanvasClick,
}) {
  const { canvasRef, render, getCanvas } = useWebGL({
    sceneFragSrc: fragmentSource,
    blurHFragSrc: hasBlur ? blurHSrc : null,
    blurVFragSrc: hasBlur ? blurVSrc : null,
  });

  // Render loop
  useEffect(() => {
    let rafId;
    const loop = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.width > 0) {
        // Inject canvas-specific uniforms
        const full = {
          uCanvasAspect: { type: '1f', value: canvas.width / canvas.height },
          ...sceneUniforms,
        };
        render(full, hasBlur ? blurUniforms : null);
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [render, sceneUniforms, blurUniforms, hasBlur, canvasRef]);

  // Click → UV coordinates [0,1]×[0,1]
  const handleClick = useCallback((e) => {
    if (!onCanvasClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    onCanvasClick(x, y);
  }, [onCanvasClick]);

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        cursor: onCanvasClick ? 'crosshair' : 'default',
      }}
    />
  );
}
