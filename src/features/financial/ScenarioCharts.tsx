import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from "recharts";
import type { FinancialScenario } from "./financial-scenario";
import { percent } from "./financial-scenario";
import { formatCurrencyMXN as money } from "../../utils/format";
import { Card } from "../../components/common/ui";
export function MonthlyCashFlow({
  scenario: s,
}: {
  scenario: FinancialScenario;
}) {
  const rows = [
    { name: "Recibes", value: s.monthlyIncome, color: "#303746" },
    { name: "Gastas", value: s.monthlyExpenses, color: "#eb0029" },
    {
      name: s.monthlyCashFlow < 0 ? "Diferencia" : "Te queda",
      value: s.monthlyCashFlow,
      color: s.monthlyCashFlow < 0 ? "#a36510" : "#16714d",
    },
  ];
  return (
    <Card className={`monthly-flow ${s.monthlyCashFlow < 0 ? "negative" : ""}`}>
      <span className="eyebrow">01 · TU MES, EN PERSPECTIVA</span>
      <h2>De lo que recibes a lo que te queda</h2>
      <p className="muted">
        Ingresos y gastos habituales. El margen puede ser negativo.
      </p>
      <div
        className="chart"
        role="img"
        aria-label={`Ingreso ${money(s.monthlyIncome)}, gastos ${money(s.monthlyExpenses)}, margen ${money(s.monthlyCashFlow)}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            layout="vertical"
            margin={{ left: 0, right: 12, top: 10, bottom: 0 }}
          >
            <CartesianGrid
              horizontal={false}
              strokeDasharray="3 6"
              stroke="#e8e9ed"
            />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              fontSize={10}
              tickFormatter={(v) => money(Number(v))}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={70}
              axisLine={false}
              tickLine={false}
              fontSize={12}
            />
            <Tooltip
              formatter={(v) => money(Number(v))}
              cursor={{ fill: "#f5f6f8" }}
            />
            <ReferenceLine x={0} stroke="#b0b3bc" />
            <Bar dataKey="value" name="MXN" barSize={25} radius={4}>
              {rows.map((row) => (
                <Cell key={row.name} fill={row.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flow-values">
        {rows.map((row) => (
          <div key={row.name}>
            <span>{row.name}</span>
            <strong>{money(row.value)}</strong>
          </div>
        ))}
      </div>
    </Card>
  );
}
export function IncomeDistributionChart({
  scenario: s,
}: {
  scenario: FinancialScenario;
}) {
  const canDistribute = s.expenseRatio !== null && s.monthlyCashFlow >= 0;
  return (
    <Card className="income-distribution">
      <span className="eyebrow">02 · CÓMO SE REPARTE</span>
      <h2>¿A dónde va tu ingreso?</h2>
      {s.expenseRatio === null ? (
        <>
          <strong className="distribution-number">Sin referencia</strong>
          <p className="muted">
            Necesitamos un ingreso mayor a cero para mostrar porcentajes. Tus
            gastos registrados son {money(s.monthlyExpenses)}.
          </p>
        </>
      ) : (
        <>
          <strong className="distribution-number">
            {percent(s.expenseRatio)}
            <small>de tu ingreso se destina a gastos</small>
          </strong>
          {canDistribute ? (
            <>
              <div
                className="distribution-bar"
                role="img"
                aria-label={`${percent(s.expenseRatio)} gastos y ${percent(s.marginRatio!)} margen`}
              >
                <span
                  className="distribution-spent"
                  style={{ flexGrow: s.expenseRatio }}
                />
                <span
                  className="distribution-margin"
                  style={{ flexGrow: s.marginRatio! }}
                />
              </div>
              <div className="distribution-legend">
                <span>
                  <i />
                  Gastos <strong>{percent(s.expenseRatio)}</strong>
                </span>
                <span>
                  <i />
                  Margen <strong>{percent(s.marginRatio!)}</strong>
                </span>
              </div>
              <p className="muted">
                De cada {money(100)} que recibes, aproximadamente{" "}
                {money(s.expenseRatio * 100)} cubren tus gastos habituales.
              </p>
            </>
          ) : (
            <div className="scenario-note attention">
              Tus gastos representan más del 100% de tu ingreso. La diferencia
              es {money(-s.monthlyCashFlow)} al mes; por eso no mostramos un
              reparto con margen disponible.
            </div>
          )}
        </>
      )}
      <p className="disclaimer">
        No restamos tu deuda acumulada del ingreso mensual. Los pagos de deuda
        no se conocen por separado.
      </p>
    </Card>
  );
}
