import PropTypes from "prop-types";
import "./PersonalizadoResumenSeleccion.css";

function PersonalizadoResumenSeleccion({
  rangoTemporal,
  filtrosActivos,
  regionAnalisis,
  mostrarConfigFiltros = false,
  onGenerarReporte,
}) {
  return (
    <section
      className={`reporte-personalizado-resumen-bar${mostrarConfigFiltros ? "" : " reporte-personalizado-resumen-bar--solo-periodo"}`}
      aria-label="Resumen de configuración del reporte"
    >
      <div className="reporte-personalizado-resumen-glow" aria-hidden />
      <div className="reporte-personalizado-resumen-inner">
        <div className="reporte-personalizado-resumen-cols">
          <div className="reporte-personalizado-resumen-cell">
            <span className="reporte-personalizado-resumen-eyebrow">Rango temporal</span>
            <span className="reporte-personalizado-resumen-value">{rangoTemporal}</span>
          </div>
          {mostrarConfigFiltros ? (
            <>
              <div className="reporte-personalizado-resumen-cell">
                <span className="reporte-personalizado-resumen-eyebrow">Filtros activos</span>
                <span className="reporte-personalizado-resumen-value">{filtrosActivos}</span>
              </div>
              <div className="reporte-personalizado-resumen-cell">
                <span className="reporte-personalizado-resumen-eyebrow">Región de análisis</span>
                <span className="reporte-personalizado-resumen-value">{regionAnalisis}</span>
              </div>
            </>
          ) : (
            <div className="reporte-personalizado-resumen-cell">
              <span className="reporte-personalizado-resumen-eyebrow">Siguiente paso</span>
              <span className="reporte-personalizado-resumen-value">
                Pulsa «Generar reporte» para cargar resultados y configurar filtros.
              </span>
            </div>
          )}
        </div>
        <button type="button" className="reporte-personalizado-resumen-cta" onClick={onGenerarReporte}>
          Generar reporte
        </button>
      </div>
    </section>
  );
}

PersonalizadoResumenSeleccion.propTypes = {
  rangoTemporal: PropTypes.node,
  filtrosActivos: PropTypes.node,
  regionAnalisis: PropTypes.node,
  mostrarConfigFiltros: PropTypes.bool,
  onGenerarReporte: PropTypes.func,
};

export default PersonalizadoResumenSeleccion;
