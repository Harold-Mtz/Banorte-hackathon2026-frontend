import { ArrowDownLeft, ArrowUpRight, Wallet, Landmark } from "lucide-react";
import { formatCurrencyMXN as money } from "../../utils/format";
import type { FinancialSummary as Summary } from "../../models";
const fields = [
  {
    key: "monthlyIncome",
    label: "Ingreso mensual",
    icon: ArrowDownLeft,
    tone: "green",
  },
  {
    key: "monthlyExpenses",
    label: "Gastos mensuales",
    icon: ArrowUpRight,
    tone: "red",
  },
  {
    key: "currentSavings",
    label: "Ahorros acumulados",
    icon: Wallet,
    tone: "violet",
  },
  { key: "currentDebt", label: "Deuda actual", icon: Landmark, tone: "amber" },
] as const;
export function FinancialSummary({
  data,
  compact = false,
}: {
  data: Partial<Summary>;
  compact?: boolean;
}) {
  return (
    <div className={`stats-grid ${compact ? "compact" : ""}`}>
      {fields.map(({ key, label, icon: Icon, tone }) => (
        <div className="stat-card" key={key}>
          <div className="stat-top">
            <span>{label}</span>
            <span className={`stat-icon ${tone}`}>
              <Icon size={19} />
            </span>
          </div>
          <strong>
            {typeof data[key] === "number"
              ? money(data[key])
              : "Sin información"}
          </strong>
          <small>MXN</small>
        </div>
      ))}
    </div>
  );
}
