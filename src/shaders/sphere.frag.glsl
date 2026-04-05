#version 300 es
precision highp float;

in vec2 vUV;
out vec4 fragColor;

// ── Shared color system ──────────────────────
uniform vec3  uColorA;
uniform vec3  uColorB;
uniform vec3  uColorC;
uniform float uStop1;
uniform int   uGradientMode;  // 0=radial  1=follow copyDir  2=reverse (180° flip)
uniform float uEdgeSoft;      // 0=crisp edge  1=full cloud feather

// ── Global ───────────────────────────────────
uniform float uGrain;
uniform float uCanvasAspect;

// ── Shape arrays (up to 3) ───────────────────
uniform int   uShapeCount;
uniform int   uShapeType[3];    // 0=circle 1=square 2=diamond 3=blob
uniform vec2  uShapePos[3];
uniform float uShapeRadius[3];
uniform float uShapeAspect[3];
uniform float uShapeWarp[3];

// ── Filter Library ───────────────────────────
uniform float uBiWarpStr;
uniform int   uBiWarpXOn;
uniform int   uBiWarpYOn;
uniform int   uDirWarpEnabled;

// ── Copy layer arrays (shape*6+copy) ─────────
uniform int   uCopyCount[3];
uniform float uCopySpacing[3];
uniform int   uCopyDir[3];       // 0=top 1=bottom 2=left 3=right 4=center 5=custom angle
uniform float uCopyDirAngle[3];  // degrees, used when dir==5. 0=top, 90=right, 180=bottom, 270=left
uniform float uCopyScale[18];
uniform float uCopyOpacity[18];
uniform float uCopyScaleStep;    // >1 = copies grow; <1 = copies shrink

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
    uv.x + snoise(uv * 2.5)                      * w,
    uv.y + snoise(uv * 2.5 + vec2(73.156, 31.4)) * w
  );
}

vec2 biWarpUV(vec2 uv, float str, int xOn, int yOn) {
  if (str < 0.5) return uv;
  float w = str * 0.003;
  float wx = float(xOn) * (snoise(uv * 2.0)
                          + 0.5 * snoise(uv * 4.0 + vec2(17.3, 5.1)));
  float wy = float(yOn) * (snoise(uv * 2.0 + vec2(91.7, 45.2))
                          + 0.5 * snoise(uv * 4.0 + vec2(33.1, 88.4)));
  return uv + vec2(wx, wy) * w;
}

// ─────────────────────────────────────────────
// SDF + gradient
// ─────────────────────────────────────────────
float sphereSDF(vec2 uv, vec2 center, float radius, float shapeAspect) {
  float dx = (uv.x - center.x) * uCanvasAspect / shapeAspect;
  float dy =  uv.y - center.y;
  return sqrt(dx*dx + dy*dy) / radius;
}

float squareSDF(vec2 uv, vec2 center, float r, float sAspect) {
  float dx = abs((uv.x - center.x) * uCanvasAspect / sAspect) / r;
  float dy = abs(uv.y - center.y) / r;
  return max(dx, dy);
}

float diamondSDF(vec2 uv, vec2 center, float r, float sAspect) {
  float dx = abs((uv.x - center.x) * uCanvasAspect / sAspect) / r;
  float dy = abs(uv.y - center.y) / r;
  return dx + dy;
}

float blobSDF(vec2 uv, vec2 center, float r, float sAspect) {
  vec2 o1 = center + vec2( 0.12 / uCanvasAspect,  0.08) * r;
  vec2 o2 = center + vec2(-0.10 / uCanvasAspect, -0.09) * r;
  float d0 = sphereSDF(uv, center, r,        sAspect);
  float d1 = sphereSDF(uv, o1,    r * 0.75,  sAspect);
  float d2 = sphereSDF(uv, o2,    r * 0.65,  sAspect);
  float k  = 0.3;
  float h1 = clamp(0.5 + 0.5 * (d1 - d0) / k, 0.0, 1.0);
  float h2 = clamp(0.5 + 0.5 * (d2 - d0) / k, 0.0, 1.0);
  return min(mix(d1, d0, h1) - k * h1 * (1.0 - h1),
             mix(d2, d0, h2) - k * h2 * (1.0 - h2));
}

float shapeSDF(vec2 uv, vec2 center, float r, float sAspect, int type) {
  if (type == 1) return squareSDF(uv, center, r, sAspect);
  if (type == 2) return diamondSDF(uv, center, r, sAspect);
  if (type == 3) return blobSDF(uv, center, r, sAspect);
  return sphereSDF(uv, center, r, sAspect);
}

// 3-stop smooth gradient
vec3 gradientMap(float dist) {
  float t  = clamp(dist, 0.0, 1.0);
  float t1 = smoothstep(0.0, uStop1, t);
  float t2 = smoothstep(uStop1, 1.0, t);
  return mix(mix(uColorA, uColorB, t1), uColorC, t2);
}

// Directional gradient distance [0,1] along a given direction axis.
// 0 = warm end (colorA side), 1 = cool/bg end (colorC side).
float dirGradDist(vec2 uv, vec2 pos, float r, int dir, float angle) {
  float d;
  if      (dir == 0) d = (pos.y - uv.y) / r;                  // top: warm at bottom
  else if (dir == 1) d = (uv.y - pos.y) / r;                  // bottom: warm at top
  else if (dir == 2) d = (pos.x - uv.x) * uCanvasAspect / r;  // left: warm at right
  else if (dir == 3) d = (uv.x - pos.x) * uCanvasAspect / r;  // right: warm at left
  else if (dir == 5) {
    // Custom angle: 0°=copies spread top, 90°=right, 180°=bottom, 270°=left
    float rad = angle * 3.14159265359 / 180.0;
    float dx = (uv.x - pos.x) * uCanvasAspect;
    float dy =  uv.y - pos.y;
    d = (dx * sin(rad) - dy * cos(rad)) / r;
  }
  else               return sphereSDF(uv, pos, r, 1.0);        // center: radial fallback
  return clamp(d * 0.5 + 0.5, 0.0, 1.0);
}

// Edge blend: edgeSoft=0 → crisp (0.95–1.05), edgeSoft=1 → full cloud (0.5–1.6)
void blendElement(inout vec3 color, float sdfDist, float gradDist, float opacity) {
  vec3  elemColor = gradientMap(gradDist);
  float inner = mix(0.95, 0.5,  uEdgeSoft);
  float outer = mix(1.05, 1.6,  uEdgeSoft);
  float influence = (1.0 - smoothstep(inner, outer, sdfDist)) * opacity;
  color = mix(color, elemColor, influence);
}

// Return the gradient distance for a given element center + size,
// respecting the current gradient mode.
float computeGradDist(vec2 uv, vec2 pos, float r, float sAspect, int dir, float angle) {
  if (uGradientMode == 0) {
    return sphereSDF(uv, pos, r, sAspect);
  }
  // reverse: flip direction axis by XOR with 1 (top↔bottom, left↔right; center/custom unchanged)
  int gDir = (uGradientMode == 2 && dir <= 3) ? (dir ^ 1) : dir;
  // For custom angle reverse: rotate angle 180°
  float gAngle = (uGradientMode == 2 && dir == 5) ? mod(angle + 180.0, 360.0) : angle;
  return dirGradDist(uv, pos, r, gDir, gAngle);
}

// Render one copy layer with edge-anchored alignment
void renderCopy(inout vec3 color, vec2 uv, vec2 pos, float baseR, float sAspect,
                int copyCount, float spacing, int dir, float angle, int s, int c, int shType) {
  if (c >= copyCount) return;

  int   idx    = s * 6 + c;
  float cScale = uCopyScale[idx];
  float cAlpha = uCopyOpacity[idx];
  float cR     = baseR * cScale;

  // Anchor the edge of each copy at the base edge facing the copy direction.
  float scaleDiff = cR - baseR;
  float stepDist  = spacing * float(c + 1);
  vec2  cPos = pos;
  if      (dir == 0) { cPos.y -= scaleDiff + stepDist; }
  else if (dir == 1) { cPos.y += scaleDiff + stepDist; }
  else if (dir == 2) { cPos.x -= (scaleDiff * sAspect + stepDist) / uCanvasAspect; }
  else if (dir == 3) { cPos.x += (scaleDiff * sAspect + stepDist) / uCanvasAspect; }
  else if (dir == 5) {
    // Custom angle: decompose offset into UV X/Y components (aspect-corrected)
    float rad = angle * 3.14159265359 / 180.0;
    float total = scaleDiff + stepDist;
    cPos.x += sin(rad) * total / uCanvasAspect;
    cPos.y -= cos(rad) * total;
  }
  // dir == 4 (center): no offset

  float sdfDist  = shapeSDF(uv, cPos, cR, sAspect, shType);
  float gradDist = computeGradDist(uv, cPos, cR, sAspect, dir, angle);
  blendElement(color, sdfDist, gradDist, cAlpha);
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
    float angle     = uCopyDirAngle[s];

    vec2 uv = warpUV(vUV, uShapeWarp[s]);
    uv = biWarpUV(uv, uBiWarpStr, uBiWarpXOn, uBiWarpYOn);

    float baseSDF  = shapeSDF(uv, pos, baseR, sAspect, uShapeType[s]);
    float baseGrad = computeGradDist(uv, pos, baseR, sAspect, dir, angle);

    if (uCopyScaleStep >= 1.0) {
      // Copies grow outward → render largest (c=5) first (deepest behind), base on top
      for (int c = 5; c >= 0; c--) {
        renderCopy(color, uv, pos, baseR, sAspect, copyCount, spacing, dir, angle, s, c, uShapeType[s]);
      }
      blendElement(color, baseSDF, baseGrad, 1.0);
    } else {
      // Copies shrink → base behind, copies in front; c=0 (largest copy) rendered last = on top
      blendElement(color, baseSDF, baseGrad, 1.0);
      for (int c = 5; c >= 0; c--) {
        renderCopy(color, uv, pos, baseR, sAspect, copyCount, spacing, dir, angle, s, c, uShapeType[s]);
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
