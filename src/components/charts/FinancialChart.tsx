import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import type { FinancialSummary, MortgageSimulation } from "../../models";
import { formatCurrencyMXN as money } from "../../utils/format";
export function FinancialChart({ data }: { data: FinancialSummary }) {
  const rows = [
    { name: "Ingreso", value: data.monthlyIncome },
    { name: "Gastos", value: data.monthlyExpenses },
    { name: "Ahorros", value: data.currentSavings },
    { name: "Deuda", value: data.currentDebt },
  ];
  return (
    <div
      className="chart"
      role="img"
      aria-label="Comparación de ingreso mensual, gastos mensuales, ahorro acumulado y deuda actual"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} barSize={36}>
          <CartesianGrid
            strokeDasharray="3 6"
            vertical={false}
            stroke="#e9e9ed"
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            fontSize={12}
          />
          <YAxis
            width={62}
            axisLine={false}
            tickLine={false}
            fontSize={11}
            tickFormatter={(v) => money(Number(v))}
          />
          <Tooltip
            formatter={(v) => money(Number(v))}
            cursor={{ fill: "#fff0f3" }}
          />
          <Bar
            dataKey="value"
            name="Monto"
            fill="#EB0029"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
export function MortgageChart({ data }: { data: MortgageSimulation[] }) {
  return (
    <div
      className="chart tall"
      role="img"
      aria-label="Comparación de pagos, intereses y costo total de simulaciones seleccionadas"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data.map((s, i) => ({ ...s, name: `Opción ${i + 1}` }))}
        >
          <CartesianGrid strokeDasharray="3 6" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis
            width={75}
            tickFormatter={(v) => money(Number(v))}
            fontSize={11}
          />
          <Tooltip formatter={(v) => money(Number(v))} />
          <Legend />
          <Bar
            dataKey="monthlyPayment"
            name="Pago mensual"
            fill="#168A55"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="totalInterest"
            name="Intereses"
            fill="#EB0029"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="totalPayment"
            name="Pago total"
            fill="#29334a"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
