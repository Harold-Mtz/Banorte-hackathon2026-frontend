import { useState } from "react";
import { z } from "zod";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useAgent } from "../../../features/agent/AgentContext";
import { Card, Button, Field, Badge } from "../../common/ui";
import type { Props } from "../schemas";

const money = (value: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(value);
const inputSchema = z.object({
  targetAmount: z.number(),
  allocatedSavings: z.number(),
  months: z.number(),
  contribution: z.number(),
  extraExpenses: z.number(),
  details: z.string(),
});
export function PlanForm({ component }: Props) {
  const { interact, busy } = useAgent();
  const initial = inputSchema.safeParse(component.props.input);
  const [values, setValues] = useState<Record<string, string>>(() =>
    initial.success
      ? Object.fromEntries(
          Object.entries(initial.data).map(([k, v]) => [k, String(v)]),
        )
      : {
          targetAmount: "",
          allocatedSavings: "0",
          months: "12",
          contribution: "",
          extraExpenses: "0",
          details: "",
        },
  );
  const action = component.actions?.find((a) => a.type === "BUILD_GOAL_PLAN");
  return (
    <Card className="goal-planner">
      <p className="eyebrow">TU OBJETIVO, PASO A PASO</p>
      <h2>
        {typeof component.props.objective === "string"
          ? component.props.objective
          : "Prepara tu plan"}
      </h2>
      <p className="muted">
        Usaremos los ingresos y gastos de tu perfil. Indica cuánto puedes
        dedicar a este objetivo sin comprometer tus otros gastos. Para una casa,
        puedes planear el enganche.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (action)
            interact(component.id, action.type, {
              ...Object.fromEntries(
                Object.entries(values)
                  .filter(([k]) => k !== "details")
                  .map(([k, v]) => [k, Number(v)]),
              ),
              details: values.details,
            });
        }}
      >
        <div className="plan-fields">
          {[
            [
              "targetAmount",
              "Presupuesto del objetivo (MXN)",
              "0.01",
              "1000000000",
            ],
            [
              "allocatedSavings",
              "Ahorro que dedicarás (MXN)",
              "0",
              "1000000000",
            ],
            ["months", "Plazo del plan (meses)", "1", "360"],
            [
              "contribution",
              "Aportación prevista al mes (MXN)",
              "0",
              "1000000000",
            ],
            [
              "extraExpenses",
              "Gastos mensuales adicionales (MXN)",
              "0",
              "1000000000",
            ],
          ].map(([key, label, min, max]) => (
            <Field
              key={key}
              label={label}
              type="number"
              required
              min={min}
              max={max}
              step={key === "months" ? "1" : "0.01"}
              value={values[key]}
              disabled={busy}
              onChange={(e) => setValues({ ...values, [key]: e.target.value })}
              helper={
                key === "extraExpenses"
                  ? "Solo gastos nuevos que aún no incluyes en tu perfil."
                  : key === "allocatedSavings"
                    ? "No puede superar tus ahorros actuales ni el presupuesto."
                    : undefined
              }
            />
          ))}
        </div>
        <Field
          label="Detalles y prioridades del objetivo"
          maxLength={1000}
          value={values.details}
          placeholder="Destino, curso, modelo de auto, prioridades…"
          onChange={(e) => setValues({ ...values, details: e.target.value })}
          disabled={busy}
        />
        <Button type="submit" loading={busy} disabled={!action}>
          {initial.success ? "Recalcular mi plan" : "Generar mi plan"}
        </Button>
      </form>
    </Card>
  );
}
const planSchema = z.object({
  objective: z.string(),
  input: inputSchema,
  available: z.number(),
  requiredMonthly: z.number(),
  shortfall: z.number(),
  monthlyRemainder: z.number(),
  monthsNeeded: z.number().nullable(),
  feasible: z.boolean(),
  affordable: z.boolean(),
  steps: z.array(z.string()),
  plannedAt: z.string(),
  source: z.enum(["ai", "rules"]).optional(),
  projection: z.array(
    z.object({ month: z.number(), amount: z.number(), target: z.number() }),
  ),
});
export function PlanResult({ component }: Props) {
  const { interact, busy } = useAgent();
  const [page, setPage] = useState(0);
  const parsed = planSchema.safeParse(component.props);
  if (!parsed.success)
    return (
      <Card>
        <p>No se pudo leer el plan. Vuelve a generarlo.</p>
      </Card>
    );
  const p = parsed.data;
  const action = component.actions?.find((a) => a.type === "REQUEST_SAVE_PLAN");
  const rows = p.projection.slice(page * 12, (page + 1) * 12);
  return (
    <Card className="goal-planner">
      <div className="row between">
        <h2>Tu ruta para lograrlo</h2>
        <Badge tone={p.feasible ? "green" : "red"}>
          {p.feasible ? "Alcanzable con estos datos" : "Necesita ajustes"}
        </Badge>
      </div>
      <p className="muted">
        Plan calculado con tu presupuesto y perfil al{" "}
        {new Date(p.plannedAt).toLocaleDateString("es-MX")}. Puedes modificar
        los datos y recalcular.
      </p>
      {p.input.details && (
        <p>
          <strong>Tus prioridades:</strong> {p.input.details}
        </p>
      )}
      <div className="plan-metrics">
        {[
          ["Aportación necesaria al mes", money(p.requiredMonthly)],
          ["Margen antes de aportar", money(p.available)],
          ["Margen después de aportar", money(p.monthlyRemainder)],
          ["Faltante al plazo elegido", money(p.shortfall)],
        ].map(([label, value]) => (
          <div key={label}>
            <span className="muted">{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <p>
        {p.monthsNeeded === null
          ? "Sin aportación mensual no hay una fecha estimada para completar el ahorro."
          : p.monthsNeeded === 0
            ? "El ahorro asignado ya cubre tu objetivo."
            : `Con tu aportación, completarías el ahorro en ${p.monthsNeeded} meses${p.affordable ? "." : ", pero esa aportación no cabe en tu presupuesto actual."}`}
      </p>
      <h3>Qué puedes hacer</h3>
      <p className="muted">
        {p.source === "ai"
          ? "Acciones personalizadas con IA; proyección calculada a partir de tus datos."
          : "Guía práctica por tipo de objetivo; proyección calculada a partir de tus datos."}
      </p>
      <ol className="plan-steps">
        {p.steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
      <h3>Proyección de ahorro</h3>
      <p className="muted">
        Aportaciones constantes, sin rendimientos ni inflación. No es historial
        real. Línea gris: presupuesto objetivo.
      </p>
      <div
        className="plan-chart"
        aria-label="Proyección mensual de ahorro; los valores están disponibles en la tabla siguiente."
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={p.projection}
            margin={{ top: 10, right: 20, left: 15, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickFormatter={(v) => `Mes ${v}`}
              minTickGap={35}
            />
            <YAxis tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} />
            <Tooltip formatter={(v) => money(Number(v))} />
            <Line
              isAnimationActive={false}
              name="Ahorro proyectado"
              dataKey="amount"
              stroke="#eb0029"
              strokeWidth={3}
              dot={false}
            />
            <Line
              isAnimationActive={false}
              name="Objetivo"
              dataKey="target"
              stroke="#92949b"
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="plan-table">
        <table>
          <caption>Detalle mensual de la proyección</caption>
          <thead>
            <tr>
              <th scope="col">Mes</th>
              <th scope="col">Ahorro acumulado</th>
              <th scope="col">Por completar</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.month}>
                <th scope="row">{r.month}</th>
                <td>{money(r.amount)}</td>
                <td>{money(Math.max(0, r.target - r.amount))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="row between">
        <Button
          variant="ghost"
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
        >
          Anterior
        </Button>
        <span>
          Página {page + 1} de {Math.ceil(p.projection.length / 12)}
        </span>
        <Button
          variant="ghost"
          disabled={(page + 1) * 12 >= p.projection.length}
          onClick={() => setPage(page + 1)}
        >
          Siguiente
        </Button>
      </div>
      {action ? (
        <Button
          loading={busy}
          onClick={() => interact(component.id, action.type)}
        >
          Guardar este plan como meta
        </Button>
      ) : (
        <p className="muted">
          Meta guardada. Puedes seguir su avance en Mis metas.
        </p>
      )}
    </Card>
  );
}
