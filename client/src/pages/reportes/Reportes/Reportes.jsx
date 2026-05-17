import { Outlet } from "react-router-dom";
import ReportesTabsNav from "../../../components/layout/reportes/ReportesTabsNav/ReportesTabsNav";
import "./Reportes.css";

const REPORTES_NAV = [
  { to: "general", label: "General", icon: "general" },
  { to: "inventario", label: "Inventario", icon: "inventario" },
  { to: "mensual", label: "Período", icon: "anual" },
  { to: "personalizado", label: "Personalizado", icon: "personalizado" },
];

export default function Reportes() {
  return (
    <section className="reportes-page-layout">
      <header className="reportes-page-header">
        <div className="reportes-page-title page-header">
          <h1 className="page-header-title">Panel Reportes</h1>
          <p className="page-header-subtitle">Navega entre los distintos reportes del sistema.</p>
        </div>

        <div className="reportes-page-header-meta">
          <button type="button" className="reportes-meta-btn">
            Exportar
          </button>
        </div>  
      </header>

      <ReportesTabsNav items={REPORTES_NAV} />

      <div className="reportes-page-content">
        <Outlet />
      </div>
    </section>
  );
}