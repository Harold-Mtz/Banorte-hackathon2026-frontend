import { createContext, useContext, useState, type ReactNode } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "../../api";
import { useAuth } from "../auth/AuthContext";
import { useRefresh } from "../../hooks/use-data";
import type { AgentResponse, AdaptiveUIResponse } from "../../models";
const record = z.record(z.string(), z.unknown());
export const uiSchema = z.object({
  version: z.literal("1.0"),
  screen: z.object({ title: z.string(), subtitle: z.string().optional() }),
  components: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      props: record,
      actions: z
        .array(
          z.object({
            id: z.string(),
            type: z.string(),
            label: z.string().optional(),
            payload: record.optional(),
          }),
        )
        .optional(),
    }),
  ),
});
function validate(ui: AdaptiveUIResponse) {
  if (!uiSchema.safeParse(ui).success)
    throw new Error(
      "La experiencia recibida está incompleta. Intenta de nuevo.",
    );
  return ui;
}
interface AgentContextValue {
  response: AgentResponse | null;
  busy: boolean;
  error: Error | null;
  send: (message: string) => void;
  interact: (
    componentId: string,
    action: string,
    payload?: Record<string, unknown>,
  ) => void;
  reset: () => void;
  restore: () => void;
}
const Context = createContext<AgentContextValue | null>(null);
export function AgentProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session!.user.id;
  const key = `adaptive-agent-${userId}`;
  const [sessionId, setSessionId] = useState<string | undefined>(
    () => localStorage.getItem(key) ?? undefined,
  );
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const refresh = useRefresh();
  const restored = useQuery({
    queryKey: ["agent-ui", sessionId],
    queryFn: async () => validate((await api.restore(sessionId!)).schema),
    enabled: !!sessionId && !response,
    retry: false,
  });
  const accept = (result: AgentResponse) => {
    validate(result.ui);
    setResponse(result);
    setSessionId(result.sessionId);
    localStorage.setItem(key, result.sessionId);
    void refresh();
  };
  const message = useMutation({
    mutationFn: async (text: string) => {
      const result = await api.message(userId, text, sessionId);
      validate(result.ui);
      return result;
    },
    onSuccess: accept,
  });
  const action = useMutation({
    mutationFn: async (data: {
      componentId: string;
      action: string;
      payload?: Record<string, unknown>;
    }) => {
      const result = await api.interact(
        sessionId!,
        data.componentId,
        data.action,
        data.payload,
      );
      validate(result.ui);
      return result;
    },
    onSuccess: accept,
  });
  const busy = message.isPending || action.isPending || restored.isFetching;
  return (
    <Context.Provider
      value={{
        response:
          response ??
          (restored.data && sessionId
            ? { sessionId, ui: restored.data }
            : null),
        busy,
        error: message.error ?? action.error ?? restored.error,
        send: (text) => {
          if (!busy) {
            action.reset();
            message.mutate(text);
          }
        },
        interact: (componentId, type, payload) => {
          if (!busy && sessionId) {
            message.reset();
            action.mutate({ componentId, action: type, payload });
          }
        },
        reset: () => {
          if (busy) return;
          localStorage.removeItem(key);
          setResponse(null);
          setSessionId(undefined);
          message.reset();
          action.reset();
        },
        restore: () => {
          if (!sessionId) {
            if (message.variables) message.mutate(message.variables);
            return;
          }
          setResponse(null);
          action.reset();
          message.reset();
          void restored.refetch();
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useAgent() {
  const value = useContext(Context);
  if (!value) throw new Error("AgentProvider missing");
  return value;
}
