import SteppedSlider from './SteppedSlider';

export default function SphereSection({ params, updateGlobal }) {
  return (
    <section className="panel-section">
      <h3>Sphere 設定</h3>

      <SteppedSlider
        label="半徑"
        stepsKey="radius"
        value={params.radius}
        onChange={v => updateGlobal('radius', v)}
      />
      <SteppedSlider
        label="長寬比"
        stepsKey="aspect"
        value={params.aspect}
        onChange={v => updateGlobal('aspect', v)}
        format={v => v.toFixed(2)}
      />
      <SteppedSlider
        label="Warp"
        stepsKey="warp"
        value={params.warp}
        onChange={v => updateGlobal('warp', v)}
        format={v => `${v}%`}
      />
      <SteppedSlider
        label="邊緣柔化"
        stepsKey="edgeSoft"
        value={params.edgeSoft}
        onChange={v => updateGlobal('edgeSoft', v)}
        format={v => `${v}%`}
      />
    </section>
  );
}
