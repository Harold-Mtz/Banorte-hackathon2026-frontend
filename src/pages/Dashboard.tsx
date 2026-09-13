import { Link } from "react-router-dom";
import { ArrowUpRight, House, ArrowRight, Clock3, Wallet } from "lucide-react";
import { useAuth } from "../features/auth/AuthContext";
import { useData } from "../hooks/use-data";
import {
  PageHeader,
  Card,
  SectionTitle,
  Skeleton,
  ErrorState,
  EmptyState,
  Badge,
} from "../components/common/ui";
import { FinancialSummary } from "../components/common/FinancialSummary";
import { FinancialChart } from "../components/charts/FinancialChart";
import { GoalCommand } from "../features/agent/GoalCommand";
import { GoalCard } from "../features/goals/GoalCard";
import {
  formatCurrencyMXN as money,
  formatDate,
  lifeLabels,
  statusLabels,
} from "../utils/format";
export function Dashboard() {
  const { session } = useAuth();
  const { summary, goals, events, mortgages } = useData();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";
  return (
    <>
      <PageHeader
        eyebrow="CADA PASO CUENTA"
        title={`${greeting}, ${session!.user.name.split(" ")[0]}`}
        subtitle="Tu vida financiera, con tus planes en el centro."
        action={
          <Link className="text-link" to="/app/financial-profile">
            Ver mi perfil financiero <ArrowUpRight size={17} />
          </Link>
        }
      />
      {summary.isPending ? (
        <Skeleton cards={4} />
      ) : summary.isError ? (
        <ErrorState
          error={summary.error}
          retry={() => void summary.refetch()}
        />
      ) : (
        <>
          <FinancialSummary data={summary.data} />
          <div className="available-income">
            <span>
              <Wallet size={17} /> Disponibilidad mensual
            </span>
            <strong>{money(summary.data.availableIncome)}</strong>
            <span className="muted">Después de gastos y deuda registrada</span>
          </div>
        </>
      )}
      <GoalCommand />
      <div className="dashboard-columns">
        <Card>
          <SectionTitle title="Tu panorama financiero">
            <Badge>MXN</Badge>
          </SectionTitle>
          <p className="muted">Un vistazo a los montos de tu perfil.</p>
          {summary.data ? (
            <FinancialChart data={summary.data} />
          ) : summary.isError ? (
            <ErrorState retry={() => void summary.refetch()} />
          ) : (
            <Skeleton cards={1} />
          )}
          <p className="chart-note">
            Ingresos y gastos mensuales · Ahorro acumulado y deuda actual
          </p>
        </Card>
        <div>
          <SectionTitle title="Tu ahorro, con propósito">
            <Link to="/app/goals" className="text-link">
              Ver todas <ArrowRight size={16} />
            </Link>
          </SectionTitle>
          {goals.isPending ? (
            <Skeleton cards={1} />
          ) : goals.isError ? (
            <ErrorState
              error={goals.error}
              retry={() => void goals.refetch()}
            />
          ) : goals.data.length ? (
            <GoalCard
              goal={
                goals.data.find((g) => g.status === "ACTIVE") ?? goals.data[0]
              }
            />
          ) : (
            <Card>
              <EmptyState
                title="Algo grande empieza con una meta"
                description="Dale un nombre a eso que quieres lograr."
                action={
                  <Link to="/app/goals" className="button secondary">
                    Crear mi primera meta <ArrowRight size={16} />
                  </Link>
                }
              />
            </Card>
          )}
        </div>
      </div>
      <SectionTitle title="Tus próximos capítulos">
        <Link to="/app/life-events" className="text-link">
          Ver experiencias <ArrowRight size={16} />
        </Link>
      </SectionTitle>
      {events.isPending ? (
        <Skeleton />
      ) : events.isError ? (
        <ErrorState error={events.error} retry={() => void events.refetch()} />
      ) : events.data.filter((e) => e.status === "ACTIVE").length ? (
        <div className="cards-grid">
          {events.data
            .filter((e) => e.status === "ACTIVE")
            .slice(0, 3)
            .map((event) => (
              <Link
                to="/app/experience"
                className="event-card card"
                key={event.id}
              >
                <div className="row between">
                  <span className="icon-tile">
                    <House size={23} />
                  </span>
                  <Badge tone="green">{statusLabels[event.status]}</Badge>
                </div>
                <h3>{event.title}</h3>
                <p className="muted">{lifeLabels[event.type]}</p>
                <span className="text-link">
                  Explorar mi plan <ArrowUpRight size={16} />
                </span>
              </Link>
            ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            title="Cuéntanos qué quieres lograr"
            description="Tu próxima experiencia comienza con una idea."
            action={
              <Link to="/app/experience" className="text-link">
                Explorar un objetivo <ArrowRight size={16} />
              </Link>
            }
          />
        </Card>
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
