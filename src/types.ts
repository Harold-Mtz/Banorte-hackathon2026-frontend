import { z } from 'zod';
export const componentTypes = ['financial-summary','mortgage-capacity','mortgage-simulator','product-comparison','savings-goal-form','goal-progress','confirmation','financial-dashboard','goal-dashboard','activity-list','cashflow-alert','credit-options'] as const;
export type ComponentType = typeof componentTypes[number];
export const actions = ['UPDATE_MORTGAGE_SIMULATION','REQUEST_CREATE_SAVINGS_GOAL','CONFIRM_CREATE_SAVINGS_GOAL','RECORD_FINANCIAL_MOVEMENT','CONFIRM_RECORD_FINANCIAL_MOVEMENT','REQUEST_CREDIT_OPTIONS','REFRESH_DASHBOARD','SELECT_GOAL','UPDATE_GOAL','PAUSE_GOAL','RESUME_GOAL','CANCEL_GOAL','ARCHIVE_GOAL','DELETE_GOAL','CONFIRM_UPDATE_GOAL','CANCEL'] as const;
export type Action = typeof actions[number];
export type AdaptiveComponent = { id: string; type: string; title?: string; description?: string; data: Record<string, unknown> };
export type AdaptiveUIResponse = { sessionId: string; message?: string; intent?: string; components: AdaptiveComponent[]; metadata?: Record<string, unknown> };
export type AgentRequest = { userId?: string; message: string; sessionId?: string };
export type InteractionRequest = { userId?: string; sessionId: string; componentId: string; action: Action; payload?: Record<string, unknown> };
const record = z.record(z.string(), z.unknown());
const amount = z.number().finite();
const goal = z.object({ id: z.string(), name: z.string(), targetAmount: amount.positive(), currentAmount: amount.nonnegative(), monthlyContribution: amount.nullish(), targetDate: z.string().nullish(), status: z.string().optional(), progress: amount.optional(), metadata: record.optional() }).passthrough();
const product = z.object({ id: z.string(), name: z.string(), annualRate: amount.nullish(), cat: amount.nullish(), minimumAmount: amount.nullish(), maximumAmount: amount.nullish(), minTermMonths: amount.nullish(), maxTermMonths: amount.nullish(), description: z.string().nullish() }).passthrough();
const movement = z.object({ id: z.string(), type: z.enum(['DEPOSIT','INCOME','WITHDRAWAL','EXPENSE']), amount: amount.positive(), occurredAt: z.string(), category: z.string().nullish(), note: z.string().nullish() }).passthrough();
const componentData: Record<string, z.ZodType> = {
  'financial-dashboard': z.object({ monthlyIncome: amount, monthlyExpenses: amount, monthlyDebtPayments: amount, availableMonthlyCash: amount, currentSavings: amount, creditScore: amount.nullish(), goals: z.array(goal), movements: z.array(movement) }).passthrough(),
  'goal-dashboard': z.object({ goals: z.array(goal) }).passthrough(),
  'activity-list': z.object({ movements: z.array(movement) }).passthrough(),
  'credit-options': z.object({ products: z.array(product) }).passthrough(),
  'product-comparison': z.object({ products: z.array(product) }).passthrough(),
  'cashflow-alert': z.object({ currentAvailable: amount, projectedAvailable: amount, warning: z.string().nullish(), goalImpacts: z.array(record).optional(), action: z.enum(actions).optional() }).passthrough(),
  'savings-goal-form': z.object({ name: z.string().optional(), targetAmount: amount.optional(), monthlyContribution: amount.optional(), targetDate: z.string().optional() }).passthrough(),
  'confirmation': z.object({ message: z.string(), action: z.enum(actions).optional() }).passthrough(),
  'mortgage-simulator': z.object({ products: z.array(product).optional(), propertyValue: amount.optional(), downPayment: amount.optional(), termMonths: amount.optional(), estimatedMonthlyPayment: amount.optional() }).passthrough(),
  'financial-summary': z.object({ monthlyIncome: amount, monthlyExpenses: amount, currentSavings: amount }).passthrough(),
  'mortgage-capacity': z.object({ estimatedMaxPayment: amount }).passthrough(),
  'goal-progress': z.object({ targetAmount: amount.positive(), currentAmount: amount.nonnegative() }).passthrough()
};
const componentSchema = z.object({ id: z.string().min(1), type: z.string(), title: z.string().optional(), description: z.string().optional(), data: record }).superRefine((component, ctx) => {
  const schema = componentData[component.type];
  if (schema && !schema.safeParse(component.data).success) ctx.addIssue({ code: 'custom', message: 'Datos inválidos para ' + component.type });
});
export const adaptiveResponseSchema = z.object({ sessionId: z.string().min(1), message: z.string().optional(), intent: z.string().optional(), components: z.array(componentSchema), metadata: record.optional() });
