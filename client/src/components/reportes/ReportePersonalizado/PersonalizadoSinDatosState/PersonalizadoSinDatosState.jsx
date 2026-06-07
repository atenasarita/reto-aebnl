import { CalendarSearch } from "lucide-react";
import "./PersonalizadoSinDatosState.css";

export default function PersonalizadoSinDatosState() {
  return (
    <div className="reporte-personalizado-empty-state">
      <CalendarSearch className="reporte-personalizado-empty-icon" strokeWidth={1.5} aria-hidden />
      <p className="reporte-personalizado-empty-title">Sin datos para mostrar</p>
      <p className="reporte-personalizado-empty-copy">
        Elige el periodo arriba y pulsa &quot;Generar reporte&quot;. Después podrás ajustar métricas y filtros
        demográficos sobre los resultados.
      </p>
    </div>
  );
}
