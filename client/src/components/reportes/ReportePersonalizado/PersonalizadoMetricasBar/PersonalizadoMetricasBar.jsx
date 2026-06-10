import PropTypes from "prop-types";
import { METRICA_OPTIONS } from "../reportePersonalizadoConstants";
import "./PersonalizadoMetricasBar.css";

function PersonalizadoMetricasBar({ metricas, onToggleMetrica, className = "" }) {
  return (
    <div
      className={`reporte-personalizado-metrics-bar ${className}`.trim()}
      role="group"
      aria-label="Métricas a incluir"
    >
      {METRICA_OPTIONS.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onToggleMetrica(m.id)}
          className={
            metricas.has(m.id)
              ? "reporte-personalizado-metric-pill is-active"
              : "reporte-personalizado-metric-pill"
          }
          aria-pressed={metricas.has(m.id)}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

PersonalizadoMetricasBar.propTypes = {
  metricas: PropTypes.instanceOf(Set).isRequired,
  onToggleMetrica: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default PersonalizadoMetricasBar;
