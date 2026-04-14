import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import logo from "../../../assets/logo.png";

const NAV_LINKS = [
  { label: "Tablero", to: "/dashboard" },
  { label: "Beneficiarios", to: "/beneficiarios" },
  { label: "Servicios", to: "/servicios" },
  { label: "Inventario", to: "/inventario" },
  { label: "Citas", to: "/citas" },
  { label: "Reportes", to: "/reportes" },
];

function Navbar({
  activeLink = "Beneficiarios",
  user = { name: "USUARIO DEMO", role: "Administrador", avatar: null },
}) {
  const navigate = useNavigate();
  const [active, setActive] = useState(activeLink);

  useEffect(() => {
    setActive(activeLink);
  }, [activeLink]);

  return (
    <nav className={styles.navbar}>
      <a className={styles.logo} href="/">
        <img src={logo} alt="Espina Bífida logo" className={styles.logoIcon} />
      </a>

      {/* Nav links */}
      <div className={styles.links}>
        {NAV_LINKS.map((link) => (
          <button
            key={link.label}
            type="button"
            className={`${styles.link} ${active === link.label ? styles.linkActive : ""}`}
            onClick={() => {
              setActive(link.label);
              if (link.to) {
                navigate(link.to);
              }
            }}
          >
            {link.label}
          </button>
        ))}
      </div>

      {/* Right side */}
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

        <div className={styles.user}>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user.name}</div>
            <div className={styles.userRole}>{user.role}</div>
          </div>
          <div className={styles.avatar}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              user.name.charAt(0)
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;