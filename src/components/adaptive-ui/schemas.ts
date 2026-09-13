import { z } from "zod";
import type { UIComponent } from "../../models";
export const n = z.number().finite();
export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  interestRate: n.nullable(),
  cat: n.nullish(),
  minimumAmount: n.nullish(),
  maximumAmount: n.nullish(),
  minimumTermMonths: n.nullish(),
  maximumTermMonths: n.nullish(),
  description: z.string().nullish(),
});
export const financialSchema = z.object({
  monthlyIncome: n,
  monthlyExpenses: n,
  currentSavings: n,
  currentDebt: n,
  creditScore: n.nullish(),
});
export const goalSchema = z.object({
  name: z.string(),
  targetAmount: n.positive(),
  currentAmount: n.nonnegative(),
  monthlyContribution: n.nullish(),
  targetDate: z.string().nullish(),
  status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
});
export const simulationSchema = z.object({
  products: z.array(productSchema),
  financialProductId: z.string().optional(),
  propertyValue: n.optional(),
  downPayment: n.optional(),
  termMonths: n.optional(),
  monthlyPayment: n.optional(),
  loanAmount: n.optional(),
  annualInterestRate: n.optional(),
  totalInterest: n.optional(),
  totalPayment: n.optional(),
});
export interface Props {
  component: UIComponent;
}
