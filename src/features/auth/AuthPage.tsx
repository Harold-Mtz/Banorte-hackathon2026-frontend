import { Brand } from "../../components/common/Brand";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, ShieldCheck, House, Sparkles } from "lucide-react";
import { api } from "../../api";
import { useAuth } from "./AuthContext";
import { Button, Field, ErrorState } from "../../components/common/ui";
const loginSchema = z.object({
  email: z.email("Escribe un correo válido."),
  password: z.string().min(1, "Escribe tu contraseña."),
});
const registerSchema = loginSchema
  .extend({
    name: z.string().trim().min(1, "Escribe tu nombre.").max(120),
    password: z
      .string()
      .min(8, "Usa al menos 8 caracteres.")
      .refine(
        (v) => new TextEncoder().encode(v).length <= 72,
        "Usa una contraseña de hasta 72 bytes.",
      ),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden.",
  });
type Fields = {
  email: string;
  password: string;
  name?: string;
  confirmPassword?: string;
};
export function AuthPage({ registering = false }: { registering?: boolean }) {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const form = useForm<Fields>({
    resolver: zodResolver(registering ? registerSchema : loginSchema),
  });
  const mutation = useMutation({
    mutationFn: async (values: Fields) =>
      registering
        ? api.register({
            name: values.name!,
            email: values.email,
            password: values.password,
          })
        : api.login({ email: values.email, password: values.password }),
    onSuccess: (session) => {
      signIn(session);
      navigate(registering ? "/app/onboarding" : "/app", { replace: true });
    },
  });
  return (
    <div className="auth-layout">
      <aside className="auth-story">
        <Link to="/" className="brand">
          <Brand light />
        </Link>
        <div className="auth-story-main">
          <span className="light-pill">
            <Sparkles size={14} /> Una nueva forma de avanzar
          </span>
          <h1>
            Tu vida cambia.
            <br />
            Tu experiencia
            <br />
            <em>financiera también.</em>
          </h1>
          <p>
            Convierte lo que sueñas en un plan. Tu próxima etapa empieza
            contigo.
          </p>
          <div className="house-art" aria-hidden="true">
            <div className="art-orbit" />
            <House size={100} strokeWidth={1} />
            <span className="art-label">
              <span className="dot" /> Mi primera casa
            </span>
          </div>
        </div>
        <small>Banorte Borias · Proyecto de hackathon</small>
      </aside>
      <main className="auth-main">
        <div className="auth-form">
          <span className="eyebrow">TU SIGUIENTE CAPÍTULO</span>
          <h2>
            {registering
              ? "Comienza algo grande."
              : "Qué bueno verte de nuevo."}
          </h2>
          <p className="muted">
            {registering
              ? "Crea tu cuenta y dale un lugar a tus metas."
              : "Inicia sesión para continuar con tus planes."}
          </p>
          {registering && (
            <div className="steps">
              <b>1 · Tu cuenta</b>
              <span>2 · Tus finanzas</span>
              <span>3 · Tu panorama</span>
            </div>
          )}
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))}>
            {registering && (
              <Field
                label="Nombre completo"
                autoComplete="name"
                {...form.register("name")}
                error={form.formState.errors.name?.message}
                disabled={mutation.isPending}
              />
            )}
            <Field
              label="Correo electrónico"
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              {...form.register("email")}
              error={form.formState.errors.email?.message}
              disabled={mutation.isPending}
            />
            <Field
              label="Contraseña"
              type="password"
              autoComplete={registering ? "new-password" : "current-password"}
              helper={registering ? "Al menos 8 caracteres." : undefined}
              {...form.register("password")}
              error={form.formState.errors.password?.message}
              disabled={mutation.isPending}
            />
            {registering && (
              <Field
                label="Confirma tu contraseña"
                type="password"
                autoComplete="new-password"
                {...form.register("confirmPassword")}
                error={form.formState.errors.confirmPassword?.message}
                disabled={mutation.isPending}
              />
            )}
            {mutation.isError && <ErrorState error={mutation.error} />}
            <Button type="submit" loading={mutation.isPending} className="full">
              {registering ? "Crear mi cuenta" : "Iniciar sesión"}
              <ArrowRight size={18} />
            </Button>
          </form>
          <p className="auth-switch">
            {registering ? "¿Ya tienes cuenta?" : "¿Es tu primera vez?"}{" "}
            <Link to={registering ? "/login" : "/register"}>
              {registering ? "Inicia sesión" : "Crea tu cuenta"}
            </Link>
          </p>
          <div className="privacy-note">
            <ShieldCheck size={18} />
            <span>Tus planes y tu información, en tu espacio personal.</span>
          </div>
        </div>
      </main>
    </div>
  );
}
