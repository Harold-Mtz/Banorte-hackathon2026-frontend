import { Link } from "react-router-dom";
import { useAgent } from "../features/agent/AgentContext";
import { GoalCommand } from "../features/agent/GoalCommand";
import { DynamicUIRenderer } from "../components/adaptive-ui/DynamicUIRenderer";
import {
  PageHeader,
  Button,
  Skeleton,
  ErrorState,
} from "../components/common/ui";
export function ExperiencePage({
  onboarding = false,
}: {
  onboarding?: boolean;
}) {
  const { response, busy, error, reset, restore } = useAgent();
  return (
    <>
      <PageHeader
        eyebrow={
          onboarding
            ? "PASO 3 DE 3 · TU OBJETIVO"
            : "UNA EXPERIENCIA TAN ÚNICA COMO TÚ"
        }
        title="Tu vida marca el camino."
        subtitle="Cuéntanos lo que viene. Exploremos juntos cómo llegar."
        action={
          response ? (
            <Button variant="secondary" disabled={busy} onClick={reset}>
              Nuevo objetivo
            </Button>
          ) : undefined
        }
      />
      <GoalCommand />
      {onboarding && (
        <Link className="text-link" to="/app">
          Ir a mi inicio
        </Link>
      )}
      {error && (
        <>
          <ErrorState error={error} retry={restore} />
          <Button variant="ghost" disabled={busy} onClick={reset}>
            Comenzar una nueva experiencia
          </Button>
        </>
      )}
      {busy && (
        <div aria-live="polite">
          <p className="muted">Estamos preparando tu experiencia…</p>
          <Skeleton cards={3} />
        </div>
      )}
      {response && (
        <div aria-busy={busy}>
          {response.message && (
            <p className="agent-support">{response.message}</p>
          )}
          <DynamicUIRenderer ui={response.ui} />
        </div>
      )}
    </>
  );
}
