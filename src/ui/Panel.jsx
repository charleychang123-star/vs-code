import ColorSection   from './controls/ColorSection';
import ShapeSelector  from './controls/ShapeSelector';
import ShapeSection   from './controls/ShapeSection';
import CopyLayersSection from './controls/CopyLayersSection';
import FilterSection  from './controls/FilterSection';
import BlurSection    from './controls/BlurSection';
import TextureSection from './controls/TextureSection';
import ExportSection  from './controls/ExportSection';

export default function Panel({ params, updateGlobal, updateShape, onExport, undo, redo, canUndo, canRedo }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <span>Brand Visual Generator</span>
        <div className="undo-redo">
          <button
            className="undo-redo-btn"
            disabled={!canUndo}
            onClick={undo}
            title="Undo (⌘Z)"
          >↩</button>
          <button
            className="undo-redo-btn"
            disabled={!canRedo}
            onClick={redo}
            title="Redo (⌘⇧Z)"
          >↪</button>
        </div>
      </div>
      <div className="panel-content">

        <ColorSection params={params} updateGlobal={updateGlobal} />

        <ShapeSelector
          params={params}
          updateGlobal={updateGlobal}
          updateShape={updateShape}
        />

        <ShapeSection params={params} updateGlobal={updateGlobal} />

        <CopyLayersSection params={params} updateGlobal={updateGlobal} />

        <FilterSection params={params} updateGlobal={updateGlobal} />

        <BlurSection params={params} updateGlobal={updateGlobal} />

        <TextureSection params={params} updateGlobal={updateGlobal} />

        <ExportSection onExport={onExport} />
      </div>
    </div>
  );
}
