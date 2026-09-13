import { ArrowDown, ArrowRight } from "lucide-react";
import { useData } from "../../hooks/use-data";
import { buildHomeGap } from "./financial-scenario";
import { formatCurrencyMXN as money } from "../../utils/format";
export function FinancialJourney({
  propertyValue,
  downPayment,
  savingsComponentId,
}: {
  propertyValue: number;
  downPayment: number;
  savingsComponentId?: string;
}) {
  const { profile } = useData();
  if (!profile.data) return null;
  const gap = buildHomeGap(downPayment, profile.data.currentSavings);
  return (
    <section className="home-journey" aria-label="Tu camino al enganche">
      <span className="eyebrow">TU OBJETIVO · LO QUE FALTA</span>
      <div className="journey-property">
        <span>Valor de la casa que simulaste</span>
        <strong>{money(propertyValue)}</strong>
      </div>
      <ArrowDown className="journey-arrow" size={18} />
      <dl>
        <div>
          <dt>Enganche elegido</dt>
          <dd>{money(gap.desiredDownPayment)}</dd>
        </div>
        <div>
          <dt>Ahorros actuales de tu perfil</dt>
          <dd>{money(gap.currentSavings)}</dd>
        </div>
        <div>
          <dt>Diferencia por reunir</dt>
          <dd>{money(gap.remaining)}</dd>
        </div>
      </dl>
      <p>
        {gap.remaining > 0
          ? `Entre tus ahorros y este enganche hay ${money(gap.remaining)} de diferencia. Puedes convertirla en un plan.`
          : "Tus ahorros registrados cubren este enganche. Revisa cuánto puedes destinar sin comprometer otros objetivos."}
      </p>
      {savingsComponentId && downPayment > 0 && (
        <a
          className="button secondary"
          href={`#adaptive-${savingsComponentId}`}
        >
          Preparar mi plan de ahorro <ArrowRight size={16} />
        </a>
      )}
      <small>
        Comparación orientativa. No reserva tu ahorro ni incluye otros gastos de
        adquisición.
      </small>
    </section>
  );
}
