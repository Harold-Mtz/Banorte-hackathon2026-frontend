import type { ComponentType } from "react";
import type { Props } from "./schemas";
import { Financial } from "./components/FinancialSummary";
import { Capacity } from "./components/MortgageCapacity";
import { Simulator } from "./components/MortgageSimulator";
import { Products } from "./components/ProductComparison";
import { SavingsForm } from "./components/SavingsGoalForm";
import { Progress } from "./components/GoalProgress";
import { Confirmation } from "./components/Confirmation";
export const componentRegistry: Record<string, ComponentType<Props>> = {
  "financial-summary": Financial,
  "mortgage-capacity": Capacity,
  "mortgage-simulator": Simulator,
  "product-comparison": Products,
  "savings-goal-form": SavingsForm,
  "goal-progress": Progress,
  confirmation: Confirmation,
};
