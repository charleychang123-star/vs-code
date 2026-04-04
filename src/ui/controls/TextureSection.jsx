import SteppedSlider from './SteppedSlider';

export default function TextureSection({ params, updateGlobal }) {
  return (
    <section className="panel-section">
      <h3>質感</h3>
      <SteppedSlider
        label="Film Grain"
        stepsKey="grain"
        value={params.grain}
        onChange={v => updateGlobal('grain', v)}
        format={v => `${v}`}
      />
    </section>
  );
}
