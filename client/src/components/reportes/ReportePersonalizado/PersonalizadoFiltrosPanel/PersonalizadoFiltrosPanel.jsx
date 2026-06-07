import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import PersonalizadoFiltrosDemograficos from "../PersonalizadoFiltrosDemograficos/PersonalizadoFiltrosDemograficos";
import PersonalizadoMetricasBar from "../PersonalizadoMetricasBar/PersonalizadoMetricasBar";
import "../ReportePersonalizadoShell/ReportePersonalizadoShell.css";
import "./PersonalizadoFiltrosPanel.css";

export default function PersonalizadoFiltrosPanel({
  open,
  onOpenChange,
  muestraDemografia,
  metricas,
  onToggleMetrica,
  hayDatos,
  distribucionEstado,
  generosEfectivos,
  etapasEfectivas,
  estadosEfectivos,
  onToggleGenero,
  onToggleEtapa,
  onToggleEstado,
}) {
  const panelId = useId();
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return undefined;

    const prevOverflow = document.body.style.overflow;
    if (window.matchMedia("(max-width: 959px)").matches) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!hayDatos || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <>
      <div
        className={`reporte-personalizado-filtros-scrim${open ? " is-visible" : ""}`}
        aria-hidden={!open}
        onClick={() => onOpenChange(false)}
      />

      <aside
        id={panelId}
        className={`reporte-personalizado-theme reporte-personalizado-filtros-panel${open ? " is-open" : ""}`}
        aria-labelledby={titleId}
        aria-hidden={!open}
      >
        <header className="reporte-personalizado-filtros-panel-head">
          <h2 id={titleId} className="reporte-personalizado-filtros-panel-title">
            Filtros
          </h2>
          <button
            type="button"
            className="reporte-personalizado-filtros-panel-close"
            aria-label="Cerrar filtros"
            onClick={() => onOpenChange(false)}
          >
            <X size={18} strokeWidth={2.25} aria-hidden />
          </button>
        </header>

        <div className="reporte-personalizado-filtros-panel-body">
          <section className="reporte-personalizado-filtros-section" aria-label="Métricas del reporte">
            <h3 className="reporte-personalizado-filtros-section-title">Métricas</h3>
            <PersonalizadoMetricasBar
              metricas={metricas}
              onToggleMetrica={onToggleMetrica}
              className="reporte-personalizado-metrics-bar--panel"
            />
          </section>

          {muestraDemografia ? (
            <section className="reporte-personalizado-filtros-section" aria-label="Filtros demográficos">
              <PersonalizadoFiltrosDemograficos
                layout="stacked"
                variant="panel"
                hayDatos={hayDatos}
                distribucionEstado={distribucionEstado}
                generosEfectivos={generosEfectivos}
                etapasEfectivas={etapasEfectivas}
                estadosEfectivos={estadosEfectivos}
                onToggleGenero={onToggleGenero}
                onToggleEtapa={onToggleEtapa}
                onToggleEstado={onToggleEstado}
              />
            </section>
          ) : (
            <p className="reporte-personalizado-filtros-hint">
              Activa &quot;Datos demográficos&quot; para filtrar por género, etapa y ubicación.
            </p>
          )}
        </div>
      </aside>
    </>,
    document.body,
  );
}
