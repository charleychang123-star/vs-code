import { useEffect } from 'react';
import { useWebGL } from './useWebGL';
import blurHSrc from '../shaders/blur-h.frag.glsl?raw';
import blurVSrc from '../shaders/blur-v.frag.glsl?raw';

export default function ShaderCanvas({
  fragmentSource,
  sceneUniforms,
  blurUniforms,
  hasBlur,
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

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        cursor: 'default',
      }}
    />
  );
}
