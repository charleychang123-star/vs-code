import SteppedSlider from './SteppedSlider';
import { DIR_LABELS } from '../../constants/defaults';

export default function CopyLayersSection({ params, updateGlobal }) {
  const { copyCount, copyDir, copySpacing, copyScaleStep, copyOpacityStep } = params;

  return (
    <section className="panel-section">
      <h3>Copy Layers</h3>

      {/* Copy count */}
      <div className="control-row">
        <label>層數</label>
        <div className="segmented-control small">
          {[0, 1, 2, 3].map(n => (
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
          {/* Direction */}
          <div className="control-row">
            <label>方向</label>
            <div className="segmented-control small">
              {['top', 'bottom', 'left', 'right'].map(d => (
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

          {/* Spacing */}
          <SteppedSlider
            label="間距"
            stepsKey="spacing"
            value={copySpacing}
            onChange={v => updateGlobal('copySpacing', v)}
            format={v => v.toFixed(2)}
          />

          {/* Step multipliers — one value governs all copies multiplicatively */}
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
