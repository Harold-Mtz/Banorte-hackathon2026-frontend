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
import type { MortgageSimulation } from "../../models";
import { formatCurrencyMXN as money } from "../../utils/format";
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
