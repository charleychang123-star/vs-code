import { useState } from 'react';

export default function ExportSection({ onExport }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const canvas = document.querySelector('.canvas-wrapper canvas');
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        console.warn('Clipboard write failed', e);
      }
    }, 'image/png');
  }

  return (
    <section className="panel-section">
      <button className="export-btn" onClick={onExport}>
        匯出 PNG
      </button>
      <button
        className={`export-btn export-btn-copy${copied ? ' copied' : ''}`}
        onClick={handleCopy}
        style={{ marginTop: 6 }}
      >
        {copied ? '已複製 ✓' : '複製圖片'}
      </button>
      {/* TODO: SVG export — embed PNG in <image> tag */}
    </section>
  );
}
