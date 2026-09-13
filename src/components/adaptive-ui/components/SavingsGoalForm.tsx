import { useData } from "../../../hooks/use-data";
import { simulationSchema } from "../schemas";
import { z } from "zod";
import { n, type Props } from "../schemas";
import { Card } from "../../common/ui";
import { useAgent } from "../../../features/agent/AgentContext";
import { GoalForm } from "../../../features/goals/GoalForm";
export function SavingsForm({ component }: Props) {
  const { interact, busy, response } = useAgent();
  const { profile } = useData();
  const simulator = response?.ui.components.find(
    (c) => c.type === "mortgage-simulator",
  );
  const simulation = simulationSchema.safeParse(simulator?.props);
  const target =
    simulation.success && simulation.data.monthlyPayment != null
      ? simulation.data.downPayment
      : undefined;
  const suggested =
    target && target > 0 && profile.data
      ? {
          name: "Enganche de mi primera casa",
          targetAmount: target,
          currentAmount: Math.min(target, profile.data.currentSavings),
        }
      : undefined;
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
    <div id={`adaptive-${component.id}`} className="adaptive-savings">
      <Card>
        <h3>Una meta que te acerca</h3>
        <p className="muted">
          Prepara tu ahorro. Revisarás los detalles antes de confirmarlo.
        </p>
        {suggested && (
          <p className="scenario-note">
            Tomamos el enganche de tu simulación como referencia. Revisa cuánto
            de tus ahorros quieres dedicar a esta meta; los datos son editables.
          </p>
        )}
        <GoalForm
          key={`${component.id}-${target ?? "empty"}`}
          initial={{ ...suggested, ...(initial.success ? initial.data : {}) }}
          busy={busy || !action}
          label={action?.label ?? "Revisar meta"}
          onSubmit={(values) =>
            action &&
            interact(component.id, action.type, {
              ...action.payload,
              ...values,
            })
          }
        />
      </Card>
    </div>
  );
}
