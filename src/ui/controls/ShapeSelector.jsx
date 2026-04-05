const LABELS = ['A', 'B', 'C'];

export default function ShapeSelector({ params, updateGlobal, updateShape }) {
  const selected = params.selectedShape;

  return (
    <section className="panel-section">
      <h3>形狀</h3>
      <div className="shape-tabs">
        {LABELS.map((key) => {
          const shape = params.shapes[key];
          const canFlip = key === 'B' || key === 'C';
          return (
            <div key={key} className={`shape-tab ${selected === key ? 'selected' : ''}`}>
              <button
                className={`shape-tab-label ${!shape.active ? 'inactive' : ''}`}
                onClick={() => updateGlobal('selectedShape', key)}
              >
                {key}
              </button>
              <button
                className={`shape-tab-toggle ${shape.active ? 'on' : 'off'}`}
                onClick={() => updateShape(key, 'active', !shape.active)}
                title={shape.active ? '點擊以停用' : '點擊以啟用'}
              >
                {shape.active ? '●' : '○'}
              </button>
              {canFlip && (
                <button
                  className={`shape-tab-flip ${shape.flip ? 'on' : 'off'}`}
                  onClick={() => updateShape(key, 'flip', !shape.flip)}
                  title={shape.flip ? '已翻轉方向（點擊恢復）' : '翻轉複製方向 180°'}
                >
                  ↔
                </button>
              )}
            </div>
          );
        })}
      </div>
      {selected && (
        <p className="shape-hint">
          點擊畫布設定「形狀 {selected}」的位置
        </p>
      )}
    </section>
  );
}
