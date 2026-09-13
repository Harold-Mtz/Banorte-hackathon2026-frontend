import { Brand } from "../common/Brand";
import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  Target,
  Calculator,
  Compass,
  UserRound,
  LogOut,
  Menu,
  X,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../features/auth/AuthContext";
import { AgentProvider } from "../../features/agent/AgentContext";
const navigation = [
  { to: "/app", label: "Inicio", icon: LayoutDashboard, end: true },
  { to: "/app/financial-profile", label: "Mi vida financiera", icon: Wallet },
  { to: "/app/goals", label: "Metas de ahorro", icon: Target },
  { to: "/app/mortgages", label: "Simulaciones", icon: Calculator },
  { to: "/app/life-events", label: "Experiencias", icon: Compass },
  { to: "/app/profile", label: "Mi perfil", icon: UserRound },
];
export function AppLayout() {
  const { session, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(
    () => window.matchMedia("(max-width: 720px)").matches,
  );
  const sidebar = useRef<HTMLElement>(null);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 720px)");
    const update = () => setMobile(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!open || !mobile) return;
    const previous = document.activeElement as HTMLElement | null;
    const elements = () =>
      Array.from(
        sidebar.current?.querySelectorAll<HTMLElement>("a,button") ?? [],
      ).filter((el) => el.offsetParent !== null);
    elements()[0]?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab") return;
      const items = elements();
      const first = items[0],
        last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
      previous?.focus();
    };
  }, [open, mobile]);
  const location = useLocation();
  const title =
    navigation.find((n) =>
      n.end ? location.pathname === n.to : location.pathname.startsWith(n.to),
    )?.label ?? "Tu siguiente paso";
  const name = session!.user.name;
  return (
    <AgentProvider>
      <a href="#main" className="skip-link">
        Ir al contenido
      </a>
      <div className="app-shell">
        {open && (
          <button
            aria-label="Cerrar menú"
            className="menu-overlay"
            onClick={() => setOpen(false)}
          />
        )}
        <aside
          ref={sidebar}
          inert={mobile && !open}
          className={`sidebar ${open ? "open" : ""}`}
          aria-label="Navegación principal"
        >
          <Link to="/app" className="brand">
            <Brand />
          </Link>
          <button
            className="icon-button close-menu"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
          <p className="nav-caption">TU ESPACIO</p>
          <nav>
            {navigation.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                <Icon size={20} />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <Link
              className="sidebar-promo"
              to="/app/experience"
              onClick={() => setOpen(false)}
            >
              <Sparkles size={22} />
              <strong>Piensa en grande.</strong>
              <p>Tu próxima etapa empieza con una idea.</p>
              <span>
                Explorar mi objetivo <ArrowUpRight size={16} />
              </span>
            </Link>
            <div className="sidebar-user">
              <span className="avatar">{name.slice(0, 1).toUpperCase()}</span>
              <div>
                <strong>{name}</strong>
                <small>Mi cuenta personal</small>
              </div>
              <button
                className="icon-button"
                onClick={logout}
                aria-label="Cerrar sesión"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </aside>
        <div className="app-body">
          <header className="topbar">
            <div className="topbar-left">
              <button
                className="icon-button mobile-menu"
                aria-label="Abrir menú"
                aria-expanded={open}
                onClick={() => setOpen(true)}
              >
                <Menu />
              </button>
              <span>Mi espacio</span>
              <span className="breadcrumb-divider">/</span>
              <strong>{title}</strong>
            </div>
            <Link to="/app/profile" className="header-user">
              <span className="connection">
                <i /> Tu espacio personal
              </span>
              <span className="avatar small">
                {name.slice(0, 1).toUpperCase()}
              </span>
            </Link>
          </header>
          <main id="main" className="main-content" key={location.pathname}>
            <Outlet />
          </main>
          <footer className="app-footer">
            <span>BANORTE BORIAS</span>
            <span>Tu siguiente capítulo, a tu ritmo.</span>
          </footer>
        </div>
      </div>
    </AgentProvider>
  );
}
