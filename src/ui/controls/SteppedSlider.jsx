import { useState, useRef } from 'react';
import { STEPS, nearestStepIndex } from '../../constants/steps';

export default function SteppedSlider({ label, stepsKey, value, onChange, format }) {
  const steps = STEPS[stepsKey];
  const idx = nearestStepIndex(steps, value);
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef(null);

  const min = steps[0];
  const max = steps[steps.length - 1];

  const startEdit = () => {
    setInputVal(String(value));
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commitEdit = () => {
    const parsed = parseFloat(inputVal);
    if (!isNaN(parsed)) {
      onChange(Math.min(Math.max(parsed, min), max));
    }
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') setEditing(false);
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
          onChange={e => onChange(steps[parseInt(e.target.value, 10)])}
        />
        <span className="step-label">
          {editing ? (
            <input
              ref={inputRef}
              type="number"
              className="step-edit"
              value={inputVal}
              min={min}
              max={max}
              autoFocus
              onChange={e => setInputVal(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <span
              className="step-val editable"
              title="點擊輸入數值"
              onClick={startEdit}
            >
              {displayValue}
            </span>
          )}
          <span className="step-count">{idx + 1}/{steps.length}</span>
        </span>
      </div>
    </div>
  );
}
