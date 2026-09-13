import { FinancialJourney } from "../../../features/financial/FinancialJourney";
import { simulationSchema, type Props } from "../schemas";
import { Card } from "../../common/ui";
import { useAgent } from "../../../features/agent/AgentContext";
import { MortgageForm } from "../../../features/agent/MortgageForm";
import { formatCurrencyMXN as money } from "../../../utils/format";
import { Invalid } from "../Invalid";
export function Simulator({ component }: Props) {
  const { interact, busy, response } = useAgent();
  const result = simulationSchema.safeParse(component.props);
  if (!result.success) return <Invalid />;
  const data = result.data;
  const action = component.actions?.find(
    (a) => a.type === "UPDATE_DOWN_PAYMENT",
  );
  return (
    <Card>
      <h3>Haz espacio para tu primera casa</h3>
      <p className="muted">
        Explora un escenario con las condiciones del producto que elijas.
      </p>
      <MortgageForm
        key={`${component.id}-${data.monthlyPayment ?? "new"}`}
        products={data.products}
        initial={data}
        busy={busy || !action}
        onSubmit={(values) =>
          action &&
          interact(component.id, action.type, { ...action.payload, ...values })
        }
        label={action?.label}
      />
      {data.monthlyPayment != null && (
        <div className="simulation-result">
          <span>Tu pago mensual estimado</span>
          <strong>{money(data.monthlyPayment)}</strong>
          <dl>
            {data.products.find((p) => p.id === data.financialProductId)?.cat !=
              null && (
              <div>
                <dt>CAT del producto</dt>
                <dd>
                  {
                    data.products.find((p) => p.id === data.financialProductId)
                      ?.cat
                  }
                  %
                </dd>
              </div>
            )}
            {(
              [
                ["loanAmount", "Monto del crédito"],
                ["annualInterestRate", "Tasa anual"],
                ["totalInterest", "Intereses totales"],
                ["totalPayment", "Pago total"],
              ] as const
            ).map(
              ([key, label]) =>
                data[key] != null && (
                  <div key={key}>
                    <dt>{label}</dt>
                    <dd>
                      {key === "annualInterestRate"
                        ? `${data[key]}%`
                        : money(data[key])}
                    </dd>
                  </div>
                ),
            )}
          </dl>
        </div>
      )}
      {data.monthlyPayment != null &&
        data.propertyValue != null &&
        data.downPayment != null && (
          <FinancialJourney
            propertyValue={data.propertyValue}
            downPayment={data.downPayment}
            savingsComponentId={
              response?.ui.components.find(
                (c) => c.type === "savings-goal-form",
              )?.id
            }
          />
        )}
    </Card>
  );
}
