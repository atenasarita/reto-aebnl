import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import logo from "../../../assets/logo.png";
import { Bell, LogOut, Menu, X } from "lucide-react";
import OfflineBanner from "../OfflineBanner";

import { API_URL } from '../../../utils/config';
import { getValidToken, handleUnauthorizedResponse, logout } from '../../../utils/auth';

const NAV_LINKS = [
  { label: "Inicio", to: "/dashboard" },
  { label: "Beneficiarios", to: "/beneficiarios" },
  { label: "Servicios", to: "/servicios" },
  { label: "Donaciones", to: "/donaciones" },
  { label: "Inventario", to: "/inventario" },
  { label: "Citas", to: "/citas" },
  { label: "Reportes", to: "/reportes" },
  { label: "Recibos", to: "/recibos" },
];

function resolveCount(payload) {
  if (Array.isArray(payload)) return payload.length;

  if (typeof payload?.total === "number") return payload.total;
  if (typeof payload?.count === "number") return payload.count;

  if (Array.isArray(payload?.data)) return payload.data.length;
  if (Array.isArray(payload?.items)) return payload.items.length;
  if (Array.isArray(payload?.beneficiarios)) return payload.beneficiarios.length;
  if (Array.isArray(payload?.membresias)) return payload.membresias.length;
  if (Array.isArray(payload?.rows)) return payload.rows.length;

  return 0;
}

async function fetchJson(url, token) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (handleUnauthorizedResponse(response)) {
    throw new Error('Sesión expirada');
  }

  if (!response.ok) {
    throw new Error(`Error al consultar ${url}`);
  }

  return response.json();
}

function Navbar({
  activeLink = "Beneficiarios",
  user = { name: "USUARIO DEMO", role: "Administrador", avatar: null },
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertItems, setAlertItems] = useState([
    {
      key: "membresias",
      title: "Terminación de una membresía",
      text: "Consulta membresías próximas a vencer.",
      count: 0,
      to: "/beneficiarios",
    },
    {
      key: "inventario",
      title: "Escasez de un producto en el inventario",
      text: "Revisa productos con existencia baja.",
      count: 0,
      to: "/inventario",
    },
    {
      key: "preregistros",
      title: "Pre-registros nuevos",
      text: "Visualiza nuevas solicitudes pendientes.",
      count: 0,
      to: "/dashboard",
    },
  ]);

  const alertsRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
    setAlertsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (alertsRef.current && !alertsRef.current.contains(event.target)) {
        setAlertsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const visibleLinks = useMemo(() => NAV_LINKS, []);

  const totalAlerts = useMemo(() => {
    return alertItems.reduce((acc, item) => acc + item.count, 0);
  }, [alertItems]);

  useEffect(() => {
    const token = getValidToken();
    if (!token) return;

    const loadAlertas = async () => {
      setAlertsLoading(true);

      try {
        const results = await Promise.allSettled([
          fetchJson(`${API_URL}/api/beneficiarios/membresias-proximas`, token),
          fetchJson(`${API_URL}/api/inventario/escasez`, token),
          fetchJson(`${API_URL}/api/dashboard/preregistro-pendientes`, token),
        ]);

        const membresiasCount =
          results[0].status === "fulfilled" ? resolveCount(results[0].value) : 0;

        const inventarioCount =
          results[1].status === "fulfilled" ? resolveCount(results[1].value) : 0;

        const preregistrosCount =
          results[2].status === "fulfilled" ? resolveCount(results[2].value) : 0;

        setAlertItems([
          {
            key: "membresias",
            title: "Terminación de una membresía",
            text:
              membresiasCount > 0
                ? `${membresiasCount} membresía(s) próxima(s) a vencer.`
                : "Sin membresías próximas a vencer.",
            count: membresiasCount,
            to: "/beneficiarios",
          },
          {
            key: "inventario",
            title: "Escasez de un producto en el inventario",
            text:
              inventarioCount > 0
                ? `${inventarioCount} producto(s) con existencia baja.`
                : "Sin productos con existencia baja.",
            count: inventarioCount,
            to: "/inventario",
          },
          {
            key: "preregistros",
            title: "Pre-registros nuevos",
            text:
              preregistrosCount > 0
                ? `${preregistrosCount} preregistro(s) pendiente(s).`
                : "Sin nuevos preregistros pendientes.",
            count: preregistrosCount,
            to: "/dashboard",
          },
        ]);
      } catch (error) {
        console.error("Error cargando alertas:", error);
      } finally {
        setAlertsLoading(false);
      }
    };

    loadAlertas();

    const interval = setInterval(loadAlertas, 60000);

    return () => clearInterval(interval);
  }, []);

  const goTo = (to) => {
    navigate(to);
  };

  const userInitial = String(user?.name || "?").charAt(0).toUpperCase();

  return (
    <div className={styles.navbarWrapper}>
      <OfflineBanner />
      <nav
        className={styles.navbar}
        aria-label="Navegación principal"
      >
        <Link to="/dashboard" className={styles.brandMark} aria-label="Ir al inicio">
          <img
            src={logo}
            alt="Asociación de Espina Bífida de Nuevo León"
            className={styles.brandImage}
            decoding="async"
          />
        </Link>

        <button
          type="button"
          className={styles.menuToggle}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-expanded={menuOpen}
          aria-controls="navbar-links"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div
          id="navbar-links"
          className={`${styles.links} ${menuOpen ? styles.linksOpen : ""}`}
        >
          {visibleLinks.map((link) => {
            const isActive = activeLink === link.label;
            return (
              <button
                key={link.label}
                type="button"
                className={`${styles.link} ${isActive ? styles.linkActive : ""}`}
                aria-current={isActive ? "page" : undefined}
                onClick={() => goTo(link.to)}
              >
                {link.label}
              </button>
            );
          })}
        </div>

        <div className={styles.right}>
          <div className={styles.alertWrapper} ref={alertsRef}>
            <button
              className={styles.iconBtn}
              title="Alertas"
              aria-expanded={alertsOpen}
              aria-haspopup="true"
              onClick={() => setAlertsOpen((prev) => !prev)}
              type="button"
            >
              <Bell size={20} aria-hidden />
              {totalAlerts > 0 && (
                <span className={styles.alertBadge} aria-label={`${totalAlerts} alertas`}>
                  {totalAlerts > 99 ? "99+" : totalAlerts}
                </span>
              )}
            </button>

            {alertsOpen && (
              <div className={styles.alertDropdown} role="menu">
                <div className={styles.alertDropdownHeader}>Alertas</div>

                {alertsLoading ? (
                  <div className={styles.alertEmpty}>Cargando alertas...</div>
                ) : (
                  alertItems.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      role="menuitem"
                      className={styles.alertItem}
                      onClick={() => {
                        setAlertsOpen(false);
                        navigate(item.to);
                      }}
                    >
                      <div className={styles.alertItemTop}>
                        <div className={styles.alertItemTitle}>{item.title}</div>
                        <div
                          className={`${styles.alertItemCount} ${
                            item.count > 0 ? styles.alertItemCountActive : ""
                          }`}
                        >
                          {item.count}
                        </div>
                      </div>

                      <div className={styles.alertItemText}>{item.text}</div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <span className={styles.toolbarDivider} aria-hidden />

          <button
            type="button"
            className={`${styles.iconBtn} ${styles.logoutBtn}`}
            onClick={() => logout()}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <LogOut size={20} aria-hidden />
          </button>

          <div className={styles.user}>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user.name}</div>
              <div className={styles.userRole}>{user.role}</div>
            </div>
            <div className={styles.avatar} aria-hidden>
              {user.avatar ? <img src={user.avatar} alt="" /> : userInitial}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;