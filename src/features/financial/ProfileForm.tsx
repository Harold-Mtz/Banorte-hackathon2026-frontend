import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { api, type ProfileInput } from "../../api";
import { Button, Field, ErrorState } from "../../components/common/ui";
import { useAuth } from "../auth/AuthContext";
import { useRefresh } from "../../hooks/use-data";
const amount = z
  .number({ error: "Escribe un monto válido." })
  .min(0, "El monto no puede ser negativo.")
  .max(999999999999, "El monto excede el límite.");
const schema = z.object({
  monthlyIncome: amount,
  monthlyExpenses: amount,
  currentSavings: amount,
  currentDebt: amount,
  creditScore: z
    .number()
    .int()
    .min(300, "El mínimo es 300.")
    .max(850, "El máximo es 850.")
    .optional(),
});
const helpers = {
  monthlyIncome: "Lo que normalmente recibes cada mes.",
  monthlyExpenses:
    "Un aproximado de tus gastos habituales. Incluye pagos de deuda si forman parte de ellos.",
  currentSavings: "Dinero que tienes disponible como ahorro.",
  currentDebt: "Saldo total aproximado de tus deudas; no es un pago mensual.",
} as const;
const labels = {
  monthlyIncome: "Ingreso mensual",
  monthlyExpenses: "Gastos mensuales",
  currentSavings: "Ahorros actuales",
  currentDebt: "Deuda actual",
} as const;
export function ProfileForm({
  initial,
  onSaved,
}: {
  initial?: ProfileInput;
  onSaved?: () => void;
}) {
  const { session } = useAuth();
  const refresh = useRefresh();
  const form = useForm<ProfileInput>({
    resolver: zodResolver(schema),
    defaultValues: initial,
  });
  const mutation = useMutation({
    mutationFn: (data: ProfileInput) =>
      api.updateProfile(session!.user.id, data),
    onSuccess: (updated) => {
      form.reset({
        monthlyIncome: updated.monthlyIncome,
        monthlyExpenses: updated.monthlyExpenses,
        currentSavings: updated.currentSavings,
        currentDebt: updated.currentDebt,
        creditScore: updated.creditScore ?? undefined,
      });
      void refresh(["profile"]);
      onSaved?.();
    },
  });
  return (
    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
      <div className="form-grid">
        {Object.entries(labels).map(([key, label]) => (
          <Field
            key={key}
            label={label}
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            helper={helpers[key as keyof typeof helpers]}
            disabled={mutation.isPending}
            {...form.register(key as keyof typeof labels, {
              valueAsNumber: true,
            })}
            error={form.formState.errors[key as keyof typeof labels]?.message}
          />
        ))}
        <Field
          label="Score de crédito (opcional)"
          type="number"
          min="300"
          max="850"
          helper="Si lo conoces, ingresa un valor entre 300 y 850."
          disabled={mutation.isPending}
          {...form.register("creditScore", {
            setValueAs: (v: string) => (v === "" ? undefined : Number(v)),
          })}
          error={form.formState.errors.creditScore?.message}
        />
      </div>
      {mutation.isError && <ErrorState error={mutation.error} />}
      <div className="form-actions">
        {mutation.isSuccess && (
          <span role="status" className="success-text">
            Tu información está actualizada.
          </span>
        )}
        <Button type="submit" loading={mutation.isPending}>
          {onSaved ? "Guardar y continuar" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
