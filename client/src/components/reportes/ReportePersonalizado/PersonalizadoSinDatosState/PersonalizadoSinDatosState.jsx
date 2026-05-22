import { CalendarSearch } from "lucide-react";
import "./PersonalizadoSinDatosState.css";

export default function PersonalizadoSinDatosState() {
  return (
    <div className="reporte-personalizado-empty-state">
      <CalendarSearch className="reporte-personalizado-empty-icon" strokeWidth={1.5} aria-hidden />
      <p className="reporte-personalizado-empty-title">Sin datos para mostrar</p>
      <p className="reporte-personalizado-empty-copy">
        Define el periodo temporal y usa &quot;Generar reporte&quot; para cargar la vista previa de resultados.
      </p>
    </div>
  );
}
