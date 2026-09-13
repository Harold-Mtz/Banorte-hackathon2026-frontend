import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  House,
  Car,
  GraduationCap,
  Plane,
  Heart,
  Baby,
} from "lucide-react";
import { Button } from "../../components/common/ui";
import { useAgent } from "./AgentContext";
const schema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Cuéntanos qué quieres lograr.")
    .max(2000, "Usa hasta 2,000 caracteres."),
});
const suggestions = [
  {
    label: "Mi primera casa",
    text: "Quiero comprar mi primera casa",
    icon: House,
  },
  { label: "Un auto", text: "Quiero comprar un auto", icon: Car },
  { label: "Estudiar", text: "Quiero estudiar", icon: GraduationCap },
  { label: "Viajar", text: "Quiero viajar", icon: Plane },
  { label: "Casarme", text: "Quiero planear mi boda", icon: Heart },
  {
    label: "Prepararme para un hijo",
    text: "Quiero prepararme para un hijo",
    icon: Baby,
  },
];
export function GoalCommand() {
  const { send, busy } = useAgent();
  const navigate = useNavigate();
  const form = useForm<{ message: string }>({ resolver: zodResolver(schema) });
  function start(message: string) {
    send(message);
    navigate("/app/experience");
  }
  return (
    <section id="life-goals" className="goal-command">
      <div className="command-decoration" aria-hidden="true">
        <House size={145} strokeWidth={0.8} />
      </div>
      <span className="eyebrow">
        <Sparkles size={14} /> DISEÑADO ALREDEDOR DE TI
      </span>
      <h2>¿Qué quieres lograr?</h2>
      <p>
        Una casa, un nuevo comienzo. Cuéntanos tu plan y demos el siguiente
        paso.
      </p>
      <form onSubmit={form.handleSubmit(({ message }) => start(message))}>
        <div className="command-input">
          <label htmlFor="goal-message" className="sr-only">
            Tu próximo objetivo
          </label>
          <Sparkles size={20} />
          <input
            id="goal-message"
            placeholder="Ej. Quiero comprar mi primera casa"
            disabled={busy}
            {...form.register("message")}
            aria-invalid={!!form.formState.errors.message}
          />
          <Button type="submit" loading={busy} aria-label="Comenzar">
            <span>Comenzar</span>
            <ArrowRight size={18} />
          </Button>
        </div>
        {form.formState.errors.message && (
          <small className="field-error">
            {form.formState.errors.message.message}
          </small>
        )}
      </form>
      <div className="suggestions">
        {suggestions.map(({ label, text, icon: Icon }) => (
          <button key={label} onClick={() => start(text)} disabled={busy}>
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
