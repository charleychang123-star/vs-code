export default function ExportSection({ onExport }) {
  return (
    <section className="panel-section">
      <button className="export-btn" onClick={onExport}>
        匯出 PNG
      </button>
    </section>
  );
}
