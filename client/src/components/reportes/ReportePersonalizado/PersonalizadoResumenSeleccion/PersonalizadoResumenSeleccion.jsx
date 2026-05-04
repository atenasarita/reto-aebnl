import "./PersonalizadoResumenSeleccion.css";

export default function PersonalizadoResumenSeleccion({
  rangoTemporal,
  filtrosActivos,
  regionAnalisis,
  onGenerarReporte,
}) {
  return (
    <section
      className="reporte-personalizado-resumen-bar"
      aria-label="Resumen de configuración del reporte"
    >
      <div className="reporte-personalizado-resumen-glow" aria-hidden />
      <div className="reporte-personalizado-resumen-inner">
        <div className="reporte-personalizado-resumen-cols">
          <div className="reporte-personalizado-resumen-cell">
            <span className="reporte-personalizado-resumen-eyebrow">Rango temporal</span>
            <span className="reporte-personalizado-resumen-value">{rangoTemporal}</span>
          </div>
          <div className="reporte-personalizado-resumen-cell">
            <span className="reporte-personalizado-resumen-eyebrow">Filtros activos</span>
            <span className="reporte-personalizado-resumen-value">{filtrosActivos}</span>
          </div>
          <div className="reporte-personalizado-resumen-cell">
            <span className="reporte-personalizado-resumen-eyebrow">Región de análisis</span>
            <span className="reporte-personalizado-resumen-value">{regionAnalisis}</span>
          </div>
        </div>
        <button type="button" className="reporte-personalizado-resumen-cta" onClick={onGenerarReporte}>
          Generar reporte
        </button>
      </div>
    </section>
  );
}
