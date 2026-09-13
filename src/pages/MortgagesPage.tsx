import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Calculator } from "lucide-react";
import { api, type MortgageInput } from "../api";
import { useData, useRefresh } from "../hooks/use-data";
import { MortgageForm } from "../features/agent/MortgageForm";
import { MortgageChart } from "../components/charts/FinancialChart";
import {
  Card,
  PageHeader,
  Button,
  ErrorState,
  Skeleton,
  EmptyState,
  Badge,
} from "../components/common/ui";
import { formatCurrencyMXN as money, formatDate } from "../utils/format";
export function MortgagesPage() {
  const { id, mortgages } = useData();
  const refresh = useRefresh();
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const products = useQuery({ queryKey: ["products"], queryFn: api.products });
  const mutation = useMutation({
    mutationFn: (data: MortgageInput) => api.simulate(id, data),
    onSuccess: () => {
      void refresh(["mortgages"]);
      setCreating(false);
    },
  });
  const comparison =
    mortgages.data?.filter((s) => selected.includes(s.id)) ?? [];
  return (
    <>
      <PageHeader
        eyebrow="EXPLORA TUS POSIBILIDADES"
        title="Tu próximo hogar, en números"
        subtitle="Simula escenarios y compara opciones con productos reales."
        action={
          <Button onClick={() => setCreating(!creating)}>
            <Plus size={17} />
            {creating ? "Cerrar simulador" : "Nueva simulación"}
          </Button>
        }
      />
      {creating && (
        <Card className="creation-card">
          <h2>Construye tu escenario</h2>
          {products.isPending ? (
            <Skeleton cards={1} />
          ) : products.isError ? (
            <ErrorState
              error={products.error}
              retry={() => void products.refetch()}
            />
          ) : (
            <MortgageForm
              products={products.data.filter((p) => p.isActive)}
              onSubmit={(data) => mutation.mutate(data)}
              busy={mutation.isPending}
              label="Simular y guardar"
            />
          )}
          {mutation.isError && <ErrorState error={mutation.error} />}
        </Card>
      )}
      {mutation.isSuccess && (
        <p className="success-text" role="status">
          Tu simulación se guardó en el historial.
        </p>
      )}
      {comparison.length >= 2 && (
        <Card className="comparison-card">
          <h2>Compara tus escenarios</h2>
          <p className="muted">
            Pago mensual e importes acumulados del crédito, en MXN.
          </p>
          <MortgageChart data={comparison} />
        </Card>
      )}
      <div className="section-title">
        <h2>Historial de simulaciones</h2>
        <Badge>{selected.length} seleccionadas</Badge>
      </div>
      <p className="muted">Selecciona dos o más escenarios para compararlos.</p>
      {mortgages.isPending ? (
        <Skeleton />
      ) : mortgages.isError ? (
        <ErrorState
          error={mortgages.error}
          retry={() => void mortgages.refetch()}
        />
      ) : mortgages.data.length ? (
        <div className="cards-grid">
          {mortgages.data.map((s) => (
            <Card
              key={s.id}
              className={
                selected.includes(s.id)
                  ? "simulation-card selected"
                  : "simulation-card"
              }
            >
              <div className="row between">
                <span className="icon-tile">
                  <Calculator size={22} />
                </span>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selected.includes(s.id)}
                    onChange={(e) =>
                      setSelected(
                        e.target.checked
                          ? [...selected, s.id]
                          : selected.filter((id) => id !== s.id),
                      )
                    }
                  />{" "}
                  Comparar
                </label>
              </div>
              <h3>
                {products.data?.find((p) => p.id === s.financialProductId)
                  ?.name ?? "Simulación hipotecaria"}
              </h3>
              <p className="muted">
                {formatDate(s.createdAt)} · {s.termMonths} meses
              </p>
              <span className="muted">Pago mensual</span>
              <strong className="big-amount">{money(s.monthlyPayment)}</strong>
              <dl>
                {(
                  [
                    ["propertyValue", "Valor de la propiedad"],
                    ["downPayment", "Enganche"],
                    ["loanAmount", "Monto del crédito"],
                    ["totalInterest", "Intereses totales"],
                    ["totalPayment", "Pago total"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key}>
                    <dt>{label}</dt>
                    <dd>{money(s[key])}</dd>
                  </div>
                ))}
                <div>
                  <dt>Tasa anual</dt>
                  <dd>{s.annualInterestRate}%</dd>
                </div>
              </dl>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            title="Tu casa empieza con un plan"
            description="Haz tu primera simulación para conocer un escenario de financiamiento."
            action={
              <Button onClick={() => setCreating(true)}>
                Crear simulación
              </Button>
            }
          />
        </Card>
      )}
    </>
  );
}
