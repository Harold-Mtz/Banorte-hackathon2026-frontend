import { Link } from "react-router-dom";
import { ArrowUpRight, Flag } from "lucide-react";
import type { SavingsGoal, LifeEvent } from "../../models";
import { GoalCard } from "./GoalCard";
import {
  buildGoalProgress,
  type FinancialScenario,
} from "../financial/financial-scenario";
import { formatCurrencyMXN as money } from "../../utils/format";
export function ActiveGoal({
  goals,
  events,
  scenario,
}: {
  goals: SavingsGoal[];
  events: LifeEvent[];
  scenario: FinancialScenario | null;
}) {
  const goal =
    goals.find(
      (g) =>
        g.status === "ACTIVE" &&
        events.some((e) => e.id === g.lifeEventId && e.type === "FIRST_HOME"),
    ) ?? goals.find((g) => g.status === "ACTIVE");
  if (!goal) return null;
  const event = events.find((e) => e.id === goal.lifeEventId);
  const { remaining } = buildGoalProgress(goal);
  const exceedsMargin =
    scenario !== null &&
    goal.monthlyContribution != null &&
    goal.monthlyContribution > scenario.monthlyCashFlow;
  return (
    <section className="active-goal-journey" aria-label="Tu objetivo principal">
      <div className="active-goal-story">
        <span className="eyebrow">
          <Flag size={14} /> TU OBJETIVO PRINCIPAL
        </span>
        <h2>
          {event?.type === "FIRST_HOME"
            ? "Tu camino hacia tu primera casa"
            : `Tu camino hacia ${goal.name}`}
        </h2>
        <p>
          {remaining > 0
            ? `Ya tienes un punto de partida. Faltan ${money(remaining)} para alcanzar tu objetivo.`
            : "Alcanzaste el importe de tu objetivo. Es momento de revisar tu siguiente paso."}
        </p>
        <div className="scenario-note">
          {exceedsMargin
            ? "Tu aportación planeada supera tu margen mensual registrado. Revisa si ese ritmo encaja con tus gastos antes de comprometerlo."
            : goal.monthlyContribution != null
              ? `Tu plan contempla ${money(goal.monthlyContribution)} al mes. Actualiza tu avance cuando cambie tu ahorro.`
              : "Puedes revisar tu meta y registrar tu avance conforme ahorres."}
        </div>
        <Link className="text-link" to={`/app/goals?goal=${goal.id}`}>
          Ver mi meta y actualizar avance <ArrowUpRight size={17} />
        </Link>
        <small>
          El ahorro de esta meta puede estar incluido en tus ahorros actuales;
          no se suma de nuevo.
        </small>
      </div>
      <GoalCard goal={goal} />
    </section>
  );
}
