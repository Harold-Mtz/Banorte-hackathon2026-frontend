import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../features/auth/AuthContext";
import { api } from "../api";
export function useData() {
  const { session } = useAuth();
  const id = session!.user.id;
  const profile = useQuery({
    queryKey: ["profile", id],
    queryFn: () => api.profile(id),
  });
  const goals = useQuery({
    queryKey: ["goals", id],
    queryFn: () => api.goals(id),
  });
  const events = useQuery({
    queryKey: ["events", id],
    queryFn: () => api.events(id),
  });
  const mortgages = useQuery({
    queryKey: ["mortgages", id],
    queryFn: () => api.mortgages(id),
  });
  return { id, profile, goals, events, mortgages };
}
export function useRefresh() {
  const client = useQueryClient();
  return (
    keys: readonly string[] = ["profile", "goals", "events", "mortgages"],
  ) =>
    client.invalidateQueries({
      predicate: (query) => keys.includes(String(query.queryKey[0])),
    });
}
