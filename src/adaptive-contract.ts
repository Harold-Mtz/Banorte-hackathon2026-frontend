import { z } from 'zod';
import { adaptiveResponseSchema, AdaptiveUIResponse } from './types';
export function normalize(raw: unknown): AdaptiveUIResponse {
  const envelope = z.object({ success: z.boolean().optional(), data: z.unknown().optional() }).passthrough().safeParse(raw);
  if (!envelope.success) throw new Error('Boreas devolvió una respuesta inválida.');
  if (envelope.data.success === false) throw new Error('No se pudo completar la solicitud.');
  const value = envelope.data.data ?? raw;
  const direct = adaptiveResponseSchema.safeParse(value);
  if (direct.success) return direct.data;
  const backend = z.object({ sessionId: z.string(), message: z.string().optional(), intent: z.string().optional(), ui: z.object({ components: z.array(z.object({ id: z.string(), type: z.string(), props: z.record(z.string(), z.unknown()), title: z.string().optional(), description: z.string().optional() })) }) }).safeParse(value);
  if (!backend.success) throw new Error('Boreas devolvió una vista inválida. Intenta actualizar el tablero.');
  const result = adaptiveResponseSchema.safeParse({ ...backend.data, components: backend.data.ui.components.map(component => ({ ...component, data: component.props })) });
  if (!result.success) throw new Error('Los datos de la vista están incompletos. Intenta actualizar el tablero.');
  return result.data;
}
