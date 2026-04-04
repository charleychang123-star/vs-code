export default function Slider({ label, value, min, max, step, onChange }) {
  return (
    <div className="control-row">
      <label>{label}</label>
      <div className="slider-group">
        <input
          type="range"
          min={min}
          max={max}
          step={step || 0.01}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
        />
        <span className="slider-value">{typeof value === 'number' ? value.toFixed(2) : value}</span>
      </div>
    </div>
  );
}
