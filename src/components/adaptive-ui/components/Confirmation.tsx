import { z } from "zod";
import { n, type Props } from "../schemas";
import { Card, Button } from "../../common/ui";
import { CheckCircle2 } from "lucide-react";
import { useAgent } from "../../../features/agent/AgentContext";
import { formatCurrencyMXN as money, formatDate } from "../../../utils/format";
import { Invalid } from "../Invalid";
export function Confirmation({ component }: Props) {
  const { interact, busy } = useAgent();
  const result = z
    .object({
      message: z.string(),
      name: z.string().optional(),
      targetAmount: n.optional(),
      currentAmount: n.optional(),
      monthlyContribution: n.optional(),
      targetDate: z.string().optional(),
    })
    .safeParse(component.props);
  if (!result.success) return <Invalid />;
  const p = result.data;
  return (
    <Card className="confirmation-card">
      <CheckCircle2 size={28} />
      <h3>{p.message}</h3>
      {p.name && (
        <>
          <h4>{p.name}</h4>
          <dl>
            {p.targetAmount != null && (
              <div>
                <dt>Objetivo</dt>
                <dd>{money(p.targetAmount)}</dd>
              </div>
            )}
            {p.currentAmount != null && (
              <div>
                <dt>Ahorro inicial</dt>
                <dd>{money(p.currentAmount)}</dd>
              </div>
            )}
            {p.monthlyContribution != null && (
              <div>
                <dt>Aportación mensual</dt>
                <dd>{money(p.monthlyContribution)}</dd>
              </div>
            )}
            {p.targetDate && (
              <div>
                <dt>Fecha objetivo</dt>
                <dd>{formatDate(p.targetDate)}</dd>
              </div>
            )}
          </dl>
        </>
      )}
      <div className="form-actions">
        {component.actions
          ?.filter((a) =>
            ["CONFIRM_CREATE_SAVINGS_GOAL", "CANCEL"].includes(a.type),
          )
          .map((action) => (
            <Button
              key={action.id}
              variant={action.type === "CANCEL" ? "secondary" : "primary"}
              loading={busy}
              onClick={() =>
                interact(component.id, action.type, action.payload)
              }
            >
              {action.label ?? "Continuar"}
            </Button>
          ))}
      </div>
    </Card>
  );
}
