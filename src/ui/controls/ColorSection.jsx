import SteppedSlider from './SteppedSlider';

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
        label="Stop 1"
        stepsKey="stop"
        value={params.stop1}
        onChange={v => updateGlobal('stop1', v)}
        format={v => v.toFixed(1)}
      />
      <SteppedSlider
        label="Stop 2"
        stepsKey="stop"
        value={params.stop2}
        onChange={v => updateGlobal('stop2', v)}
        format={v => v.toFixed(1)}
      />
    </section>
  );
}
