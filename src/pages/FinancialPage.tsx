import { useNavigate } from "react-router-dom";
import { useData } from "../hooks/use-data";
import {
  PageHeader,
  Card,
  Skeleton,
  ErrorState,
} from "../components/common/ui";
import { FinancialSummary } from "../components/common/FinancialSummary";
import { MonthlyCashFlow } from "../features/financial/ScenarioCharts";
import { buildFinancialScenario } from "../features/financial/financial-scenario";
import { ProfileForm } from "../features/financial/ProfileForm";
import { formatCurrencyMXN as money } from "../utils/format";
export function FinancialPage({
  onboarding = false,
}: {
  onboarding?: boolean;
}) {
  const { profile } = useData();
  const scenario = profile.data ? buildFinancialScenario(profile.data) : null;
  const navigate = useNavigate();
  return (
    <>
      <PageHeader
        eyebrow={
          onboarding
            ? "PASO 2 DE 3 · TUS FINANZAS"
            : "CONOCE TU PUNTO DE PARTIDA"
        }
        title={
          onboarding ? "Hagamos un plan a tu medida." : "Mi vida financiera"
        }
        subtitle="Mantén tu información al día para explorar escenarios que tengan sentido para ti."
      />
      {profile.isPending ? (
        <Skeleton />
      ) : profile.isError ? (
        <ErrorState
          error={profile.error}
          retry={() => void profile.refetch()}
        />
      ) : (
        <>
          {!onboarding && <FinancialSummary data={profile.data} />}
          <div className="financial-columns">
            <Card>
              <h2>
                {onboarding
                  ? "Cuéntanos sobre tus finanzas"
                  : "Tu información financiera"}
              </h2>
              <p className="muted">Los montos se guardan en pesos mexicanos.</p>
              <ProfileForm
                initial={{
                  ...profile.data,
                  creditScore: profile.data.creditScore ?? undefined,
                }}
                onSaved={
                  onboarding
                    ? () => navigate("/app/onboarding/panorama")
                    : undefined
                }
              />
            </Card>
            {scenario && (
              <div>
                <Card>
                  <span className="eyebrow">MARGEN MENSUAL ESTIMADO</span>
                  <strong className="big-amount">
                    {money(scenario.monthlyCashFlow)}
                  </strong>
                  <p className="muted">
                    Ingreso menos gastos habituales. Tu deuda acumulada se
                    compara por separado.
                  </p>
                </Card>
                <MonthlyCashFlow scenario={scenario} />
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
