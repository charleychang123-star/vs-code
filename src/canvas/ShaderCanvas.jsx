import { useEffect } from 'react';
import { useWebGL } from './useWebGL';
import blurHSrc    from '../shaders/blur-h.frag.glsl?raw';
import blurVSrc    from '../shaders/blur-v.frag.glsl?raw';
import warpDirSrc  from '../shaders/warp-dir.frag.glsl?raw';

export default function ShaderCanvas({
  fragmentSource,
  sceneUniforms,
  blurUniforms,
  hasBlur,
  warpDirUniforms,
}) {
  const { canvasRef, render } = useWebGL({
    sceneFragSrc:   fragmentSource,
    blurHFragSrc:   hasBlur ? blurHSrc : null,
    blurVFragSrc:   hasBlur ? blurVSrc : null,
    warpDirFragSrc: warpDirSrc,
  });

  useEffect(() => {
    let rafId;
    const loop = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.width > 0) {
        const full = {
          uCanvasAspect: { type: '1f', value: canvas.width / canvas.height },
          ...sceneUniforms,
        };
        render(full, hasBlur ? blurUniforms : null, warpDirUniforms);
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [render, sceneUniforms, blurUniforms, hasBlur, warpDirUniforms, canvasRef]);

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
