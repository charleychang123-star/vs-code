import { CANVAS_SIZES } from '../../constants/defaults';

export default function CanvasSizeToggle({ current, onChange }) {
  return (
    <div className="canvas-size-toggle">
      {Object.entries(CANVAS_SIZES).map(([key, { label }]) => (
        <button
          key={key}
          className={current === key ? 'active' : ''}
          onClick={() => onChange(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
