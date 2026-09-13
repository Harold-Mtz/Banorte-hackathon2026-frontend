import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  House,
  Car,
  Heart,
  Baby,
  GraduationCap,
  Plane,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { api } from "../api";
import { LIFE_EVENT_TYPES } from "../models";
import { useData, useRefresh } from "../hooks/use-data";
import { useAgent } from "../features/agent/AgentContext";
import {
  PageHeader,
  Card,
  Button,
  Field,
  Skeleton,
  ErrorState,
  EmptyState,
  Badge,
} from "../components/common/ui";
import { lifeLabels, statusLabels, formatDate } from "../utils/format";
const icons = {
  FIRST_HOME: House,
  CAR_PURCHASE: Car,
  MARRIAGE: Heart,
  CHILD: Baby,
  EDUCATION: GraduationCap,
  TRAVEL: Plane,
};
const schema = z.object({
  title: z.string().trim().min(1, "Dale un nombre a tu experiencia.").max(150),
  type: z.enum(LIFE_EVENT_TYPES),
});
export function LifeEventsPage() {
  const { id, events } = useData();
  const refresh = useRefresh();
  const { send, busy } = useAgent();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { type: "FIRST_HOME" },
  });
  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof schema>) => api.createEvent(id, data),
    onSuccess: () => {
      void refresh(["events"]);
      setCreating(false);
      form.reset();
    },
  });
  return (
    <>
      <PageHeader
        eyebrow="LA VIDA NO SE QUEDA QUIETA"
        title="Tus próximos capítulos"
        subtitle="Un espacio para los momentos que te importan."
        action={
          <Button onClick={() => setCreating(!creating)}>
            <Plus size={17} />
            {creating ? "Cerrar" : "Nueva experiencia"}
          </Button>
        }
      />
      {creating && (
        <Card className="creation-card">
          <h2>Dale forma a tu próximo capítulo</h2>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
            <Field
              label="Nombre de tu experiencia"
              {...form.register("title")}
              error={form.formState.errors.title?.message}
              disabled={mutation.isPending}
            />
            <div className="field">
              <label htmlFor="event-type">¿Qué quieres lograr?</label>
              <select
                id="event-type"
                {...form.register("type")}
                disabled={mutation.isPending}
              >
                {Object.entries(lifeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            {mutation.isError && <ErrorState error={mutation.error} />}
            <Button type="submit" loading={mutation.isPending}>
              Guardar experiencia
            </Button>
          </form>
        </Card>
      )}
      {events.isPending ? (
        <Skeleton />
      ) : events.isError ? (
        <ErrorState error={events.error} retry={() => void events.refetch()} />
      ) : events.data.length ? (
        <div className="cards-grid">
          {events.data.map((e) => {
            const Icon = icons[e.type] ?? House;
            return (
              <Card key={e.id} className="event-card">
                <div className="row between">
                  <span className="icon-tile">
                    <Icon size={24} />
                  </span>
                  <Badge tone={e.status === "ACTIVE" ? "green" : "neutral"}>
                    {statusLabels[e.status]}
                  </Badge>
                </div>
                <h3>{e.title}</h3>
                <p className="muted">{lifeLabels[e.type]}</p>
                <small className="muted">Desde {formatDate(e.createdAt)}</small>
                {
                  <Button
                    variant="secondary"
                    disabled={busy}
                    onClick={() => {
                      send(`${lifeLabels[e.type]}: ${e.title}`);
                      navigate("/app/experience");
                    }}
                  >
                    Explorar mi plan <ArrowUpRight size={16} />
                  </Button>
                }
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <EmptyState
            title="Cuéntanos qué quieres lograr."
            description="Tu primera casa es solo el comienzo."
            action={
              <Button onClick={() => navigate("/app/experience")}>
                Explorar un objetivo
              </Button>
            }
          />
        </Card>
      )}
    </>
  );
}
