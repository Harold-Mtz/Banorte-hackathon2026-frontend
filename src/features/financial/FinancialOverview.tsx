import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  Info,
  Wallet,
  ShieldCheck,
  Scale,
} from "lucide-react";
import symbol from "../../public/logo.png";
import { Card } from "../../components/common/ui";
import { formatCurrencyMXN as money } from "../../utils/format";
import {
  decimal,
  signedMoney,
  type FinancialScenario,
} from "./financial-scenario";
export function FinancialHero({
  scenario: s,
}: {
  scenario: FinancialScenario;
}) {
  return (
    <section className={`financial-hero state-${s.state}`}>
      <img
        className="hero-brand-symbol"
        src={symbol}
        alt=""
        aria-hidden="true"
      />
      <div className="row between">
        <span className="eyebrow">TU PANORAMA FINANCIERO</span>
        <span className="scenario-state">
          <i />
          {s.stateLabel}
        </span>
      </div>
      <h2>{s.headline}</h2>
      <p>{s.reserveText}</p>
      <div className="hero-bottom">
        <a href="#next-step" className="button primary">
          Ver mi siguiente paso <ArrowRight size={17} />
        </a>
        <span>
          <ShieldCheck size={16} /> Orientación basada en tu perfil actual
        </span>
      </div>
    </section>
  );
}
export function FinancialKpis({
  scenario: s,
}: {
  scenario: FinancialScenario;
}) {
  const metrics = [
    { label: "Ingreso mensual", value: s.monthlyIncome },
    { label: "Gastos mensuales", value: s.monthlyExpenses },
    { label: "Margen mensual", value: s.monthlyCashFlow },
    { label: "Ahorros actuales", value: s.currentSavings },
    { label: "Deuda acumulada", value: s.currentDebt },
  ];
  return (
    <div className="scenario-kpis">
      {metrics.map((m, i) => (
        <div
          key={m.label}
          className={i === 2 ? "scenario-kpi emphasized" : "scenario-kpi"}
        >
          <span>
            {m.label}
            {i === 2 && <Wallet size={15} />}
          </span>
          <strong>{money(m.value)}</strong>
          <small>{i < 3 ? "MXN / mes" : "Saldo actual · MXN"}</small>
        </div>
      ))}
    </div>
  );
}
export function EmergencyFundCard({
  scenario: s,
}: {
  scenario: FinancialScenario;
}) {
  const bands = [
    "Menos de 1 mes",
    "1 a menos de 3",
    "3 a menos de 6",
    "6 meses o más",
  ];
  return (
    <Card className="reserve-card">
      <span className="eyebrow">03 · TU RESPALDO</span>
      <h2>Un poco de tranquilidad, en números</h2>
      <div className="reserve-main">
        <span className="icon-tile">
          <ShieldCheck size={24} />
        </span>
        <div>
          <strong>
            {s.emergencyFundMonths === null
              ? "Sin estimación"
              : decimal(s.emergencyFundMonths)}
            <small>{s.emergencyFundMonths === null ? "" : " meses"}</small>
          </strong>
          <p className="muted">{money(s.currentSavings)} ahorrados</p>
        </div>
      </div>
      <p>{s.reserveText}</p>
      <div
        className="reserve-bands"
        aria-label="Tramos orientativos del respaldo"
      >
        {bands.map((band, i) => (
          <div key={band} className={s.reserveBand === i ? "current" : ""}>
            <span />
            <small>{band}</small>
            {s.reserveBand === i && <b>Tu respaldo</b>}
          </div>
        ))}
      </div>
      <p className="disclaimer">
        Comparación orientativa con gastos constantes. No supone que todos tus
        ahorros estén libres de otros objetivos.
      </p>
    </Card>
  );
}
export function DebtOverview({ scenario: s }: { scenario: FinancialScenario }) {
  return (
    <Card className="debt-overview">
      <span className="eyebrow">04 · AHORRO Y DEUDA</span>
      <h2>El saldo completo de tu situación</h2>
      <p className="muted">{s.debtText}</p>
      <dl>
        <div>
          <dt>Deuda acumulada</dt>
          <dd>{money(s.currentDebt)}</dd>
        </div>
        <div>
          <dt>Ahorros actuales</dt>
          <dd>{money(s.currentSavings)}</dd>
        </div>
      </dl>
      <div className="net-position">
        <Scale size={21} />
        <div>
          <span>Posición ahorro − deuda</span>
          <strong>{signedMoney(s.netFinancialPosition)}</strong>
        </div>
      </div>
      <p>{s.positionText}</p>
      <p className="disclaimer">
        Esta comparación de saldos no es patrimonio total ni un indicador DTI.
        No conocemos las mensualidades de tus créditos.
      </p>
    </Card>
  );
}
export function ScenarioInsights({
  scenario: s,
}: {
  scenario: FinancialScenario;
}) {
  return (
    <Card className="scenario-insights">
      <span className="eyebrow">05 · CONECTEMOS LOS PUNTOS</span>
      <h2>¿Dónde estás hoy?</h2>
      <ul>
        {s.insights.map((insight) => (
          <li className={`insight-${insight.tone}`} key={insight.id}>
            {insight.tone === "positive" ? (
              <CheckCircle2 size={19} />
            ) : (
              <Info size={19} />
            )}
            <span>{insight.text}</span>
          </li>
        ))}
      </ul>
      <details className="scenario-method">
        <summary>Cómo leemos tu panorama</summary>
        <p>
          Margen = ingreso mensual − gastos mensuales. Gastos relativos = gastos
          ÷ ingreso. Respaldo = ahorro ÷ gastos. Posición = ahorro − deuda
          acumulada.
        </p>
        <p>
          “Margen ajustado” significa un margen positivo menor al 10% del
          ingreso. “Construyendo respaldo” indica menos de 3 meses de gastos o
          gastos sin referencia. Con al menos 10% de margen y 3 meses de
          respaldo mostramos “Con margen para explorar”. No calculamos
          proporciones cuando el denominador es cero.
        </p>
        <p>
          Son reglas transparentes de orientación de esta aplicación, no una
          evaluación crediticia ni una política oficial de Banorte.
        </p>
      </details>
    </Card>
  );
}
export function NextBestAction({
  scenario: s,
}: {
  scenario: FinancialScenario;
}) {
  const action = s.nextAction;
  return (
    <section id="next-step" className="next-best-action">
      <span className="eyebrow">TU SIGUIENTE PASO</span>
      <h2>{action.title}</h2>
      <p>{action.description}</p>
      {action.to.startsWith("#") ? (
        <a className="button primary" href={action.to}>
          {action.label}
          <ArrowUpRight size={17} />
        </a>
      ) : (
        <Link className="button primary" to={action.to}>
          {action.label}
          <ArrowUpRight size={17} />
        </Link>
      )}
      <p className="disclaimer">
        Puedes explorar cualquier objetivo. Esto no confirma capacidad de pago
        ni aprobación de crédito.
      </p>
    </section>
  );
}
export function FinancialContext({
  scenario: s,
}: {
  scenario: FinancialScenario;
}) {
  return (
    <div className="journey-context">
      <div>
        <span className="eyebrow">TU SITUACIÓN · EL PUNTO DE PARTIDA</span>
        <p>{s.headline}</p>
      </div>
      <dl>
        <div>
          <dt>Ingreso mensual</dt>
          <dd>{money(s.monthlyIncome)}</dd>
        </div>
        <div>
          <dt>Margen mensual</dt>
          <dd>{money(s.monthlyCashFlow)}</dd>
        </div>
        <div>
          <dt>Ahorros actuales</dt>
          <dd>{money(s.currentSavings)}</dd>
        </div>
      </dl>
      <small>
        Margen antes de obligaciones no incluidas en tus gastos. Es una
        referencia, no una autorización de crédito.
      </small>
    </div>
  );
}
