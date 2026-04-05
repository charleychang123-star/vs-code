#version 300 es
precision highp float;

in vec2 vUV;
out vec4 fragColor;

uniform sampler2D uSceneTex;
uniform vec2      uResolution;
uniform float     uDirWarpAngle;   // degrees, 0=up, 90=right, 180=down, 270=left
uniform float     uDirWarpStr;     // 0–90
uniform int       uDirWarpEnabled;

void main() {
  if (uDirWarpEnabled == 0) {
    fragColor = texture(uSceneTex, vUV);
    return;
  }

  float rad  = uDirWarpAngle * 3.14159265359 / 180.0;
  vec2  dir  = vec2(sin(rad), -cos(rad)) / uResolution;
  float spread = uDirWarpStr * 0.9;   // px spread at str=90 → ~81px

  vec3  col    = vec3(0.0);
  float weight = 0.0;
  const int TAPS = 21;

  for (int i = 0; i < TAPS; i++) {
    float t       = (float(i) / float(TAPS - 1) - 0.5) * spread;
    vec2  sUV     = clamp(vUV + dir * t, vec2(0.0), vec2(1.0));
    float w       = 1.0 - abs(t) / (spread * 0.5 + 0.001);
    col    += texture(uSceneTex, sUV).rgb * max(w, 0.0);
    weight += max(w, 0.0);
  }

  fragColor = vec4(col / max(weight, 0.001), 1.0);
}
