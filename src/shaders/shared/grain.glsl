// Film grain noise
// Usage: color += grain(vUV, grainStrength, seed);
vec3 grain(vec2 uv, float strength, float seed) {
  float noise = fract(sin(dot(uv, vec2(12.9898 + seed, 78.233 + seed))) * 43758.5453);
  return vec3((noise - 0.5) * strength);
}
