const MODES = [
  { key: 'sphere', label: 'Sphere' },
  { key: 'blob', label: 'Blob' },
  { key: 'ring', label: 'Ring' },
];

export default function ShapeModeSection({ params, update }) {
  return (
    <section className="panel-section">
      <h3>形狀模式</h3>
      <div className="segmented-control">
        {MODES.map(m => (
          <button
            key={m.key}
            className={params.shapeMode === m.key ? 'active' : ''}
            onClick={() => update('shapeMode', m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>
    </section>
  );
}
