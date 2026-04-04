export const CANVAS_SIZES = {
  '16:9': { label: '16:9', w: 1920, h: 1080, ratio: 1920 / 1080 },
  '4:5':  { label: '4:5',  w: 1080, h: 1350, ratio: 1080 / 1350 },
  '1:1':  { label: '1:1',  w: 1080, h: 1080, ratio: 1 },
};

export const DEFAULT_PARAMS = {
  canvasSize: '16:9',
  selectedShape: 'A',
  // Shared color system
  colorA: '#D98026',
  colorB: '#F9D286',
  colorC: '#FEF6E7',
  stop1: 0.3,
  stop2: 0.7,
  // Global texture
  grain: 15,
  // Global sphere params (apply to all active shapes)
  radius: 0.8,
  aspect: 1.0,
  warp: 0,
  // Global copy layer params
  copyCount: 0,
  copySpacing: 0.15,
  copyDir: 'bottom',        // 'top' | 'bottom' | 'left' | 'right'
  copyScaleStep: 130,       // each copy is this % of the previous (multiplicative)
  copyOpacityStep: 70,      // each copy opacity is this % of the previous
  // Global blur params
  blurEnabled: false,
  blurDir: 'bottom',
  blurStr: 5,
  // Per-shape: position only
  shapes: {
    A: { active: true,  posX: 0.5, posY: 0.3 },
    B: { active: false, posX: 0.3, posY: 0.65 },
    C: { active: false, posX: 0.7, posY: 0.65 },
  },
};

export const DIR_OPTIONS = ['top', 'bottom', 'left', 'right'];
export const DIR_LABELS  = { top: '由上', bottom: '由下', left: '由左', right: '由右' };
