import { test, expect } from "@playwright/test";
import {
  buildFinancialScenario,
  buildGoalProgress,
  buildHomeGap,
} from "../src/features/financial/financial-scenario";
const base = {
  monthlyIncome: 30000,
  monthlyExpenses: 20000,
  currentSavings: 80000,
  currentDebt: 25000,
};
test("escenario solicitado: deuda acumulada no consume el ingreso mensual", () => {
  const s = buildFinancialScenario(base)!;
  expect(s.monthlyCashFlow).toBe(10000);
  expect(s.expenseRatio).toBeCloseTo(2 / 3);
  expect(s.emergencyFundMonths).toBe(4);
  expect(s.netFinancialPosition).toBe(55000);
  expect(s.debtIncomeEquivalent).toBeCloseTo(25000 / 30000);
  expect(s.headline).toContain("$10,000");
  expect(s.debtText).toContain("0.8 meses");
  expect(s.state).toBe("room");
  expect(
    buildFinancialScenario({ ...base, currentDebt: 900000 })?.monthlyCashFlow,
  ).toBe(10000);
});
test("cero ingreso o gastos: proporciones no estimables, nunca Infinity o NaN", () => {
  for (const p of [
    { monthlyIncome: 0, monthlyExpenses: 0, currentSavings: 0, currentDebt: 0 },
    { ...base, monthlyIncome: 0 },
    { ...base, monthlyExpenses: 0 },
  ]) {
    const s = buildFinancialScenario(p)!;
    expect(s).not.toBeNull();
    if (p.monthlyIncome === 0) {
      expect(s.expenseRatio).toBeNull();
      expect(s.debtIncomeEquivalent).toBeNull();
    }
    if (p.monthlyExpenses === 0) expect(s.emergencyFundMonths).toBeNull();
    for (const value of Object.values(s))
      if (typeof value === "number") expect(Number.isFinite(value)).toBe(true);
  }
});
test("déficit, margen nulo, ajustado y respaldo tienen reglas transparentes", () => {
  expect(
    buildFinancialScenario({ ...base, monthlyExpenses: 32000 })?.state,
  ).toBe("deficit");
  expect(
    buildFinancialScenario({ ...base, monthlyExpenses: 30000 })?.state,
  ).toBe("balanced");
  expect(
    buildFinancialScenario({ ...base, monthlyExpenses: 28000 })?.state,
  ).toBe("tight");
  expect(buildFinancialScenario({ ...base, currentSavings: 1000 })?.state).toBe(
    "building",
  );
  for (const [savings, band] of [
    [0, 0],
    [19999, 0],
    [20000, 1],
    [59999, 1],
    [60000, 2],
    [119999, 2],
    [120000, 3],
  ])
    expect(
      buildFinancialScenario({ ...base, currentSavings: savings })?.reserveBand,
    ).toBe(band);
});
test("no oculta una posición negativa ni acepta datos incompletos", () => {
  expect(
    buildFinancialScenario({ ...base, currentDebt: 100000 })
      ?.netFinancialPosition,
  ).toBe(-20000);
  for (const monthlyIncome of [-1, Infinity, NaN])
    expect(buildFinancialScenario({ ...base, monthlyIncome })).toBeNull();
});
test("la diferencia de enganche y el progreso nunca duplican ahorros", () => {
  expect(buildHomeGap(400000, 180000).remaining).toBe(220000);
  expect(buildHomeGap(100000, 180000).remaining).toBe(0);
  expect(
    buildGoalProgress({ targetAmount: 400000, currentAmount: 180000 }),
  ).toEqual({ progress: 45, remaining: 220000 });
  expect(
    buildGoalProgress({ targetAmount: 400000, currentAmount: 500000 }),
  ).toEqual({ progress: 100, remaining: 0 });
});
