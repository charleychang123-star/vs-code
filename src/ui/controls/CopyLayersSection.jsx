import SteppedSlider from './SteppedSlider';
import { DIR_LABELS } from '../../constants/defaults';

const DIR_OPTIONS_UI = ['top', 'bottom', 'left', 'right', 'center', 'custom'];

export default function CopyLayersSection({ params, updateGlobal }) {
  const { copyCount, copyDir, copyDirAngle, copySpacing, copyScaleStep, copyOpacityStep } = params;

  return (
    <section className="panel-section">
      <h3>Copy Layers</h3>

      <div className="control-row">
        <label>層數</label>
        <div className="segmented-control small">
          {[0, 1, 2, 3, 4, 5, 6].map(n => (
            <button
              key={n}
              className={copyCount === n ? 'active' : ''}
              onClick={() => updateGlobal('copyCount', n)}
            >
              {n === 0 ? '無' : n}
            </button>
          ))}
        </div>
      </div>

      {copyCount > 0 && (
        <>
          <div className="control-row">
            <label>方向</label>
            <div className="segmented-control small">
              {DIR_OPTIONS_UI.map(d => (
                <button
                  key={d}
                  className={copyDir === d ? 'active' : ''}
                  onClick={() => updateGlobal('copyDir', d)}
                >
                  {DIR_LABELS[d]}
                </button>
              ))}
            </div>
          </div>

          {copyDir === 'custom' && (
            <div className="control-row">
              <label>角度</label>
              <div className="angle-input-group">
                <input
                  type="number"
                  className="angle-input"
                  min={0}
                  max={359}
                  value={copyDirAngle}
                  onChange={e => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v)) updateGlobal('copyDirAngle', ((v % 360) + 360) % 360);
                  }}
                />
                <span className="angle-unit">°</span>
              </div>
            </div>
          )}

          <SteppedSlider
            label="間距"
            stepsKey="spacing"
            value={copySpacing}
            onChange={v => updateGlobal('copySpacing', v)}
            format={v => v.toFixed(2)}
          />
          <SteppedSlider
            label="尺寸步進"
            stepsKey="copyScaleStep"
            value={copyScaleStep}
            onChange={v => updateGlobal('copyScaleStep', v)}
            format={v => `${v}%`}
          />
          <SteppedSlider
            label="透明度步進"
            stepsKey="copyOpacityStep"
            value={copyOpacityStep}
            onChange={v => updateGlobal('copyOpacityStep', v)}
            format={v => `${v}%`}
          />
        </>
      )}
    </section>
  );
}
