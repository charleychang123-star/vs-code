// Discrete step values for each parameter
// All sliders snap to these values only
export const STEPS = {
  stop:        [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0],
  edgeSoft:    [0, 5, 10, 20, 35, 55, 75, 100],
  radius:      [0.2, 0.3, 0.4, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.2],
  aspect:      [0.5, 0.67, 0.8, 1.0, 1.25, 1.5, 1.75, 2.0],
  warp:        [0, 15, 30, 50, 75, 100],
  spacing:     [0.0, 0.05, 0.1, 0.15, 0.2, 0.3, 0.45],
  copyScaleStep:   [70, 80, 90, 100, 115, 130, 150, 175],
  copyOpacityStep: [10, 25, 40, 55, 70, 85, 100],
  blurStr:     [0.4, 0.8, 1.5, 2.5, 4, 6, 9, 14, 20, 28, 36],
  grain:       [0, 8, 15, 25, 38, 55],
};

export function nearestStepIndex(steps, value) {
  let best = 0;
  let bestDist = Math.abs(steps[0] - value);
  for (let i = 1; i < steps.length; i++) {
    const d = Math.abs(steps[i] - value);
    if (d < bestDist) { bestDist = d; best = i; }
  }
  return best;
}
