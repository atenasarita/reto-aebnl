import { CalendarDays } from "lucide-react";
import "../reportePersonalizado.ledger.chrome.css";
import "./PersonalizadoRangoFechasCard.css";

export default function PersonalizadoRangoFechasCard({
  desdeDraft,
  hastaDraft,
  onDesdeChange,
  onHastaChange,
  errorRango,
}) {
  return (
    <section
      className={`reporte-personalizado-ledger reporte-personalizado-ledger--temporal${errorRango ? " is-invalid" : ""}`}
      aria-labelledby="reporte-personalizado-rango-titulo"
    >
      <header className="reporte-personalizado-ledger-toolbar">
        <div className="reporte-personalizado-ledger-toolbar-lead">
          <CalendarDays className="reporte-personalizado-ledger-toolbar-icon" strokeWidth={2} aria-hidden />
          <h2 id="reporte-personalizado-rango-titulo" className="reporte-personalizado-ledger-toolbar-title">
            Parámetros temporales
          </h2>
        </div>
      </header>
      <div className="reporte-personalizado-ledger-panel">
        <div className="reporte-personalizado-ledger-fields">
          <div className="reporte-personalizado-ledger-field">
            <label className="reporte-personalizado-ledger-label" htmlFor="reporte-personalizado-desde">
              Fecha inicial
            </label>
            <div className="reporte-personalizado-ledger-input-wrap">
              <input
                id="reporte-personalizado-desde"
                type="date"
                className="reporte-personalizado-ledger-date"
                value={desdeDraft}
                onChange={(e) => onDesdeChange(e.target.value)}
                aria-invalid={Boolean(errorRango)}
              />
              <CalendarDays className="reporte-personalizado-ledger-date-icon" size={18} aria-hidden />
            </div>
          </div>
          <div className="reporte-personalizado-ledger-field">
            <label className="reporte-personalizado-ledger-label" htmlFor="reporte-personalizado-hasta">
              Fecha final
            </label>
            <div className="reporte-personalizado-ledger-input-wrap">
              <input
                id="reporte-personalizado-hasta"
                type="date"
                className="reporte-personalizado-ledger-date"
                value={hastaDraft}
                onChange={(e) => onHastaChange(e.target.value)}
                aria-invalid={Boolean(errorRango)}
              />
              <CalendarDays className="reporte-personalizado-ledger-date-icon" size={18} aria-hidden />
            </div>
          </div>
        </div>
        {errorRango ? (
          <p className="reporte-personalizado-ledger-error" role="alert">
            {errorRango}
          </p>
        ) : null}
      </div>
    </section>
  );
}
