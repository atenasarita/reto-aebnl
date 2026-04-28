import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import logo from "../../../assets/logo.png";
import { Bell } from "lucide-react";

const API_URL = "http://localhost:3000/api";

const NAV_LINKS = [
  { label: "Tablero", to: "/dashboard" },
  { label: "Beneficiarios", to: "/beneficiarios" },
  { label: "Prerregistro", to: "/prerregistro" },
  { label: "Servicios", to: "/servicios" },
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
  const [active, setActive] = useState(activeLink);
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
      title: "Prerregistros nuevos",
      text: "Visualiza nuevas solicitudes pendientes.",
      count: 0,
      to: "/prerregistro",
    },
  ]);

  const alertsRef = useRef(null);

  useEffect(() => {
    setActive(activeLink);
  }, [activeLink]);

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

  const normalizedRole = String(user?.role || "").toLowerCase().trim();

  const visibleLinks = useMemo(() => {
    if (normalizedRole === "operador") {
      return NAV_LINKS.filter(
        (link) => link.label !== "Reportes" && link.label !== "Recibos"
      );
    }
    return NAV_LINKS;
  }, [normalizedRole]);

  const totalAlerts = useMemo(() => {
    return alertItems.reduce((acc, item) => acc + item.count, 0);
  }, [alertItems]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const loadAlertas = async () => {
      setAlertsLoading(true);

      try {
        const results = await Promise.allSettled([
          fetchJson(`${API_URL}/beneficiarios/membresias-proximas`, token),
          fetchJson(`${API_URL}/inventario/escasez`, token),
          fetchJson(`${API_URL}/dashboard/preregistro-pendientes`, token),
        ]);

        // console.log("RESULTADO MEMBRESIAS:", results[0]);

        if (results[0].status === "fulfilled") {
          console.log("PAYLOAD MEMBRESIAS:", results[0].value);
        }

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
            title: "Prerregistros nuevos",
            text:
              preregistrosCount > 0
                ? `${preregistrosCount} prerregistro(s) pendiente(s).`
                : "Sin nuevos prerregistros pendientes.",
            count: preregistrosCount,
            to: "/prerregistro",
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

  return (
    <nav className={styles.navbar}>
      <a className={styles.logo} href="/">
        <img src={logo} alt="Espina Bífida logo" className={styles.logoIcon} />
      </a>

      <div className={styles.links}>
        {visibleLinks.map((link) => (
          <button
            key={link.label}
            type="button"
            className={`${styles.link} ${active === link.label ? styles.linkActive : ""}`}
            onClick={() => {
              setActive(link.label);
              navigate(link.to);
            }}
          >
            {link.label}
          </button>
        ))}
      </div>

      <div className={styles.right}>
        <button className={styles.settingsBtn} title="Configuración">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        <div className={styles.alertWrapper} ref={alertsRef}>
          <button
            className={styles.alertBtn}
            title="Alertas"
            onClick={() => setAlertsOpen((prev) => !prev)}
            type="button"
          >
            <Bell size={20} />
            {totalAlerts > 0 && (
              <span className={styles.alertBadge}>{totalAlerts}</span>
            )}
          </button>

          {alertsOpen && (
            <div className={styles.alertDropdown}>
              <div className={styles.alertDropdownHeader}>Alertas</div>

              {alertsLoading ? (
                <div className={styles.alertEmpty}>Cargando alertas...</div>
              ) : (
                alertItems.map((item) => (
                  <button
                    key={item.key}
                    type="button"
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

        <div className={styles.user}>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user.name}</div>
            <div className={styles.userRole}>{user.role}</div>
          </div>
          <div className={styles.avatar}>
            {user.avatar ? <img src={user.avatar} alt={user.name} /> : user.name.charAt(0)}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;