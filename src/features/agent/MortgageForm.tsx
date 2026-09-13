import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { MortgageInput } from "../../api";
import { Field, Button, EmptyState } from "../../components/common/ui";
import { formatCurrencyMXN as money } from "../../utils/format";
export interface ProductOption {
  id: string;
  name: string;
  interestRate: number | null;
  cat?: number | null;
  minimumAmount?: number | null;
  maximumAmount?: number | null;
  minimumTermMonths?: number | null;
  maximumTermMonths?: number | null;
  description?: string | null;
}
const schema = z
  .object({
    financialProductId: z.string().min(1, "Selecciona un producto."),
    propertyValue: z.number().positive("Ingresa el valor de la propiedad."),
    downPayment: z.number().nonnegative("Ingresa un enganche válido."),
    termMonths: z.number().int().positive("Ingresa el plazo en meses."),
  })
  .refine((v) => v.downPayment < v.propertyValue, {
    path: ["downPayment"],
    message: "El enganche debe ser menor al valor de la propiedad.",
  });
export function MortgageForm({
  products,
  initial,
  onSubmit,
  busy,
  label = "Actualizar simulación",
}: {
  products: ProductOption[];
  initial?: Partial<MortgageInput>;
  onSubmit: (data: MortgageInput) => void;
  busy?: boolean;
  label?: string;
}) {
  const form = useForm<MortgageInput>({
    resolver: zodResolver(schema),
    defaultValues: initial,
  });
  const [productId, value, down] = useWatch({
    control: form.control,
    name: ["financialProductId", "propertyValue", "downPayment"],
  });
  const product = products.find((p) => p.id === productId);
  if (!products.length)
    return (
      <EmptyState
        title="No hay productos hipotecarios disponibles"
        description="Cuando haya productos activos podrás simular tu financiamiento."
      />
    );
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="field">
        <label htmlFor="mortgage-product">Producto hipotecario</label>
        <select
          id="mortgage-product"
          disabled={busy}
          {...form.register("financialProductId")}
          aria-invalid={!!form.formState.errors.financialProductId}
        >
          <option value="">Selecciona un producto</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {form.formState.errors.financialProductId && (
          <small className="field-error">
            {form.formState.errors.financialProductId.message}
          </small>
        )}
      </div>
      {product && (
        <div className="product-limits">
          <span>
            Tasa anual:{" "}
            {product.interestRate != null
              ? `${product.interestRate}%`
              : "No disponible"}
          </span>
          <span>
            Crédito:{" "}
            {product.minimumAmount != null
              ? money(product.minimumAmount)
              : "Sin mínimo"}{" "}
            a{" "}
            {product.maximumAmount != null
              ? money(product.maximumAmount)
              : "sin máximo"}
          </span>
          <span>
            Plazo: {product.minimumTermMonths ?? "—"} a{" "}
            {product.maximumTermMonths ?? "—"} meses
          </span>
        </div>
      )}
      <div className="form-grid">
        <Field
          label="Valor de la propiedad · MXN"
          type="number"
          min="0.01"
          step="0.01"
          disabled={busy}
          {...form.register("propertyValue", { valueAsNumber: true })}
          error={form.formState.errors.propertyValue?.message}
        />
        <Field
          label="Enganche · MXN"
          type="number"
          min="0"
          step="0.01"
          disabled={busy}
          {...form.register("downPayment", { valueAsNumber: true })}
          error={form.formState.errors.downPayment?.message}
        />
      </div>
      {Number(value) > 0 && (
        <div className="field">
          <label htmlFor="down-payment-range">Ajustar enganche</label>
          <input
            id="down-payment-range"
            type="range"
            min="0"
            max={Math.max(0, Number(value) - 1)}
            step="1"
            value={Number.isFinite(down) ? down : 0}
            disabled={busy}
            onChange={(e) =>
              form.setValue("downPayment", Number(e.target.value), {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
          />
        </div>
      )}
      <Field
        label="Plazo en meses"
        type="number"
        min={product?.minimumTermMonths ?? 1}
        max={product?.maximumTermMonths ?? undefined}
        step="1"
        disabled={busy}
        {...form.register("termMonths", { valueAsNumber: true })}
        error={form.formState.errors.termMonths?.message}
      />
      <Button type="submit" loading={busy}>
        {label}
      </Button>
      <p className="disclaimer">
        Estimación informativa, sujeta a evaluación y condiciones del producto.
        No representa una aprobación de crédito.
      </p>
    </form>
  );
}
