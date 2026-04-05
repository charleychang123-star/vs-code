import SteppedSlider from './SteppedSlider';

export default function BlurSection({ params, updateGlobal }) {
  const { blurEnabled, blurStr } = params;

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
        <SteppedSlider
          label="強度"
          stepsKey="blurStr"
          value={blurStr}
          onChange={v => updateGlobal('blurStr', v)}
          format={v => `${v}`}
        />
      )}
    </section>
  );
}
