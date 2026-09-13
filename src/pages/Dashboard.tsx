import { Link } from "react-router-dom";
import { ArrowUpRight, House, Clock3 } from "lucide-react";
import { useAuth } from "../features/auth/AuthContext";
import { useAgent } from "../features/agent/AgentContext";
import { useData } from "../hooks/use-data";
import {
  PageHeader,
  Card,
  SectionTitle,
  Skeleton,
  ErrorState,
  Badge,
} from "../components/common/ui";
import { GoalCommand } from "../features/agent/GoalCommand";
import { ActiveGoal } from "../features/goals/ActiveGoal";
import { buildFinancialScenario } from "../features/financial/financial-scenario";
import {
  FinancialHero,
  FinancialKpis,
  EmergencyFundCard,
  DebtOverview,
  ScenarioInsights,
  NextBestAction,
} from "../features/financial/FinancialOverview";
import {
  MonthlyCashFlow,
  IncomeDistributionChart,
} from "../features/financial/ScenarioCharts";
import {
  formatCurrencyMXN as money,
  formatDate,
  lifeLabels,
  statusLabels,
} from "../utils/format";
export function Dashboard() {
  const { session } = useAuth();
  const { profile, goals, events, mortgages } = useData();
  const { send, busy } = useAgent();
  const scenario = profile.data ? buildFinancialScenario(profile.data) : null;
  return (
    <>
      <PageHeader
        eyebrow="TU VIDA, EN PERSPECTIVA"
        title={`Hola, ${session!.user.name.split(" ")[0]}`}
        subtitle="Entiende tu punto de partida. Dale dirección a lo que sigue."
        action={
          <Link className="text-link" to="/app/financial-profile">
            Actualizar mis finanzas <ArrowUpRight size={17} />
          </Link>
        }
      />
      {profile.isPending ? (
        <Skeleton cards={3} />
      ) : profile.isError ? (
        <ErrorState
          error={profile.error}
          retry={() => void profile.refetch()}
        />
      ) : scenario ? (
        <>
          <FinancialHero scenario={scenario} />
          <FinancialKpis scenario={scenario} />
        </>
      ) : (
        <ErrorState
          error={
            new Error(
              "Tu perfil contiene montos que no podemos interpretar. Revisa tu información financiera.",
            )
          }
          retry={() => void profile.refetch()}
        />
      )}
      {goals.isPending ? (
        <Skeleton cards={1} />
      ) : goals.isError ? (
        <ErrorState error={goals.error} retry={() => void goals.refetch()} />
      ) : (
        <ActiveGoal
          goals={goals.data}
          events={events.data ?? []}
          scenario={scenario}
        />
      )}
      {scenario && (
        <>
          <div className="scenario-chart-grid">
            <MonthlyCashFlow scenario={scenario} />
            <IncomeDistributionChart scenario={scenario} />
          </div>
          <div className="scenario-context-grid">
            <EmergencyFundCard scenario={scenario} />
            <DebtOverview scenario={scenario} />
          </div>
          <div className="scenario-action-grid">
            <ScenarioInsights scenario={scenario} />
            <NextBestAction scenario={scenario} />
          </div>
        </>
      )}
      {goals.data?.some((g) => g.status === "ACTIVE") && (
        <SectionTitle title="Otros capítulos por explorar" />
      )}
      <GoalCommand />
      {events.isError ? (
        <ErrorState error={events.error} retry={() => void events.refetch()} />
      ) : (
        events.data?.some((e) => e.status === "ACTIVE") && (
          <>
            <SectionTitle title="Tus experiencias">
              <Link to="/app/life-events" className="text-link">
                Ver todas <ArrowUpRight size={16} />
              </Link>
            </SectionTitle>
            <div className="cards-grid">
              {events.data
                .filter((e) => e.status === "ACTIVE")
                .slice(0, 3)
                .map((event) => (
                  <Card className="event-card" key={event.id}>
                    <div className="row between">
                      <span className="icon-tile">
                        <House size={23} />
                      </span>
                      <Badge>{statusLabels[event.status]}</Badge>
                    </div>
                    <h3>{event.title}</h3>
                    <p className="muted">{lifeLabels[event.type]}</p>
                    <Link
                      to="/app/experience"
                      className="text-link"
                      onClick={(e) => {
                        if (busy) {
                          e.preventDefault();
                          return;
                        }
                        send(lifeLabels[event.type]);
                      }}
                    >
                      Explorar mi plan <ArrowUpRight size={16} />
                    </Link>
                  </Card>
                ))}
            </div>
          </>
        )
      )}
      <Card className="activity-card">
        <SectionTitle title="Actividad reciente">
          <Clock3 size={18} />
        </SectionTitle>
        {mortgages.isPending ? (
          <Skeleton cards={1} />
        ) : mortgages.isError ? (
          <ErrorState
            error={mortgages.error}
            retry={() => void mortgages.refetch()}
          />
        ) : mortgages.data.length ? (
          <div className="activity-list">
            {mortgages.data.slice(0, 4).map((s) => (
              <Link to="/app/mortgages" key={s.id}>
                <span className="icon-tile">
                  <House size={18} />
                </span>
                <div>
                  <strong>Simulación de tu hogar</strong>
                  <small>
                    {formatDate(s.createdAt)} · {s.termMonths} meses
                  </small>
                </div>
                <strong>
                  {money(s.monthlyPayment)}
                  <small>pago mensual</small>
                </strong>
                <ArrowUpRight size={16} />
              </Link>
            ))}
          </div>
        ) : (
          <p className="muted">Tus próximas simulaciones aparecerán aquí.</p>
        )}
      </Card>
    </>
  );
}
