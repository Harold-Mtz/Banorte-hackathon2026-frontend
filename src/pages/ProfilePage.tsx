import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ShieldCheck, ArrowUpRight } from "lucide-react";
import { api } from "../api";
import { useAuth } from "../features/auth/AuthContext";
import {
  PageHeader,
  Card,
  Skeleton,
  ErrorState,
  Button,
} from "../components/common/ui";
import { formatDate } from "../utils/format";
export function ProfilePage() {
  const { session, logout } = useAuth();
  const user = useQuery({
    queryKey: ["user", session!.user.id],
    queryFn: () => api.user(session!.user.id),
  });
  return (
    <>
      <PageHeader
        eyebrow="TU ESPACIO PERSONAL"
        title="Mi perfil"
        subtitle="La información de tu cuenta, en un solo lugar."
      />
      {user.isPending ? (
        <Skeleton cards={1} />
      ) : user.isError ? (
        <ErrorState error={user.error} retry={() => void user.refetch()} />
      ) : (
        <div className="profile-grid">
          <Card>
            <span className="avatar large">
              {user.data.name.slice(0, 1).toUpperCase()}
            </span>
            <h2>{user.data.name}</h2>
            <p className="muted">{user.data.email}</p>
            <dl>
              <div>
                <dt>Miembro desde</dt>
                <dd>{formatDate(user.data.createdAt)}</dd>
              </div>
            </dl>
            <Button variant="secondary" onClick={logout}>
              Cerrar sesión
            </Button>
          </Card>
          <Card>
            <ShieldCheck className="brand-color" size={28} />
            <h2>Tus finanzas tienen su espacio.</h2>
            <p className="muted">
              Revisa y actualiza tu perfil financiero para mantener tus planes
              al día.
            </p>
            <Link to="/app/financial-profile" className="button secondary">
              Mi vida financiera <ArrowUpRight size={17} />
            </Link>
          </Card>
        </div>
      )}
    </>
  );
}
