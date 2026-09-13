import type { FinancialProfile } from "../../models";
import { formatCurrencyMXN as money } from "../../utils/format";

export type ScenarioProfile = Pick<
  FinancialProfile,
  "monthlyIncome" | "monthlyExpenses" | "currentSavings" | "currentDebt"
>;
export type ScenarioState =
  "no-income" | "deficit" | "balanced" | "tight" | "building" | "room";
export type Insight = {
  id: string;
  text: string;
  tone: "neutral" | "attention" | "positive";
};
// Product UX thresholds, not a credit assessment or an official banking policy.
export const scenarioRules = {
  tightMarginRatio: 0.1,
  reserveMonths: [1, 3, 6] as const,
};
export const decimal = (value: number) =>
  new Intl.NumberFormat("es-MX", { maximumFractionDigits: 1 }).format(value);
export const percent = (ratio: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(ratio);
export const signedMoney = (value: number) =>
  `${value > 0 ? "+" : ""}${money(value)}`;

export function buildFinancialScenario(profile: ScenarioProfile) {
  const { monthlyIncome, monthlyExpenses, currentSavings, currentDebt } =
    profile;
  if (
    Object.values({
      monthlyIncome,
      monthlyExpenses,
      currentSavings,
      currentDebt,
    }).some((value) => !Number.isFinite(value) || value < 0)
  )
    return null;
  const monthlyCashFlow = monthlyIncome - monthlyExpenses;
  const expenseRatio =
    monthlyIncome > 0 ? monthlyExpenses / monthlyIncome : null;
  const marginRatio =
    monthlyIncome > 0 ? monthlyCashFlow / monthlyIncome : null;
  const emergencyFundMonths =
    monthlyExpenses > 0 ? currentSavings / monthlyExpenses : null;
  const netFinancialPosition = currentSavings - currentDebt;
  const debtIncomeEquivalent =
    monthlyIncome > 0 ? currentDebt / monthlyIncome : null;
  const reserveBand =
    emergencyFundMonths === null
      ? null
      : emergencyFundMonths < scenarioRules.reserveMonths[0]
        ? 0
        : emergencyFundMonths < scenarioRules.reserveMonths[1]
          ? 1
          : emergencyFundMonths < scenarioRules.reserveMonths[2]
            ? 2
            : 3;
  const state: ScenarioState =
    monthlyIncome === 0
      ? "no-income"
      : monthlyCashFlow < 0
        ? "deficit"
        : monthlyCashFlow === 0
          ? "balanced"
          : marginRatio! < scenarioRules.tightMarginRatio
            ? "tight"
            : emergencyFundMonths === null ||
                emergencyFundMonths < scenarioRules.reserveMonths[1]
              ? "building"
              : "room";
  const labels: Record<ScenarioState, string> = {
    "no-income": "Sin ingreso registrado",
    deficit: "Por equilibrar",
    balanced: "Sin margen mensual",
    tight: "Margen ajustado",
    building: "Construyendo respaldo",
    room: "Con margen para explorar",
  };
  const headline =
    monthlyCashFlow < 0
      ? `Tus gastos superan tus ingresos por ${money(-monthlyCashFlow)} al mes.`
      : monthlyIncome === 0
        ? "Empecemos por entender lo que recibes cada mes."
        : monthlyCashFlow === 0
          ? "Tus ingresos cubren tus gastos, sin margen mensual por ahora."
          : `Después de tus gastos habituales tienes aproximadamente ${money(monthlyCashFlow)} de margen al mes.`;
  const reserveText =
    emergencyFundMonths === null
      ? "Registra tus gastos habituales para estimar cuántos meses podrían cubrir tus ahorros."
      : emergencyFundMonths > 0 && emergencyFundMonths < 0.1
        ? "Tus ahorros podrían cubrir menos de 0.1 meses de tus gastos actuales."
        : `Tus ahorros podrían cubrir aproximadamente ${decimal(emergencyFundMonths)} meses de tus gastos actuales.`;
  const debtText =
    debtIncomeEquivalent === null
      ? "Sin un ingreso mensual positivo no podemos expresar tu deuda en meses de ingreso."
      : debtIncomeEquivalent > 0 && debtIncomeEquivalent < 0.1
        ? "Tu deuda acumulada equivale a menos de 0.1 meses de tus ingresos."
        : `Tu deuda acumulada equivale aproximadamente a ${decimal(debtIncomeEquivalent)} meses de tus ingresos.`;
  const positionText =
    netFinancialPosition > 0
      ? `Tus ahorros superan tu deuda actual por ${money(netFinancialPosition)}.`
      : netFinancialPosition < 0
        ? `Tu deuda actual supera tus ahorros por ${money(-netFinancialPosition)}.`
        : "Tus ahorros y tu deuda actual tienen el mismo importe.";
  const insights: Insight[] = [
    {
      id: "cash",
      text:
        monthlyCashFlow < 0
          ? `Hay una diferencia mensual de ${money(-monthlyCashFlow)} por cubrir.`
          : monthlyCashFlow === 0
            ? "Tus gastos utilizan todo tu ingreso registrado."
            : `Tus ingresos cubren tus gastos y mantienen ${money(monthlyCashFlow)} de margen.`,
      tone: monthlyCashFlow > 0 ? "positive" : "attention",
    },
    {
      id: "expenses",
      text:
        expenseRatio === null
          ? "Necesitamos un ingreso positivo para comparar tus gastos."
          : `Gastas alrededor del ${percent(expenseRatio)} de tus ingresos.`,
      tone: state === "tight" || state === "deficit" ? "attention" : "neutral",
    },
    {
      id: "reserve",
      text: reserveText,
      tone:
        emergencyFundMonths !== null &&
        emergencyFundMonths >= scenarioRules.reserveMonths[1]
          ? "positive"
          : "neutral",
    },
    {
      id: "debt",
      text: positionText,
      tone: netFinancialPosition < 0 ? "attention" : "neutral",
    },
  ];
  const nextAction =
    state === "no-income"
      ? {
          title: "Completa tu punto de partida",
          description:
            "Revisa si tus ingresos y gastos representan tu situación habitual. Puedes explorar objetivos mientras completas la información.",
          label: "Revisar mis finanzas",
          to: "/app/financial-profile",
        }
      : ["deficit", "balanced", "tight"].includes(state)
        ? {
            title: "Primero, encuentra un poco más de margen",
            description:
              "Revisar tus gastos puede ayudarte a recuperar espacio antes de asumir un compromiso nuevo. Explorar objetivos sigue disponible.",
            label: "Revisar ingresos y gastos",
            to: "/app/financial-profile",
          }
        : state === "building"
          ? {
              title: "Dale un objetivo a tu respaldo",
              description:
                "Puedes explorar una meta de ahorro para fortalecer tu respaldo, a un ritmo que tenga sentido para ti.",
              label: "Crear una meta de ahorro",
              to: "/app/goals?new=1",
            }
          : netFinancialPosition < 0
            ? {
                title: "Mira tu deuda junto con tus planes",
                description:
                  "Tienes margen mensual. Revisa también el saldo de tus deudas antes de explorar un compromiso nuevo.",
                label: "Revisar mi deuda",
                to: "/app/financial-profile",
              }
            : {
                title: "Tu próximo capítulo ya tiene un punto de partida",
                description:
                  "Tienes margen positivo y ahorro registrado. Explora una meta y compara escenarios sin asumir un compromiso.",
                label: "Explorar qué puedo lograr",
                to: "#life-goals",
              };
  return {
    monthlyIncome,
    monthlyExpenses,
    monthlyCashFlow,
    expenseRatio,
    marginRatio,
    emergencyFundMonths,
    currentSavings,
    currentDebt,
    netFinancialPosition,
    debtIncomeEquivalent,
    reserveBand,
    state,
    stateLabel: labels[state],
    headline,
    reserveText,
    debtText,
    positionText,
    insights,
    nextAction,
  };
}
export type FinancialScenario = NonNullable<
  ReturnType<typeof buildFinancialScenario>
>;
export function buildGoalProgress(goal: {
  targetAmount: number;
  currentAmount: number;
}) {
  return {
    progress:
      goal.targetAmount > 0
        ? Math.min(
            100,
            Math.max(0, (goal.currentAmount / goal.targetAmount) * 100),
          )
        : 0,
    remaining: Math.max(0, goal.targetAmount - goal.currentAmount),
  };
}
export function buildHomeGap(
  desiredDownPayment: number,
  currentSavings: number,
) {
  return {
    desiredDownPayment,
    currentSavings,
    remaining: Math.max(0, desiredDownPayment - currentSavings),
  };
}
