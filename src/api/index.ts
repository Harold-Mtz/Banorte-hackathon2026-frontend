import { request, post, patch } from "./api-client";
import type {
  AuthSession,
  User,
  FinancialProfile,
  FinancialSummary,
  LifeEvent,
  LifeEventType,
  SavingsGoal,
  MortgageSimulation,
  FinancialProduct,
  AgentResponse,
  AdaptiveUIResponse,
} from "../models";
export interface GoalInput {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  monthlyContribution?: number;
  targetDate?: string;
}
export interface MortgageInput {
  financialProductId: string;
  propertyValue: number;
  downPayment: number;
  termMonths: number;
}
export type ProfileInput = Pick<
  FinancialProfile,
  "monthlyIncome" | "monthlyExpenses" | "currentSavings" | "currentDebt"
> & { creditScore?: number };
export const api = {
  login: (data: { email: string; password: string }) =>
    post<AuthSession>("/auth/login", data),
  register: (data: { name: string; email: string; password: string }) =>
    post<AuthSession>("/auth/register", data),
  user: (id: string) => request<User>(`/users/${id}`),
  profile: (id: string) =>
    request<FinancialProfile>(`/financial-profiles/${id}/financial-profile`),
  summary: (id: string) =>
    request<FinancialSummary>(`/financial-profiles/${id}/financial-summary`),
  updateProfile: (id: string, data: ProfileInput) =>
    patch<FinancialProfile>(
      `/financial-profiles/${id}/financial-profile`,
      data,
    ),
  events: (id: string) => request<LifeEvent[]>(`/life-events/user/${id}`),
  createEvent: (userId: string, data: { type: LifeEventType; title: string }) =>
    post<LifeEvent>("/life-events", { userId, ...data }),
  goals: (id: string) => request<SavingsGoal[]>(`/savings-goals/user/${id}`),
  createGoal: (userId: string, data: GoalInput) =>
    post<SavingsGoal>("/savings-goals", { userId, ...data }),
  updateGoal: (id: string, currentAmount: number) =>
    patch<SavingsGoal>(`/savings-goals/${id}/amount`, { currentAmount }),
  mortgages: (id: string) =>
    request<MortgageSimulation[]>(`/users/${id}/mortgage-simulations`),
  products: () =>
    request<FinancialProduct[]>("/financial-products?type=MORTGAGE"),
  simulate: (userId: string, data: MortgageInput) =>
    post<MortgageSimulation>("/mortgages/simulate", { userId, ...data }),
  message: (userId: string, message: string, sessionId?: string) =>
    post<AgentResponse>("/agent/message", { userId, message, sessionId }),
  interact: (
    sessionId: string,
    componentId: string,
    action: string,
    payload?: Record<string, unknown>,
  ) =>
    post<AgentResponse>("/agent/interact", {
      sessionId,
      componentId,
      action,
      payload,
    }),
  restore: (sessionId: string) =>
    request<{ schema: AdaptiveUIResponse }>(
      `/agent/sessions/${sessionId}/ui-states/latest`,
    ),
};
