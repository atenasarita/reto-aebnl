import { useCallback, useRef } from "react";
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
  const csvExportHandlerRef = useRef(null);

  const registerCsvExportHandler = useCallback((handler) => {
    csvExportHandlerRef.current = typeof handler === "function" ? handler : null;
  }, []);

  const handleExportCsv = useCallback(() => {
    const run = csvExportHandlerRef.current;
    if (typeof run === "function") {
      try {
        run();
      } catch (e) {
        console.error("[Reportes] Error al exportar CSV:", e);
        window.alert("No se pudo generar el archivo CSV. Revisa la consola para más detalle.");
      }
      return;
    }
    window.alert("No hay un reporte listo para exportar en esta pantalla.");
  }, []);

  return (
    <section className="reportes-page-layout">
      <header className="reportes-page-header">
        <div className="reportes-page-title page-header">
          <h1 className="page-header-title">Panel Reportes</h1>
          <p className="page-header-subtitle">Navega entre los distintos reportes del sistema.</p>
        </div>

        <div className="reportes-page-header-meta">
          <button
            type="button"
            className="reportes-meta-btn"
            onClick={handleExportCsv}
            title="Descargar los datos del reporte actual como archivo CSV"
          >
            Exportar CSV
          </button>
        </div>
      </header>

      <ReportesTabsNav items={REPORTES_NAV} />

      <div className="reportes-page-content">
        <Outlet context={{ registerCsvExportHandler }} />
      </div>
    </section>
  );
}