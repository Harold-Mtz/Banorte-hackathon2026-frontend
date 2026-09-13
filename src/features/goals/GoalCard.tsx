import { Target, CalendarDays } from "lucide-react";
import { Card, Badge } from "../../components/common/ui";
import type { SavingsGoal } from "../../models";
import {
  formatCurrencyMXN as money,
  formatDate,
  statusLabels,
} from "../../utils/format";
export type GoalView = Pick<
  SavingsGoal,
  "name" | "targetAmount" | "currentAmount"
> &
  Partial<SavingsGoal>;
export function GoalCard({
  goal,
  children,
}: {
  goal: GoalView;
  children?: React.ReactNode;
}) {
  const progress = Math.min(
    100,
    Math.max(0, (goal.currentAmount / goal.targetAmount) * 100),
  );
  return (
    <Card className="goal-card">
      <div className="row between">
        <span className="icon-tile">
          <Target size={21} />
        </span>
        {goal.status && (
          <Badge tone={goal.status === "COMPLETED" ? "green" : "neutral"}>
            {statusLabels[goal.status]}
          </Badge>
        )}
      </div>
      <h3>{goal.name}</h3>
      <div className="goal-amount">
        <strong>{money(goal.currentAmount)}</strong>
        <span>de {money(goal.targetAmount)}</span>
      </div>
      <div className="row between progress-label">
        <span>Tu avance</span>
        <strong>{progress.toFixed(0)}%</strong>
      </div>
      <progress
        max="100"
        value={progress}
        aria-label={`Avance de ${goal.name}`}
      />
      <div className="goal-details">
        <span>
          Aportación mensual
          <strong>
            {goal.monthlyContribution != null
              ? money(goal.monthlyContribution)
              : "Sin definir"}
          </strong>
        </span>
        <span>
          <CalendarDays size={13} /> Fecha objetivo
          <strong>{formatDate(goal.targetDate)}</strong>
        </span>
      </div>
      {children}
    </Card>
  );
}
