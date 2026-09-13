import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field, Button } from "../../components/common/ui";
import type { GoalInput } from "../../api";
const schema = z.object({
  name: z.string().trim().min(1, "Dale un nombre a tu meta.").max(150),
  targetAmount: z.number().positive("Ingresa un objetivo mayor a cero."),
  currentAmount: z.number().nonnegative("Ingresa un monto válido.").optional(),
  monthlyContribution: z
    .number()
    .positive("La aportación debe ser mayor a cero.")
    .optional(),
  targetDate: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v),
      "Elige una fecha válida.",
    ),
});
export function GoalForm({
  initial,
  onSubmit,
  busy,
  label = "Crear meta",
}: {
  initial?: Partial<GoalInput>;
  onSubmit: (data: GoalInput) => void;
  busy?: boolean;
  label?: string;
}) {
  const form = useForm<GoalInput>({
    resolver: zodResolver(schema),
    defaultValues: initial,
  });
  return (
    <form
      onSubmit={form.handleSubmit((data) =>
        onSubmit({ ...data, targetDate: data.targetDate || undefined }),
      )}
    >
      <Field
        label="Nombre de tu meta"
        placeholder="Ej. El enganche de mi casa"
        disabled={busy}
        {...form.register("name")}
        error={form.formState.errors.name?.message}
      />
      <div className="form-grid">
        <Field
          label="Monto objetivo · MXN"
          type="number"
          min="0.01"
          step="0.01"
          disabled={busy}
          {...form.register("targetAmount", { valueAsNumber: true })}
          error={form.formState.errors.targetAmount?.message}
        />
        <Field
          label="¿Cuánto llevas ahorrado? · MXN"
          type="number"
          min="0"
          step="0.01"
          disabled={busy}
          {...form.register("currentAmount", {
            setValueAs: (v: string) => (v === "" ? undefined : Number(v)),
          })}
          error={form.formState.errors.currentAmount?.message}
        />
        <Field
          label="Aportación mensual · MXN (opcional)"
          type="number"
          min="0.01"
          step="0.01"
          disabled={busy}
          {...form.register("monthlyContribution", {
            setValueAs: (v: string) => (v === "" ? undefined : Number(v)),
          })}
          error={form.formState.errors.monthlyContribution?.message}
        />
        <Field
          label="Fecha objetivo (opcional)"
          type="date"
          disabled={busy}
          {...form.register("targetDate")}
          error={form.formState.errors.targetDate?.message}
        />
      </div>
      <Button type="submit" loading={busy}>
        {label}
      </Button>
    </form>
  );
}
