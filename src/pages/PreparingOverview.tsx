import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { api } from "../api";
import { useAuth } from "../features/auth/AuthContext";
import { buildFinancialScenario } from "../features/financial/financial-scenario";
import { Card, Skeleton, ErrorState } from "../components/common/ui";
export function PreparingOverview() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const profile = useQuery({
    queryKey: ["profile", session!.user.id],
    queryFn: () => api.profile(session!.user.id),
    staleTime: 0,
  });
  const ready =
    !!profile.data &&
    !profile.isFetching &&
    !profile.isError &&
    !!buildFinancialScenario(profile.data);
  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(
      () => navigate("/app", { replace: true }),
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 500,
    );
    return () => clearTimeout(timer);
  }, [ready, navigate]);
  return (
    <Card className="preparing-overview">
      <span className="icon-tile">
        <Sparkles size={26} />
      </span>
      <span className="eyebrow">PASO 3 DE 3 · TU PANORAMA</span>
      <h1>Con esto ya podemos entender mejor tu situación.</h1>
      {profile.isError ? (
        <ErrorState
          error={profile.error}
          retry={() => void profile.refetch()}
        />
      ) : profile.data && !buildFinancialScenario(profile.data) ? (
        <ErrorState
          error={
            new Error("No pudimos interpretar tus montos. Revisa tu perfil.")
          }
        />
      ) : (
        <div role="status">
          <p>Estamos preparando tu panorama financiero…</p>
          <Skeleton cards={3} />
        </div>
      )}
    </Card>
  );
}
