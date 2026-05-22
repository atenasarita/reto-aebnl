import "./ReportesLoading.css";

/**
 * Estado de carga accesible para pantallas de reportes (fetch de datos).
 */
export default function ReportesLoading({ message = "Cargando…", className = "" }) {
  return (
    <div
      className={["reportes-loading", className].filter(Boolean).join(" ")}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="reportes-loading__spinner" aria-hidden />
      <p className="reportes-loading__text">{message}</p>
    </div>
  );
}
