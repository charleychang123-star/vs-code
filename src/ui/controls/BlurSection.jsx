import SteppedSlider from './SteppedSlider';
import { DIR_LABELS } from '../../constants/defaults';

export default function BlurSection({ params, updateGlobal }) {
  const { blurEnabled, blurDir, blurStr } = params;

  return (
    <section className="panel-section">
      <h3>Progressive Blur</h3>

      <div className="control-row">
        <label>啟用</label>
        <button
          className={`toggle ${blurEnabled ? 'active' : ''}`}
          onClick={() => updateGlobal('blurEnabled', !blurEnabled)}
        >
          {blurEnabled ? '開啟' : '關閉'}
        </button>
      </div>

      {blurEnabled && (
        <>
          <div className="control-row">
            <label>方向</label>
            <div className="segmented-control small">
              {['top', 'bottom', 'left', 'right'].map(d => (
                <button
                  key={d}
                  className={blurDir === d ? 'active' : ''}
                  onClick={() => updateGlobal('blurDir', d)}
                >
                  {DIR_LABELS[d]}
                </button>
              ))}
            </div>
          </div>

          <SteppedSlider
            label="強度"
            stepsKey="blurStr"
            value={blurStr}
            onChange={v => updateGlobal('blurStr', v)}
            format={v => `${v}`}
          />
        </>
      )}
    </section>
  );
}
