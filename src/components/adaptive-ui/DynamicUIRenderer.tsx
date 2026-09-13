import type { AdaptiveUIResponse } from "../../models";
import { componentRegistry } from "./ComponentRegistry";
import { Invalid } from "./Invalid";
export function DynamicUIRenderer({ ui }: { ui: AdaptiveUIResponse }) {
  return (
    <section className="adaptive-experience" aria-label={ui.screen.title}>
      <div className="section-title">
        <div>
          <span className="eyebrow">TU EXPERIENCIA ADAPTATIVA</span>
          <h2>{ui.screen.title}</h2>
          <p className="muted">{ui.screen.subtitle}</p>
        </div>
      </div>
      <div className="adaptive-grid">
        {ui.components.map((component) => {
          const View = Object.prototype.hasOwnProperty.call(
            componentRegistry,
            component.type,
          )
            ? componentRegistry[component.type]
            : undefined;
          return View ? (
            <View key={component.id} component={component} />
          ) : (
            <Invalid key={component.id} />
          );
        })}
      </div>
    </section>
  );
}
