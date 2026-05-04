import { Activity, MapPinned, ScanSearch } from "lucide-react";
import { ETAPA_FILTROS, GENERO_FILTROS } from "../reportePersonalizadoConstants";
import "./PersonalizadoFiltrosDemograficos.css";

export default function PersonalizadoFiltrosDemograficos({
  hayDatos,
  distribucionEstado,
  generosEfectivos,
  etapasEfectivas,
  estadosEfectivos,
  onToggleGenero,
  onToggleEtapa,
  onToggleEstado,
}) {
  return (
    <div className="reporte-personalizado-dem-columns">
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
          {!hayDatos ? (
            <div className="reporte-personalizado-dem-hint-panel">
              <p className="reporte-personalizado-dem-hint-text">
                Habilite un periodo de tiempo arriba para filtrar por región.
              </p>
            </div>
          ) : distribucionEstado.length === 0 ? (
            <p className="reporte-mxmap-hint reporte-personalizado-dem-empty">Sin estados en este periodo.</p>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
