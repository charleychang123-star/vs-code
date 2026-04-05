import { useState, useRef, useEffect, useCallback } from 'react';
import { CANVAS_SIZES } from '../../constants/defaults';

const SHAPE_COLORS = { A: '#f0c060', B: '#6ab0f5', C: '#a0e080' };
const BLEED = 0.35;
const MAP_W = 176;

function toPixel(val, size) {
  return (val + BLEED) / (1 + 2 * BLEED) * size;
}

function fromPixel(px, size) {
  return px / size * (1 + 2 * BLEED) - BLEED;
}

export default function ShapePlacementMap({ params, updateShape, updateGlobal }) {
  const [open, setOpen] = useState(false);
  const mapRef = useRef(null);
  const dragging = useRef(null);
  const didDrag = useRef(false);

  const ratio = CANVAS_SIZES[params.canvasSize].ratio;
  const mapH = Math.round(MAP_W / ratio);

  const onDotMouseDown = useCallback((key, e) => {
    e.preventDefault();
    e.stopPropagation();
    updateGlobal('selectedShape', key);
    dragging.current = key;
    didDrag.current = false;
  }, [updateGlobal]);

  const onMapMouseDown = useCallback((e) => {
    // clicking the map background places the selected shape
    if (e.target !== mapRef.current && !e.target.classList.contains('spm-inner')) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = Math.max(-BLEED, Math.min(1 + BLEED, fromPixel(e.clientX - rect.left, rect.width)));
    const y = Math.max(-BLEED, Math.min(1 + BLEED, fromPixel(e.clientY - rect.top,  rect.height)));
    const sel = params.selectedShape;
    if (sel) {
      updateShape(sel, 'posX', x);
      updateShape(sel, 'posY', y);
    }
  }, [params.selectedShape, updateShape]);

  useEffect(() => {
    const onMouseMove = (e) => {
      const key = dragging.current;
      if (!key || !mapRef.current) return;
      didDrag.current = true;
      const rect = mapRef.current.getBoundingClientRect();
      const x = Math.max(-BLEED, Math.min(1 + BLEED, fromPixel(e.clientX - rect.left, rect.width)));
      const y = Math.max(-BLEED, Math.min(1 + BLEED, fromPixel(e.clientY - rect.top,  rect.height)));
      updateShape(key, 'posX', x);
      updateShape(key, 'posY', y);
    };
    const onMouseUp = () => { dragging.current = null; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [updateShape]);

  const insetPct = `${(BLEED / (1 + 2 * BLEED) * 100).toFixed(2)}%`;

  return (
    <div className="shape-placement-map">
      <button
        className={`spm-toggle ${open ? 'open' : ''}`}
        onClick={() => setOpen(v => !v)}
      >
        位置 {open ? '▼' : '▲'}
      </button>

      {open && (
        <div
          ref={mapRef}
          className="spm-map"
          style={{ width: MAP_W, height: mapH }}
          onMouseDown={onMapMouseDown}
        >
          <div
            className="spm-inner"
            style={{ top: insetPct, left: insetPct, right: insetPct, bottom: insetPct }}
          />

          {['A', 'B', 'C'].map(key => {
            const shape = params.shapes[key];
            const cx = toPixel(shape.posX, MAP_W);
            const cy = toPixel(shape.posY, mapH);
            const isSelected = params.selectedShape === key;
            return (
              <div
                key={key}
                className={`spm-dot ${shape.active ? 'active' : 'inactive'} ${isSelected ? 'selected' : ''}`}
                style={{
                  left: cx,
                  top: cy,
                  '--dot-color': SHAPE_COLORS[key],
                }}
                onMouseDown={e => onDotMouseDown(key, e)}
              >
                {key}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
