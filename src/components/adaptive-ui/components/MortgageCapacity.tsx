import { z } from "zod";
import { n, type Props } from "../schemas";
import { Card } from "../../common/ui";
import { House, ShieldCheck } from "lucide-react";
import { formatCurrencyMXN as money } from "../../../utils/format";
import { Invalid } from "../Invalid";
export function Capacity({ component }: Props) {
  const result = z
    .object({ estimatedMaxPayment: n })
    .safeParse(component.props);
  return result.success ? (
    <Card className="capacity-card">
      <span className="icon-tile">
        <House size={22} />
      </span>
      <p>Capacidad de pago mensual estimada</p>
      <strong className="big-amount">
        {money(result.data.estimatedMaxPayment)}
      </strong>
      <span className="muted">Calculada a partir de tu perfil financiero.</span>
      <p className="disclaimer">
        <ShieldCheck size={14} /> Estimación orientativa. Sujeta a evaluación de
        crédito.
      </p>
    </Card>
  ) : (
    <Invalid />
  );
}
