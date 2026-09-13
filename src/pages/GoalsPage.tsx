import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { api, type GoalInput } from "../api";
import { useData, useRefresh } from "../hooks/use-data";
import {
  PageHeader,
  Card,
  Button,
  Field,
  ErrorState,
  Skeleton,
  EmptyState,
} from "../components/common/ui";
import { GoalForm } from "../features/goals/GoalForm";
import { GoalCard } from "../features/goals/GoalCard";
import type { SavingsGoal } from "../models";
const schema = z.object({
  currentAmount: z.number().nonnegative("El monto no puede ser negativo."),
});
function UpdateAmount({ goal }: { goal: SavingsGoal }) {
  const [editing, setEditing] = useState(false);
  const refresh = useRefresh();
  const form = useForm<{ currentAmount: number }>({
    resolver: zodResolver(schema),
    defaultValues: { currentAmount: goal.currentAmount },
  });
  const mutation = useMutation({
    mutationFn: ({ currentAmount }: { currentAmount: number }) =>
      api.updateGoal(goal.id, currentAmount),
    onSuccess: () => {
      void refresh(["goals"]);
      setEditing(false);
    },
  });
  return editing ? (
    <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))}>
      <Field
        label="Ahorro acumulado · MXN"
        type="number"
        min="0"
        step="0.01"
        {...form.register("currentAmount", { valueAsNumber: true })}
        error={form.formState.errors.currentAmount?.message}
        disabled={mutation.isPending}
      />
      {mutation.isError && <ErrorState error={mutation.error} />}
      <div className="row">
        <Button loading={mutation.isPending} type="submit">
          Guardar
        </Button>
        <Button
          variant="ghost"
          type="button"
          disabled={mutation.isPending}
          onClick={() => setEditing(false)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  ) : (
    <Button
      variant="secondary"
      className="full"
      onClick={() => setEditing(true)}
    >
      Actualizar mi ahorro
    </Button>
  );
}
export function GoalsPage() {
  const { id, goals } = useData();
  const refresh = useRefresh();
  const [filter, setFilter] = useState("ACTIVE");
  const [search] = useSearchParams();
  const [creating, setCreating] = useState(search.get("new") === "1");
  const mutation = useMutation({
    mutationFn: (data: GoalInput) => api.createGoal(id, data),
    onSuccess: () => {
      void refresh(["goals"]);
      setCreating(false);
      setFilter("ACTIVE");
    },
  });
  return (
    <>
      <PageHeader
        eyebrow="UN PASO MÁS CERCA"
        title="Metas de ahorro"
        subtitle="Tus ideas se vuelven posibles, una aportación a la vez."
        action={
          <Button
            onClick={() => {
              setCreating(!creating);
              mutation.reset();
            }}
          >
            {creating ? <X size={17} /> : <Plus size={17} />}{" "}
            {creating ? "Cerrar" : "Nueva meta"}
          </Button>
        }
      />
      {creating && (
        <Card className="creation-card">
          <h2>¿Para qué quieres ahorrar?</h2>
          <p className="muted">
            Define tu objetivo y empieza a medir tu avance.
          </p>
          <GoalForm
            onSubmit={(data) => mutation.mutate(data)}
            busy={mutation.isPending}
          />
          {mutation.isError && <ErrorState error={mutation.error} />}
        </Card>
      )}
      {mutation.isSuccess && (
        <p role="status" className="success-text">
          Tu meta se creó correctamente.
        </p>
      )}
      <div className="tabs" role="group" aria-label="Filtrar metas">
        {[
          ["ACTIVE", "Activas"],
          ["COMPLETED", "Completadas"],
          ["CANCELLED", "Canceladas"],
        ].map(([value, label]) => (
          <button
            key={value}
            aria-pressed={filter === value}
            className={filter === value ? "active" : ""}
            onClick={() => setFilter(value)}
          >
            {label}
            <span>
              {goals.data?.filter((g) => g.status === value).length ?? 0}
            </span>
          </button>
        ))}
      </div>
      {goals.isPending ? (
        <Skeleton />
      ) : goals.isError ? (
        <ErrorState error={goals.error} retry={() => void goals.refetch()} />
      ) : goals.data.filter((g) => g.status === filter).length ? (
        <div className="cards-grid">
          {goals.data
            .filter((g) => g.status === filter)
            .sort(
              (a, b) =>
                Number(b.id === search.get("goal")) -
                Number(a.id === search.get("goal")),
            )
            .map((goal) => (
              <GoalCard key={goal.id} goal={goal}>
                {goal.status === "ACTIVE" && <UpdateAmount goal={goal} />}
              </GoalCard>
            ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            title={
              filter === "ACTIVE"
                ? "Aún no tienes metas de ahorro."
                : "No hay metas en este estado."
            }
            description="Cada gran plan empieza con un primer paso."
            action={
              <Button variant="secondary" onClick={() => setCreating(true)}>
                Crear mi primera meta
              </Button>
            }
          />
        </Card>
      )}
    </>
  );
}
