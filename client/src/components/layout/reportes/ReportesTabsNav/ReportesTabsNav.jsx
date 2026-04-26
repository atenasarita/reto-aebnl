import { NavLink } from "react-router-dom";
import "./ReportesTabsNav.css";

const ICON_PATHS = {
  general: "M4 6h16v3H4zM4 11h10v3H4zM4 16h7v3H4z",
  inventario: "M3 7h18v3H3zM5 11h14v9H5zM9 4h6v3H9z",
  anual: "M4 19V5h3v14H4zm6 0V10h3v9h-3zm6 0v-6h3v6h-3z",
  personalizado:
    "M10 4a6 6 0 0 1 4.8 9.6l4.3 4.3-1.4 1.4-4.3-4.3A6 6 0 1 1 10 4zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
};

function ReporteTabIcon({ kind }) {
  const iconPath = ICON_PATHS[kind] ?? ICON_PATHS.general;

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={iconPath} />
    </svg>
  );
}

export default function ReportesTabsNav({ items }) {
  return (
    <nav className="reportes-tabs-nav" aria-label="Secciones de reportes">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          title={item.label}
          className={({ isActive }) =>
            isActive ? "reportes-tab-link is-active" : "reportes-tab-link"
          }
        >
          <ReporteTabIcon kind={item.icon} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
