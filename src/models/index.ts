// Wire models derived from backend models; dates are serialized as strings.
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}
export interface FinancialProfile {
  id: string;
  userId: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
  currentDebt: number;
  creditScore: number | null;
  createdAt: string;
  updatedAt: string;
}
export type FinancialProductType =
  "MORTGAGE" | "AUTO_LOAN" | "PERSONAL_LOAN" | "SAVINGS" | "INVESTMENT";

export interface FinancialProduct {
  id: string;
  name: string;
  type: FinancialProductType;
  description: string | null;
  interestRate: number | null;
  cat: number | null;
  minimumAmount: number | null;
  maximumAmount: number | null;
  minimumTermMonths: number | null;
  maximumTermMonths: number | null;
  isActive: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
export const LIFE_EVENT_TYPES = [
  "FIRST_HOME",
  "CAR_PURCHASE",
  "MARRIAGE",
  "CHILD",
  "EDUCATION",
  "TRAVEL",
] as const;

export type LifeEventType = (typeof LIFE_EVENT_TYPES)[number];

export function isLifeEventType(value: unknown): value is LifeEventType {
  return (
    typeof value === "string" && LIFE_EVENT_TYPES.some((type) => type === value)
  );
}

export type LifeEventStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface LifeEvent {
  id: string;
  userId: string;
  type: LifeEventType;
  title: string;
  status: LifeEventStatus;
  context: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
export type SavingsGoalStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface SavingsGoal {
  id: string;
  userId: string;
  lifeEventId: string | null;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number | null;
  targetDate: string | null;
  status: SavingsGoalStatus;
  createdAt: string;
  updatedAt: string;
}
export interface MortgageSimulation {
  id: string;
  userId: string;
  lifeEventId: string | null;
  financialProductId: string | null;
  propertyValue: number;
  downPayment: number;
  loanAmount: number;
  termMonths: number;
  annualInterestRate: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  createdAt: string;
}
export interface FinancialSummary {
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
  currentDebt: number;
  creditScore: number | null;
  availableIncome: number;
}
export interface UIAction {
  id: string;
  type: string;
  label?: string;
  payload?: Record<string, unknown>;
}

export type UIComponentType =
  | "financial-summary"
  | "mortgage-capacity"
  | "mortgage-simulator"
  | "product-comparison"
  | "savings-goal-form"
  | "goal-progress"
  | "goal-plan-form"
  | "goal-plan"
  | "confirmation";

export interface UIComponent {
  id: string;
  type: UIComponentType;

  props: Record<string, unknown>;

  actions?: UIAction[];
}

export interface AdaptiveUIResponse {
  version: "1.0";

  screen: {
    title: string;
    subtitle?: string;
  };

  components: UIComponent[];
}
export interface AgentResponse {
  sessionId: string;
  message?: string;
  intent?: string;
  ui: AdaptiveUIResponse;
}
export interface AuthSession {
  token: string;
  user: Pick<User, "id" | "name" | "email">;
}
export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}
export interface ApiErrorResponse {
  success: false;
  error: { code: string; message: string; details?: unknown };
}
