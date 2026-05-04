import { formatNumber, GRANULARIDAD_SERVICIOS } from "../reportePersonalizado.utils";
import "./ServiciosPorDiaTooltip.css";

function formatFechaLarga(ymd) {
  const s = String(ymd || "").slice(0, 10);
  if (s.length < 10) return s || ymd;
  return new Date(`${s}T12:00:00`).toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function textoPeriodoTooltip(row) {
  const g = row?.granularidad;
  if (g === GRANULARIDAD_SERVICIOS.SEMANA && row.bucketInicio && row.bucketFin) {
    return `${formatFechaLarga(row.bucketInicio)} — ${formatFechaLarga(row.bucketFin)}`;
  }
  if (g === GRANULARIDAD_SERVICIOS.MES && row.bucketInicio) {
    const y = row.bucketInicio.slice(0, 7);
    return new Date(`${y}-01T12:00:00`).toLocaleDateString("es-MX", {
      month: "long",
      year: "numeric",
    });
  }
  const ref = row?.bucketInicio || row?.fecha || "";
  return formatFechaLarga(ref);
}

export default function ServiciosPorDiaTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  const value = payload[0]?.value ?? 0;
  const periodoTxt = textoPeriodoTooltip(row);

  return (
    <div className="reporte-mensual-chart-tooltip reporte-personalizado-chart-tooltip">
      <p className="reporte-mensual-chart-tooltip-label">Servicios</p>
      <p className="reporte-mensual-chart-tooltip-value">
        <strong>{periodoTxt}</strong>
      </p>
      <p className="reporte-mensual-chart-tooltip-value">
        <strong>{formatNumber(value)}</strong> servicios
      </p>
    </div>
  );
}
