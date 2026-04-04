#version 300 es
precision highp float;

in vec2 vUV;
out vec4 fragColor;

// ── Shared color system ──────────────────────
uniform vec3  uColorA;
uniform vec3  uColorB;
uniform vec3  uColorC;
uniform float uStop1;
uniform float uStop2;   // reserved for future 4-stop use

// ── Global ───────────────────────────────────
uniform float uGrain;
uniform float uCanvasAspect;

// ── Shape arrays (up to 3) ───────────────────
uniform int   uShapeCount;
uniform vec2  uShapePos[3];      // UV [0,1] x [0,1]
uniform float uShapeRadius[3];   // screen-height proportion units
uniform float uShapeAspect[3];   // shape stretch (1=circle, 2=wide ellipse)
uniform float uShapeWarp[3];     // 0–100

// ── Copy layer arrays (flattened [shape*3+copy]) ─
uniform int   uCopyCount[3];
uniform float uCopySpacing[3];
uniform int   uCopyDir[3];       // 0=top 1=bottom 2=left 3=right
uniform float uCopyScale[9];     // scale multiplier
uniform float uCopyOpacity[9];   // opacity 0–1
uniform float uCopyScaleStep;    // > 1.0 = copies grow; < 1.0 = copies shrink (z-order)

// ─────────────────────────────────────────────
// Simplex noise (for warp)
// ─────────────────────────────────────────────
vec3 _mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec2 _mod289v2(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec3 _permute(vec3 x) { return _mod289((x * 34.0 + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = _mod289v2(i);
  vec3 p = _permute(_permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m * m * m * m;
  vec3 xv = 2.0 * fract(p * C.www) - 1.0;
  vec3 h  = abs(xv) - 0.5;
  vec3 ox = floor(xv + 0.5);
  vec3 a0 = xv - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x   + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

vec2 warpUV(vec2 uv, float strength) {
  if (strength < 0.5) return uv;
  float w = strength * 0.0025;
  return vec2(
    uv.x + snoise(uv * 2.5)               * w,
    uv.y + snoise(uv * 2.5 + vec2(73.156, 31.4)) * w
  );
}

// ─────────────────────────────────────────────
// SDF + gradient
// ─────────────────────────────────────────────
float sphereSDF(vec2 uv, vec2 center, float radius, float shapeAspect) {
  float dx = (uv.x - center.x) * uCanvasAspect / shapeAspect;
  float dy =  uv.y - center.y;
  return sqrt(dx*dx + dy*dy) / radius;
}

// Smooth 3-stop gradient: A at center (dist=0), B peaks at uStop1, C at edge (dist=1)
vec3 gradientMap(float dist) {
  float t  = clamp(dist, 0.0, 1.0);
  float t1 = smoothstep(0.0, uStop1, t);   // A → B over [0, stop1]
  float t2 = smoothstep(uStop1, 1.0, t);   // B → C over [stop1, 1]
  return mix(mix(uColorA, uColorB, t1), uColorC, t2);
}

// Cloud-like soft edge: fades from 50% to 160% of radius so shapes blend softly
void blendElement(inout vec3 color, float dist, float opacity) {
  vec3  elemColor = gradientMap(dist);
  float influence = (1.0 - smoothstep(0.5, 1.6, dist)) * opacity;
  color = mix(color, elemColor, influence);
}

// Render one copy layer
void renderCopy(inout vec3 color, vec2 uv, vec2 pos, float baseR, float sAspect,
                int copyCount, float spacing, int dir, int s, int c) {
  if (c >= copyCount) return;

  int   idx    = s * 3 + c;
  float cScale = uCopyScale[idx];
  float cAlpha = uCopyOpacity[idx];
  float cR     = baseR * cScale;

  float stepDist = spacing * float(c + 1);
  vec2  cPos = pos;
  if      (dir == 0) cPos.y -= stepDist;                   // top
  else if (dir == 1) cPos.y += stepDist;                   // bottom
  else if (dir == 2) cPos.x -= stepDist / uCanvasAspect;  // left
  else               cPos.x += stepDist / uCanvasAspect;  // right

  blendElement(color, sphereSDF(uv, cPos, cR, sAspect), cAlpha);
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────
void main() {
  vec3 color = uColorC;

  for (int s = 0; s < 3; s++) {
    if (s >= uShapeCount) break;

    vec2  pos       = uShapePos[s];
    float baseR     = uShapeRadius[s];
    float sAspect   = uShapeAspect[s];
    int   copyCount = uCopyCount[s];
    float spacing   = uCopySpacing[s];
    int   dir       = uCopyDir[s];

    vec2 uv = warpUV(vUV, uShapeWarp[s]);

    if (uCopyScaleStep >= 1.0) {
      // Copies grow outward → render largest first (behind), base on top
      for (int c = 2; c >= 0; c--) {
        renderCopy(color, uv, pos, baseR, sAspect, copyCount, spacing, dir, s, c);
      }
      blendElement(color, sphereSDF(uv, pos, baseR, sAspect), 1.0);
    } else {
      // Copies shrink → base behind, copies in front (smallest = highest index = on top)
      blendElement(color, sphereSDF(uv, pos, baseR, sAspect), 1.0);
      for (int c = 0; c <= 2; c++) {
        renderCopy(color, uv, pos, baseR, sAspect, copyCount, spacing, dir, s, c);
      }
    }
  }

  // Film grain
  if (uGrain > 0.0) {
    float n = fract(sin(dot(vUV, vec2(12.9898, 78.233))) * 43758.5453);
    color += vec3((n - 0.5) * uGrain * 0.008);
  }

  fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
