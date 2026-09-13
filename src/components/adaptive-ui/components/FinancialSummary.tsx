import { financialSchema, type Props } from "../schemas";
import { Card, Badge } from "../../common/ui";
import { FinancialSummary } from "../../common/FinancialSummary";
import { Invalid } from "../Invalid";
export function Financial({ component }: Props) {
  const result = financialSchema.safeParse(component.props);
  return result.success ? (
    <Card>
      <div className="section-title">
        <h3>Tu punto de partida</h3>
        <Badge>Mi vida financiera</Badge>
      </div>
      <FinancialSummary data={result.data} compact />
      {result.data.creditScore != null && (
        <p className="muted">
          Score de crédito registrado:{" "}
          <strong>{result.data.creditScore}</strong>
        </p>
      )}
    </Card>
  ) : (
    <Invalid />
  );
}
