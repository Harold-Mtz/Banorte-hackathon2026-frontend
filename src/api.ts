import { z } from 'zod';
import { adaptiveResponseSchema, AdaptiveUIResponse, AgentRequest, InteractionRequest, componentTypes } from './types';
const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const useMocks = import.meta.env.VITE_USE_MOCKS !== 'false';
export type AuthSession = { token: string; user: { id: string; name: string; email: string } };
const backendResponseSchema = z.object({ success: z.literal(true), data: z.object({ sessionId: z.string(), message: z.string().optional(), intent: z.string().optional(), ui: z.object({ components: z.array(z.object({ id: z.string(), type: z.enum(componentTypes), props: z.record(z.string(), z.unknown()), title: z.string().optional(), description: z.string().optional() })) }) }) });
function normalize(raw: unknown): AdaptiveUIResponse {
	const envelope = raw as { success?: boolean; data?: unknown; error?: { message?: string } };
	if (envelope.success === false) throw new Error(envelope.error?.message || 'API request failed');
	const direct = adaptiveResponseSchema.safeParse(envelope.data ?? raw);
	if (direct.success) return direct.data;
	const parsed = backendResponseSchema.parse(raw).data;
	return { sessionId: parsed.sessionId, message: parsed.message, intent: parsed.intent, components: parsed.ui.components.map((component) => ({ id: component.id, type: component.type, title: component.title, description: component.description, data: component.props })) };
}
async function request(body: AgentRequest | InteractionRequest, path: string, token?: string) { const response = await fetch(`${baseUrl}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) }); if (!response.ok) throw new Error(`API error ${response.status}`); return normalize(await response.json()); }
export async function login(email: string, password: string): Promise<AuthSession> { const response = await fetch(`${baseUrl}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }); const raw = await response.json() as { success?: boolean; data?: AuthSession; error?: { message?: string } }; if (!response.ok || !raw.success || !raw.data) throw new Error(raw.error?.message || 'No fue posible iniciar sesión'); return raw.data; }
export async function sendMessage(body: AgentRequest, token?: string): Promise<AdaptiveUIResponse> { if (useMocks) return (await import('./mock-agent')).mockMessage(body); return request(body, '/agent/message', token); }
export async function sendInteraction(body: InteractionRequest, token?: string): Promise<AdaptiveUIResponse> { if (useMocks) return (await import('./mock-agent')).mockInteraction(body); return request(body, '/agent/interact', token); }