import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import type { AuthSession } from "../../models";
import { setApiToken } from "../../api/api-client";
const schema = z.object({
  token: z.string().min(1),
  user: z.object({ id: z.string(), name: z.string(), email: z.string() }),
});
function readSession(): AuthSession | null {
  try {
    return schema.parse(
      JSON.parse(localStorage.getItem("adaptive-session") ?? "null"),
    );
  } catch {
    return null;
  }
}
const Context = createContext<{
  session: AuthSession | null;
  signIn: (s: AuthSession) => void;
  logout: () => void;
} | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState(readSession);
  const client = useQueryClient();
  setApiToken(session?.token);
  const logout = useCallback(() => {
    setApiToken();
    localStorage.removeItem("adaptive-session");
    Object.keys(localStorage)
      .filter((k) => k.startsWith("adaptive-agent-"))
      .forEach((k) => localStorage.removeItem(k));
    setSession(null);
    client.clear();
  }, [client]);
  useEffect(() => {
    window.addEventListener("session-expired", logout);
    const sync = (e: StorageEvent) => {
      if (e.key === "adaptive-session") {
        client.clear();
        setSession(readSession());
      }
    };
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("session-expired", logout);
      window.removeEventListener("storage", sync);
    };
  }, [logout, client]);
  function signIn(value: AuthSession) {
    const valid = schema.parse(value);
    client.clear();
    setApiToken(valid.token);
    localStorage.setItem("adaptive-session", JSON.stringify(valid));
    setSession(valid);
  }
  return (
    <Context.Provider value={{ session, signIn, logout }}>
      {children}
    </Context.Provider>
  );
}
export function useAuth() {
  const value = useContext(Context);
  if (!value) throw new Error("AuthProvider missing");
  return value;
}
