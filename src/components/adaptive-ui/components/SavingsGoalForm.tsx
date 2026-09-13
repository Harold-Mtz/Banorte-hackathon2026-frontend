import { z } from "zod";
import { n, type Props } from "../schemas";
import { Card } from "../../common/ui";
import { useAgent } from "../../../features/agent/AgentContext";
import { GoalForm } from "../../../features/goals/GoalForm";
export function SavingsForm({ component }: Props) {
  const { interact, busy } = useAgent();
  const action = component.actions?.find(
    (a) => a.type === "REQUEST_CREATE_SAVINGS_GOAL",
  );
  const initial = z
    .object({
      name: z.string().optional(),
      targetAmount: n.optional(),
      currentAmount: n.optional(),
      monthlyContribution: n.optional(),
      targetDate: z.string().optional(),
    })
    .safeParse(component.props);
  return (
    <Card>
      <h3>Una meta que te acerca</h3>
      <p className="muted">
        Prepara tu ahorro. Revisarás los detalles antes de confirmarlo.
      </p>
      <GoalForm
        initial={initial.success ? initial.data : undefined}
        busy={busy || !action}
        label={action?.label ?? "Revisar meta"}
        onSubmit={(values) =>
          action &&
          interact(component.id, action.type, { ...action.payload, ...values })
        }
      />
    </Card>
  );
}
