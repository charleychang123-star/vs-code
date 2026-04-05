import SteppedSlider from './SteppedSlider';

const GRADIENT_OPTIONS = [
  { value: 'radial',  label: '放射' },
  { value: 'follow',  label: '跟隨' },
  { value: 'reverse', label: '翻轉' },
];

export default function ColorSection({ params, updateGlobal }) {
  return (
    <section className="panel-section">
      <h3>色彩系統</h3>
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
