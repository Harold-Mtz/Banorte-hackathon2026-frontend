import {
  useId,
  type ReactNode,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
} from "react";
import { ArrowRight, AlertCircle, LoaderCircle, Target } from "lucide-react";
export function Button({
  children,
  loading,
  className = "",
  variant = "primary",
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <button
      className={`button ${variant} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && <LoaderCircle className="spin" size={17} />} {children}
    </button>
  );
}
export function Field({
  label,
  error,
  helper,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  helper?: string;
}) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <div className="field">
      <label htmlFor={fieldId}>{label}</label>
      <input
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={error || helper ? `${fieldId}-help` : undefined}
        {...props}
      />
      {(error || helper) && (
        <small
          id={`${fieldId}-help`}
          className={error ? "field-error" : "muted"}
        >
          {error || helper}
        </small>
      )}
    </div>
  );
}
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`card ${className}`}>{children}</section>;
}
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "red";
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
export function Skeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div
      className="skeleton-grid"
      role="status"
      aria-label="Cargando información"
    >
      {Array.from({ length: cards }, (_, i) => (
        <div className="card skeleton" key={i}>
          <i />
          <i />
          <i />
        </div>
      ))}
    </div>
  );
}
export function ErrorState({
  error,
  retry,
}: {
  error?: Error | null;
  retry?: () => void;
}) {
  return (
    <div role="alert" className="error-state">
      <AlertCircle size={21} />
      <div>
        <strong>No pudimos completar la solicitud</strong>
        <p>{error?.message ?? "Intenta de nuevo en un momento."}</p>
        {retry && (
          <Button variant="secondary" onClick={retry}>
            Reintentar
          </Button>
        )}
      </div>
    </div>
  );
}
export function EmptyState({
  title = "Aún no hay información",
  description,
  action,
}: {
  title?: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="icon-tile">
        <Target size={24} />
      </span>
      <h3>{title}</h3>
      <p className="muted">{description}</p>
      {action}
    </div>
  );
}
export function SectionTitle({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      {children}
    </div>
  );
}
export function Arrow() {
  return <ArrowRight size={17} />;
}
