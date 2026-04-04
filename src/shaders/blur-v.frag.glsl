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
uniform int   uBlurEnabled[3];
uniform int   uBlurDir[3];
uniform float uBlurStr[3];

// Compute blur sigma (in pixels) at this UV position.
// Measured from sphere CENTER outward in the chosen direction.
float blurSigma(vec2 uv) {
  float sigma = 0.0;
  for (int i = 0; i < 3; i++) {
    if (i >= uShapeCount || uBlurEnabled[i] == 0) continue;
    vec2  pos = uShapePos[i];
    float r   = uShapeRadius[i];
    float str = uBlurStr[i];
    int   dir = uBlurDir[i];

    float relDist;
    if      (dir == 0) relDist = max(0.0, pos.y - uv.y) / r;              // above center
    else if (dir == 1) relDist = max(0.0, uv.y - pos.y) / r;              // below center
    else if (dir == 2) relDist = max(0.0, pos.x - uv.x) * uCanvasAspect / r; // left of center
    else               relDist = max(0.0, uv.x - pos.x) * uCanvasAspect / r; // right of center

    sigma = max(sigma, relDist * str * 40.0);
  }
  return min(sigma, 48.0);
}

// 13-tap Gaussian — vertical pass
void main() {
  float sigma = blurSigma(vUV);
  if (sigma < 0.5) {
    fragColor = texture(uSceneTex, vUV);
    return;
  }

  float step = max(1.0, sigma * 0.5);
  vec4  col   = vec4(0.0);
  float total = 0.0;
  float inv2s2 = 1.0 / (2.0 * sigma * sigma);

  for (int j = -6; j <= 6; j++) {
    float y = float(j) * step;
    float w = exp(-y * y * inv2s2);
    vec2  sUV = vUV + vec2(0.0, y / uResolution.y);
    col   += texture(uSceneTex, clamp(sUV, 0.001, 0.999)) * w;
    total += w;
  }

  fragColor = col / total;
}
