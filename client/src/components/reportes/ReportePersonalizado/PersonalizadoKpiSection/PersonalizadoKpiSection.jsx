import { Activity, UserPlus, Users } from "lucide-react";
import IndicadorCard from "../../IndicadorCard/IndicadorCard";
import { METRICA_DEMOGRAFICOS, METRICA_NUEVOS, METRICA_SERVICIOS } from "../reportePersonalizadoConstants";
import "./PersonalizadoKpiSection.css";

export default function PersonalizadoKpiSection({ metricas, data }) {
  const showServiciosDem =
    metricas.has(METRICA_DEMOGRAFICOS) &&
    !metricas.has(METRICA_SERVICIOS) &&
    !metricas.has(METRICA_NUEVOS);

  const showBlock =
    metricas.has(METRICA_SERVICIOS) ||
    metricas.has(METRICA_NUEVOS) ||
    showServiciosDem;

  if (!showBlock) return null;

  return (
    <div className="reporte-personalizado-kpi-grid">
      {metricas.has(METRICA_NUEVOS) ? (
        <IndicadorCard label="Nuevos beneficiarios" value={data.nuevosBeneficiarios} icon={UserPlus} />
      ) : null}
      {metricas.has(METRICA_SERVICIOS) ? (
        <>
          <IndicadorCard label="Total servicios" value={data.serviciosPeriodo} icon={Activity} />
          <IndicadorCard
            label="Beneficiarios atendidos"
            value={data.beneficiariosAtendidos}
            icon={Users}
            iconVariant="secondary"
          />
        </>
      ) : null}
      {showServiciosDem ? (
        <IndicadorCard label="Beneficiarios atendidos" value={data.beneficiariosAtendidos} icon={Users} />
      ) : null}
    </div>
  );
}
