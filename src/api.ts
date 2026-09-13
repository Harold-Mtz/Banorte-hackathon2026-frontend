import { normalize } from './adaptive-contract';
import { z } from 'zod';
import { AdaptiveUIResponse, AgentRequest, InteractionRequest } from './types';
const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
export const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';
export const authSchema = z.object({ token: z.string().min(1), user: z.object({ id: z.string(), name: z.string(), email: z.string() }) });
export type AuthSession = z.infer<typeof authSchema>;
export class ApiError extends Error { constructor(message: string, public status = 0) { super(message); } }
async function post(path: string, body: unknown, token?: string): Promise<unknown> {
  try {
    const response = await fetch(baseUrl + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: JSON.stringify(body), signal: AbortSignal.timeout(30000) });
    const raw = await response.json().catch(() => null);
    if (!response.ok) throw new ApiError(raw?.error?.message || 'No se pudo completar la solicitud.', response.status);
    return raw;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('No pudimos conectar con Boreas. Revisa la conexión y vuelve a intentar.');
  }
}
export async function login(email: string, password: string): Promise<AuthSession> {
  const raw = await post('/auth/login', { email, password }) as { data?: unknown };
  const parsed = authSchema.safeParse(raw.data);
  if (!parsed.success) throw new ApiError('La respuesta de inicio de sesión es inválida.');
  return parsed.data;
}
export async function sendMessage(body: AgentRequest, token?: string): Promise<AdaptiveUIResponse> {
  if (useMocks) return (await import('./mock-agent')).mockMessage({ ...body, userId: body.userId ?? 'mock-user' });
  return normalize(await post('/agent/message', body, token));
}
export async function sendInteraction(body: InteractionRequest, token?: string): Promise<AdaptiveUIResponse> {
  if (useMocks) return (await import('./mock-agent')).mockInteraction({ ...body, userId: body.userId ?? 'mock-user' });
  return normalize(await post('/agent/interact', body, token));
}
