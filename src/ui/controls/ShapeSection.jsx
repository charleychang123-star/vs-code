import SteppedSlider from './SteppedSlider';

const SHAPE_TYPES = [
  { value: 'circle',  label: '圓形' },
  { value: 'square',  label: '方形' },
  { value: 'diamond', label: '菱形' },
  { value: 'blob',    label: '流體' },
];

export default function ShapeSection({ params, updateGlobal }) {
  return (
    <section className="panel-section">
      <h3>形狀設定</h3>

      <div className="control-row">
        <label>形狀類型</label>
        <div className="segmented-control small">
          {SHAPE_TYPES.map(({ value, label }) => (
            <button
              key={value}
              className={params.shapeType === value ? 'active' : ''}
              onClick={() => updateGlobal('shapeType', value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <SteppedSlider
        label="半徑"
        stepsKey="radius"
        value={params.radius}
        onChange={v => updateGlobal('radius', v)}
      />
      <SteppedSlider
        label="長寬比"
        stepsKey="aspect"
        value={params.aspect}
        onChange={v => updateGlobal('aspect', v)}
        format={v => v.toFixed(2)}
      />
      <SteppedSlider
        label="邊緣柔化"
        stepsKey="edgeSoft"
        value={params.edgeSoft}
        onChange={v => updateGlobal('edgeSoft', v)}
        format={v => `${v}%`}
      />
    </section>
  );
}
