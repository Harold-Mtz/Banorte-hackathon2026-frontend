import { z } from "zod";
import { productSchema, type Props } from "../schemas";
import { Card, Badge } from "../../common/ui";
import { formatCurrencyMXN as money } from "../../../utils/format";
import { Invalid } from "../Invalid";
export function Products({ component }: Props) {
  const result = z
    .object({
      products: z.array(productSchema),
      selectedProductId: z.string().optional(),
    })
    .safeParse(component.props);
  if (!result.success) return <Invalid />;
  return (
    <Card className="wide">
      <div className="section-title">
        <h3>Opciones para tu próximo hogar</h3>
        <Badge>Productos disponibles</Badge>
      </div>
      {!result.data.products.length ? (
        <p className="muted">
          Por ahora no hay productos hipotecarios activos.
        </p>
      ) : (
        <div className="product-grid">
          {result.data.products.map((p) => (
            <div
              className={`product-card ${p.id === result.data.selectedProductId ? "selected" : ""}`}
              key={p.id}
            >
              {p.id === result.data.selectedProductId && (
                <Badge tone="red">Seleccionado</Badge>
              )}
              <h4>{p.name}</h4>
              <p className="muted">{p.description}</p>
              <strong className="product-rate">
                {p.interestRate != null ? `${p.interestRate}%` : "—"}
                <small> tasa anual</small>
              </strong>
              <dl>
                <div>
                  <dt>CAT</dt>
                  <dd>{p.cat != null ? `${p.cat}%` : "Sin información"}</dd>
                </div>
                <div>
                  <dt>Monto mínimo</dt>
                  <dd>
                    {p.minimumAmount != null
                      ? money(p.minimumAmount)
                      : "Sin definir"}
                  </dd>
                </div>
                <div>
                  <dt>Monto máximo</dt>
                  <dd>
                    {p.maximumAmount != null
                      ? money(p.maximumAmount)
                      : "Sin definir"}
                  </dd>
                </div>
                <div>
                  <dt>Plazo</dt>
                  <dd>
                    {p.minimumTermMonths ?? "—"} – {p.maximumTermMonths ?? "—"}{" "}
                    meses
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
