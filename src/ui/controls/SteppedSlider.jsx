import { STEPS, nearestStepIndex } from '../../constants/steps';

export default function SteppedSlider({ label, stepsKey, value, onChange, format }) {
  const steps = STEPS[stepsKey];
  const idx = nearestStepIndex(steps, value);

  const handleChange = (e) => {
    const newIdx = parseInt(e.target.value, 10);
    onChange(steps[newIdx]);
  };

  const displayValue = format ? format(value) : value;

  return (
    <div className="control-row">
      <label>{label}</label>
      <div className="stepped-group">
        <input
          type="range"
          min={0}
          max={steps.length - 1}
          step={1}
          value={idx}
          onChange={handleChange}
        />
        <span className="step-label">
          <span className="step-val">{displayValue}</span>
          <span className="step-count">{idx + 1}/{steps.length}</span>
        </span>
      </div>
    </div>
  );
}
