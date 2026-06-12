import PropTypes from "prop-types";
import { Activity, MapPinned, ScanSearch } from "lucide-react";
import { ETAPA_FILTROS, GENERO_FILTROS } from "../reportePersonalizadoConstants";
import "./PersonalizadoFiltrosDemograficos.css";

function PersonalizadoFiltrosDemograficos({
  layout = "grid",
  variant = "default",
  hayDatos,
  distribucionEstado,
  generosEfectivos,
  etapasEfectivas,
  estadosEfectivos,
  onToggleGenero,
  onToggleEtapa,
  onToggleEstado,
}) {
  const layoutClass = layout === "stacked" ? " reporte-personalizado-dem-columns--stacked" : "";
  const variantClass = variant === "panel" ? " reporte-personalizado-dem-columns--panel" : "";

  const renderDistribucionEstado = () => {
    if (!hayDatos) {
      return (
        <div className="reporte-personalizado-dem-hint-panel">
          <p className="reporte-personalizado-dem-hint-text">
            Habilite un periodo de tiempo arriba para filtrar por región.
          </p>
        </div>
      );
    }
    if (distribucionEstado.length === 0) {
      return <p className="reporte-mxmap-hint reporte-personalizado-dem-empty">Sin estados en este periodo.</p>;
    }
    return (
      <div className="reporte-personalizado-dem-estados-scroll">
        {distribucionEstado.map((row) => (
          <label key={row.key} className="reporte-personalizado-dem-check">
            <input
              type="checkbox"
              checked={estadosEfectivos.has(row.key)}
              onChange={() => onToggleEstado(row.key)}
            />
            <span>{row.label}</span>
          </label>
        ))}
      </div>
    );
  };

  return (
    <div className={`reporte-personalizado-dem-columns${layoutClass}${variantClass}`}>
      <div className="reporte-personalizado-dem-col">
        <div className="reporte-personalizado-dem-col-head">
          <ScanSearch className="reporte-personalizado-dem-col-head-icon" size={18} strokeWidth={2} aria-hidden />
          <h3 className="reporte-personalizado-dem-col-title">Género</h3>
        </div>
        <div className="reporte-personalizado-dem-col-body">
          {GENERO_FILTROS.map((g) => (
            <label key={g.key} className="reporte-personalizado-dem-check">
              <input
                type="checkbox"
                checked={generosEfectivos.has(g.key)}
                onChange={() => onToggleGenero(g.key)}
                disabled={!hayDatos}
              />
              <span>{g.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="reporte-personalizado-dem-col">
        <div className="reporte-personalizado-dem-col-head">
          <Activity className="reporte-personalizado-dem-col-head-icon" size={18} strokeWidth={2} aria-hidden />
          <h3 className="reporte-personalizado-dem-col-title">Etapa de vida</h3>
        </div>
        <div className="reporte-personalizado-dem-col-body">
          {ETAPA_FILTROS.map((e) => (
            <label key={e.key} className="reporte-personalizado-dem-check">
              <input
                type="checkbox"
                checked={etapasEfectivas.has(e.key)}
                onChange={() => onToggleEtapa(e.key)}
                disabled={!hayDatos}
              />
              <span>{e.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="reporte-personalizado-dem-col">
        <div className="reporte-personalizado-dem-col-head">
          <MapPinned className="reporte-personalizado-dem-col-head-icon" size={18} strokeWidth={2} aria-hidden />
          <h3 className="reporte-personalizado-dem-col-title">Ubicación</h3>
        </div>
        <div className="reporte-personalizado-dem-col-body reporte-personalizado-dem-col-body--grow">
          {renderDistribucionEstado()}
        </div>
      </div>
    </div>
  );
}

PersonalizadoFiltrosDemograficos.propTypes = {
  layout: PropTypes.string,
  variant: PropTypes.string,
  hayDatos: PropTypes.bool,
  distribucionEstado: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    label: PropTypes.string,
  })),
  generosEfectivos: PropTypes.instanceOf(Set),
  etapasEfectivas: PropTypes.instanceOf(Set),
  estadosEfectivos: PropTypes.instanceOf(Set),
  onToggleGenero: PropTypes.func,
  onToggleEtapa: PropTypes.func,
  onToggleEstado: PropTypes.func,
};

export default PersonalizadoFiltrosDemograficos;
