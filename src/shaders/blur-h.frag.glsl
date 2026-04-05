#version 300 es
precision highp float;

in vec2 vUV;
out vec4 fragColor;

uniform sampler2D uSceneTex;
uniform vec2      uResolution;
uniform float     uCanvasAspect;

uniform int   uShapeCount;
uniform vec2  uShapePos[3];
uniform float uShapeRadius[3];
uniform float uShapeMaxRadius[3];  // bounding radius of full shape group (base + copies)
uniform int   uBlurEnabled[3];
uniform int   uBlurDir[3];         // 0=top 1=bottom 2=left 3=right 4=center
uniform float uBlurStr[3];

// Compute blur sigma (px) at this UV position.
// Grows from sphere CENTER outward in the chosen direction,
// masked to the shape group's bounding area.
float blurSigma(vec2 uv) {
  float sigma = 0.0;
  for (int i = 0; i < 3; i++) {
    if (i >= uShapeCount || uBlurEnabled[i] == 0) continue;
    vec2  pos  = uShapePos[i];
    float r    = uShapeRadius[i];
    float maxR = uShapeMaxRadius[i];
    float str  = uBlurStr[i];
    int   dir  = uBlurDir[i];

    float relDist;
    if      (dir == 0) relDist = max(0.0, pos.y - uv.y) / r;
    else if (dir == 1) relDist = max(0.0, uv.y - pos.y) / r;
    else if (dir == 2) relDist = max(0.0, pos.x - uv.x) * uCanvasAspect / r;
    else if (dir == 3) relDist = max(0.0, uv.x - pos.x) * uCanvasAspect / r;
    else {
      // center: radial blur from center
      float dx = (uv.x - pos.x) * uCanvasAspect;
      float dy =  uv.y - pos.y;
      relDist = sqrt(dx*dx + dy*dy) / r;
    }

    // Mask: fade sigma to zero beyond the shape group's bounding area
    float dx = (uv.x - pos.x) * uCanvasAspect;
    float dy =  uv.y - pos.y;
    float normDist = sqrt(dx*dx + dy*dy) / max(maxR, 0.001);
    float mask = 1.0 - smoothstep(0.6, 1.8, normDist);

    sigma = max(sigma, relDist * str * 40.0 * mask);
  }
  return min(sigma, 48.0);
}

// 13-tap Gaussian — horizontal pass
void main() {
  float sigma = blurSigma(vUV);
  if (sigma < 0.5) {
    fragColor = texture(uSceneTex, vUV);
    return;
  }

  // Continuous step: eliminates the discrete jump that caused banding
  float step = sigma * 0.5;
  vec4  col   = vec4(0.0);
  float total = 0.0;
  float inv2s2 = 1.0 / (2.0 * sigma * sigma);

  for (int j = -6; j <= 6; j++) {
    float x = float(j) * step;
    float w = exp(-x * x * inv2s2);
    vec2  sUV = vUV + vec2(x / uResolution.x, 0.0);
    col   += texture(uSceneTex, clamp(sUV, 0.001, 0.999)) * w;
    total += w;
  }

  fragColor = col / total;
}
