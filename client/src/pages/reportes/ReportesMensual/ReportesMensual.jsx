import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, UserPlus, Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import DistribucionGeneroDonut from "../../../components/reportes/DistribucionGeneroDonut/DistribucionGeneroDonut";
import DistribucionEtapaVidaList from "../../../components/reportes/DistribucionEtapaVidaList/DistribucionEtapaVidaList";
import EstadosAtendidosCard from "../../../components/reportes/EstadosAtendidosCard/EstadosAtendidosCard";
import { useReporteMensual } from "../../../hooks/useReporteMensual";
import IndicadorCard from "../../../components/reportes/IndicadorCard/IndicadorCard";
import "./ReportesMensual.css";

const MONTH_OPTIONS = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

function formatNumber(value) {
  return Number(value || 0).toLocaleString("es-MX");
}

function formatRangoFechas(periodo, mesNombre, anio) {
  if (!periodo?.desde || !periodo?.hasta) {
    if (mesNombre && anio) return `${mesNombre} ${anio}`;
    return "";
  }
  const [, , dDesde] = periodo.desde.split("-");
  const [, , dHasta] = periodo.hasta.split("-");
  return `${mesNombre} ${Number(dDesde)} – ${Number(dHasta)}, ${anio}`;
}

function ServiciosTooltip({ active, payload, label, mesNombre }) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value ?? 0;
  return (
    <div className="reporte-mensual-chart-tooltip">
      <p className="reporte-mensual-chart-tooltip-label">
        {mesNombre} {label}
      </p>
      <p className="reporte-mensual-chart-tooltip-value">
        <strong>{formatNumber(value)}</strong> servicios
      </p>
    </div>
  );
}

export default function ReportesMensual() {
  const today = useMemo(() => new Date(), []);
  const [mes, setMes] = useState(today.getMonth() + 1);
  const [anio, setAnio] = useState(today.getFullYear());

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, index) => currentYear - index);
  }, []);

  const { data, loading, error, refetch } = useReporteMensual(mes, anio);
  const {
    mesNombre,
    periodo,
    nuevosBeneficiarios,
    beneficiariosAtendidos,
    serviciosPeriodo,
    serviciosPorDia,
    distribucionGenero,
    distribucionEtapaVida,
    distribucionEstado,
  } = data;

  const totalGenero = useMemo(
    () => distribucionGenero.reduce((acc, row) => acc + Number(row.value || 0), 0),
    [distribucionGenero],
  );

  const tieneServicios = serviciosPorDia.some((d) => Number(d.conteo) > 0);
  const rangoLabel = formatRangoFechas(periodo, mesNombre, anio);

  return (
    <article className="reporte-mensual-shell">
      <header className="reporte-mensual-header">
        <div>
          <h2 className="reporte-mensual-title">Reporte Mensual de Operaciones</h2>
        </div>

        <div className="reporte-mensual-filters">
          <div className="reporte-periodo-switch" role="tablist" aria-label="Tipo de vista">
            <button type="button" className="is-active">
              Mensual
            </button>
            <Link to="/reportes/anual" className="reporte-periodo-switch-link">
              Anual
            </Link>
          </div>

          <div className="reporte-mensual-selectors">
            <label className="reporte-mensual-select">
              <span>Mes</span>
              <select value={mes} onChange={(e) => setMes(Number(e.target.value))}>
                {MONTH_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="reporte-mensual-select">
              <span>Año</span>
              <select value={anio} onChange={(e) => setAnio(Number(e.target.value))}>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </header>

      <>
        {error ? (
          <div className="reporte-general-alert" role="alert">
            <p>{error}</p>
            <button type="button" onClick={refetch}>
              Reintentar
            </button>
          </div>
        ) : null}

          <div className="reporte-mensual-kpi-grid">
            <IndicadorCard
              label="Nuevos beneficiarios"
              value={nuevosBeneficiarios}
              icon={UserPlus}
            />
            <IndicadorCard
              label="Total atendidos"
              value={beneficiariosAtendidos}
              icon={Users}
            />
            <IndicadorCard
              label="Total servicios"
              value={serviciosPeriodo}
              icon={Activity}
              iconVariant="secondary"
            />
          </div>

          <div className="reporte-mensual-main-row">
            <Card className="reporte-mensual-trend">
              <CardHeader className="reporte-mensual-trend-header">
                <div>
                  <h3 className="reporte-mensual-trend-title">Servicios otorgados por día</h3>
                  <p className="reporte-mensual-trend-sub">
                    {rangoLabel || "Visualización del tráfico diario en el mes seleccionado."}
                  </p>
                </div>
                <span className="reporte-mensual-trend-pill">
                  {mesNombre} {anio}
                </span>
              </CardHeader>
              <CardContent className="reporte-mensual-trend-content">
                {tieneServicios ? (
                  <div className="reporte-mensual-trend-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={serviciosPorDia}
                        margin={{ top: 10, right: 16, bottom: 4, left: 0 }}
                      >
                        <defs>
                          <linearGradient id="serviciosGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1e3b8a" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="#1e3b8a" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          vertical={false}
                          stroke="#e2e8f0"
                          strokeDasharray="3 3"
                        />
                        <XAxis
                          dataKey="dia"
                          axisLine={false}
                          tickLine={false}
                          interval="preserveStartEnd"
                          tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                          width={32}
                          allowDecimals={false}
                        />
                        <Tooltip
                          cursor={{ stroke: "#94a3b8", strokeDasharray: "3 3" }}
                          content={<ServiciosTooltip mesNombre={mesNombre} />}
                        />
                        <Area
                          type="monotone"
                          dataKey="conteo"
                          stroke="#1e3b8a"
                          strokeWidth={2.5}
                          fill="url(#serviciosGradient)"
                          activeDot={{ r: 4, stroke: "#1e3b8a", strokeWidth: 2, fill: "#ffffff" }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="reporte-mxmap-hint">
                    No se registraron servicios en {mesNombre} {anio}.
                  </p>
                )}
              </CardContent>
            </Card>

            <EstadosAtendidosCard
              distribucionEstado={distribucionEstado}
              className="reporte-mensual-main-estados"
              limit={10}
            />
          </div>

          <div className="reporte-mensual-grid-secondary">
            <div className="reporte-mensual-grid-item">
              <DistribucionGeneroDonut
                distribucionGenero={distribucionGenero}
                total={totalGenero}
                eyebrow="Géneros atendidos"
                totalLabel="Atendidos"
                emptyMessage="Sin datos de género para el periodo."
              />
            </div>

            <div className="reporte-mensual-grid-item">
              <DistribucionEtapaVidaList
                distribucionEtapaVida={distribucionEtapaVida}
                eyebrow="Distribución por etapa"
                emptyMessage="Sin datos de etapa para el periodo."
              />
            </div>
          </div>

        {loading ? (
          <p className="reporte-general-loading">
            Cargando indicadores de {mesNombre} {anio}...
          </p>
        ) : null}
      </>
    </article>
  );
}
