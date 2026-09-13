import type { ApiResponse } from "../models";
const baseURL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");
let token: string | undefined;
export function setApiToken(value?: string) {
  token = value;
}
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${baseURL}/api${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      signal: options.signal ?? AbortSignal.timeout(60000),
    });
  } catch {
    throw new ApiError(
      0,
      "NETWORK",
      "No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.",
    );
  }
  const raw = await response.json().catch(() => null);
  if (!response.ok || !raw?.success) {
    if (response.status === 401 && !path.startsWith("/auth/"))
      window.dispatchEvent(new Event("session-expired"));
    const code = raw?.error?.code ?? "API_ERROR";
    const friendly: Record<string, string> = {
      INVALID_CREDENTIALS: "El correo o la contraseña son incorrectos.",
      EMAIL_IN_USE: "Este correo ya tiene una cuenta.",
      INTERACTION_ERROR:
        "Revisa los montos, el plazo y los límites del producto. Si ya confirmaste la meta, recupera la experiencia.",
      AGENT_PROCESS_ERROR:
        "No pudimos preparar tu experiencia. Revisa tu perfil e intenta de nuevo.",
      MORTGAGE_SIMULATION_FAILED:
        "Revisa que el enganche y el plazo estén dentro de los límites del producto.",
    };
    throw new ApiError(
      response.status,
      code,
      friendly[code] ?? "No pudimos completar la solicitud. Intenta de nuevo.",
    );
  }
  return (raw as ApiResponse<T>).data;
}
export const post = <T>(path: string, data: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(data) });
export const patch = <T>(path: string, data: unknown) =>
  request<T>(path, { method: "PATCH", body: JSON.stringify(data) });
