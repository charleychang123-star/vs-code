// 3-stop radial gradient: colorA (center) → colorB (mid) → colorC (edge)
// Usage: vec3 color = gradientMap(dist, colorA, colorB, colorC, stop1, stop2, edge);
vec3 gradientMap(float dist, vec3 colorA, vec3 colorB, vec3 colorC, float stop1, float stop2, float edge) {
  float t1 = smoothstep(stop1 - edge, stop1 + edge, dist);
  float t2 = smoothstep(stop2 - edge, stop2 + edge, dist);
  return mix(mix(colorA, colorB, t1), colorC, t2);
}
