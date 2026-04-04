import ColorSection from './controls/ColorSection';
import ShapeSelector from './controls/ShapeSelector';
import SphereSection from './controls/SphereSection';
import CopyLayersSection from './controls/CopyLayersSection';
import BlurSection from './controls/BlurSection';
import TextureSection from './controls/TextureSection';
import ExportSection from './controls/ExportSection';

export default function Panel({ params, updateGlobal, updateShape, onExport }) {
  return (
    <div className="panel">
      <div className="panel-header">Brand Visual Generator</div>
      <div className="panel-content">

        <ColorSection params={params} updateGlobal={updateGlobal} />

        <ShapeSelector
          params={params}
          updateGlobal={updateGlobal}
          updateShape={updateShape}
        />

        <SphereSection params={params} updateGlobal={updateGlobal} />

        <CopyLayersSection params={params} updateGlobal={updateGlobal} />

        <BlurSection params={params} updateGlobal={updateGlobal} />

        <TextureSection params={params} updateGlobal={updateGlobal} />

        <ExportSection onExport={onExport} />
      </div>
    </div>
  );
}
