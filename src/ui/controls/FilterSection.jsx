import SteppedSlider from './SteppedSlider';

export default function FilterSection({ params, updateGlobal }) {
  const { warp, biWarpEnabled, biWarpStr, biWarpXOn, biWarpYOn,
          dirWarpEnabled, dirWarpStr, dirWarpAngle } = params;

  return (
    <section className="panel-section">
      <h3>濾鏡庫</h3>

      {/* ── 向心扭曲 (moved from ShapeSection) ── */}
      <div className="filter-block">
        <div className="filter-block-label">向心扭曲</div>
        <SteppedSlider
          label="強度"
          stepsKey="warp"
          value={warp}
          onChange={v => updateGlobal('warp', v)}
          format={v => `${v}%`}
        />
      </div>

      {/* ── 雙向扭曲 ── */}
      <div className="filter-block">
        <div className="filter-block-header">
          <span className="filter-block-label">雙向扭曲</span>
          <button
            className={`toggle${biWarpEnabled ? ' active' : ''}`}
            onClick={() => updateGlobal('biWarpEnabled', !biWarpEnabled)}
          >
            {biWarpEnabled ? '開' : '關'}
          </button>
        </div>

        {biWarpEnabled && (
          <>
            <SteppedSlider
              label="強度"
              stepsKey="biWarpStr"
              value={biWarpStr}
              onChange={v => updateGlobal('biWarpStr', v)}
              format={v => `${v}%`}
            />
            <div className="control-row">
              <label>軸向</label>
              <div className="segmented-control small">
                <button
                  className={biWarpXOn ? 'active' : ''}
                  onClick={() => updateGlobal('biWarpXOn', !biWarpXOn)}
                >
                  X軸
                </button>
                <button
                  className={biWarpYOn ? 'active' : ''}
                  onClick={() => updateGlobal('biWarpYOn', !biWarpYOn)}
                >
                  Y軸
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── 單向扭曲 ── */}
      <div className="filter-block">
        <div className="filter-block-header">
          <span className="filter-block-label">單向扭曲</span>
          <button
            className={`toggle${dirWarpEnabled ? ' active' : ''}`}
            onClick={() => updateGlobal('dirWarpEnabled', !dirWarpEnabled)}
          >
            {dirWarpEnabled ? '開' : '關'}
          </button>
        </div>

        {dirWarpEnabled && (
          <>
            <SteppedSlider
              label="強度"
              stepsKey="dirWarpStr"
              value={dirWarpStr}
              onChange={v => updateGlobal('dirWarpStr', v)}
              format={v => `${v}%`}
            />
            <div className="control-row">
              <label>角度</label>
              <div className="angle-input-group">
                <input
                  type="number"
                  className="angle-input"
                  min={0}
                  max={359}
                  value={dirWarpAngle}
                  onChange={e => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v)) updateGlobal('dirWarpAngle', ((v % 360) + 360) % 360);
                  }}
                />
                <span className="angle-unit">°</span>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
