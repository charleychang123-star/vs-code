import { useState } from 'react';
import SteppedSlider from './SteppedSlider';
import { COLOR_PRESETS } from '../../constants/defaults';

const GRADIENT_OPTIONS = [
  { value: 'radial',  label: '放射' },
  { value: 'follow',  label: '跟隨' },
  { value: 'reverse', label: '翻轉' },
];

const PRESET_BG = '#FEF6E7';

export default function ColorSection({ params, updateGlobal }) {
  const [open, setOpen] = useState(false);

  function applyPreset(p) {
    updateGlobal('colorA', p.colorA);
    updateGlobal('colorB', p.colorB);
    updateGlobal('colorC', PRESET_BG);
  }

  return (
    <section className="panel-section">
      <div className="color-section-header">
        <h3>色彩系統</h3>
        <button
          className={`preset-toggle${open ? ' active' : ''}`}
          onClick={() => setOpen(v => !v)}
        >
          預設配色
        </button>
      </div>

      {open && (
        <div className="preset-swatches">
          {COLOR_PRESETS.map(p => (
            <button
              key={p.name}
              className="preset-swatch"
              title={p.name}
              style={{
                background: `radial-gradient(circle at 40% 40%, ${p.colorA} 0%, ${p.colorA} 28%, ${p.colorB} 65%, ${p.colorB} 100%)`,
              }}
              onClick={() => applyPreset(p)}
            >
              <span className="preset-swatch-name">{p.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="control-row">
        <label>Color A（中心）</label>
        <input type="color" value={params.colorA}
          onChange={e => updateGlobal('colorA', e.target.value)} />
      </div>
      <div className="control-row">
        <label>Color B（過渡）</label>
        <input type="color" value={params.colorB}
          onChange={e => updateGlobal('colorB', e.target.value)} />
      </div>
      <div className="control-row">
        <label>Color C（底色）</label>
        <input type="color" value={params.colorC}
          onChange={e => updateGlobal('colorC', e.target.value)} />
      </div>
      <SteppedSlider
        label="Stop"
        stepsKey="stop"
        value={params.stop1}
        onChange={v => updateGlobal('stop1', v)}
        format={v => v.toFixed(2)}
      />
      <div className="control-row">
        <label>漸層方向</label>
        <div className="segmented-control small">
          {GRADIENT_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              className={params.gradientMode === value ? 'active' : ''}
              onClick={() => updateGlobal('gradientMode', value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
