import "./ReportePersonalizadoShell.css";

export default function ReportePersonalizadoShell({ children }) {
  return (
    <article className="reporte-personalizado-shell reporte-personalizado-theme">
      <div className="reporte-personalizado-inner">{children}</div>
    </article>
  );
}
