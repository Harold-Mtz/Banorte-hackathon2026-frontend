import { z } from 'zod';

export const componentTypes = ['financial-summary','mortgage-capacity','mortgage-simulator','product-comparison','savings-goal-form','goal-progress','confirmation','financial-dashboard','goal-dashboard','activity-list','cashflow-alert','credit-options'] as const;
export type ComponentType = typeof componentTypes[number];
export type Action = 'UPDATE_MORTGAGE_SIMULATION' | 'REQUEST_CREATE_SAVINGS_GOAL' | 'CONFIRM_CREATE_SAVINGS_GOAL' | 'RECORD_FINANCIAL_MOVEMENT' | 'CONFIRM_RECORD_FINANCIAL_MOVEMENT' | 'REQUEST_CREDIT_OPTIONS' | 'CANCEL';
export type AdaptiveComponent = { id: string; type: ComponentType; title?: string; description?: string; data: Record<string, unknown> };
export type AdaptiveUIResponse = { sessionId: string; message?: string; intent?: string; components: AdaptiveComponent[]; metadata?: Record<string, unknown> };
export type AgentRequest = { userId: string; message: string; sessionId?: string };
export type InteractionRequest = { userId: string; sessionId: string; componentId: string; action: Action; payload?: Record<string, unknown> };
const componentSchema = z.object({ id: z.string(), type: z.enum(componentTypes), title: z.string().optional(), description: z.string().optional(), data: z.record(z.string(), z.unknown()) });
export const adaptiveResponseSchema = z.object({ sessionId: z.string(), message: z.string().optional(), intent: z.string().optional(), components: z.array(componentSchema), metadata: z.record(z.string(), z.unknown()).optional() });