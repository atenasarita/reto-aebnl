import "./ReporteAnual.css";
import "../ReportesMensual/ReportesMensual.css";
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
import IndicadorCard from "../../../components/reportes/IndicadorCard/IndicadorCard";
import { useReporteAnual } from "../../../hooks/useReporteAnual";

const SERIE_SERVICIOS = "servicios";
const SERIE_NUEVOS = "nuevos";

function formatNumber(value) {
  return Number(value || 0).toLocaleString("es-MX");
}

function ServiciosPorMesTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  const value = payload[0]?.value ?? 0;
  return (
    <div className="reporte-mensual-chart-tooltip">
      <p className="reporte-mensual-chart-tooltip-label">Servicios</p>
      <p className="reporte-mensual-chart-tooltip-value">
        <strong>{row?.mesLabel ?? ""}</strong>
      </p>
      <p className="reporte-mensual-chart-tooltip-value">
        <strong>{formatNumber(value)}</strong> servicios
      </p>
    </div>
  );
}

function NuevosPorMesTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  const value = payload[0]?.value ?? 0;
  return (
    <div className="reporte-mensual-chart-tooltip">
      <p className="reporte-mensual-chart-tooltip-label">Nuevos beneficiarios</p>
      <p className="reporte-mensual-chart-tooltip-value">
        <strong>{row?.mesLabel ?? ""}</strong>
      </p>
      <p className="reporte-mensual-chart-tooltip-value">
        <strong>{formatNumber(value)}</strong> registros
      </p>
    </div>
  );
}

export default function ReporteAnual() {
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [serieMensual, setSerieMensual] = useState(SERIE_SERVICIOS);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, index) => currentYear - index);
  }, []);

  const { data, loading, error, refetch } = useReporteAnual(anio);
  const {
    porMes,
    nuevosBeneficiarios,
    beneficiariosAtendidos,
    serviciosPeriodo,
    distribucionGenero,
    distribucionEtapaVida,
    distribucionEstado,
  } = data;

  const totalGenero = useMemo(
    () => distribucionGenero.reduce((acc, row) => acc + Number(row.value || 0), 0),
    [distribucionGenero],
  );

  const tieneServiciosPorMes = porMes.some((d) => Number(d.servicios) > 0);
  const tieneNuevosPorMes = porMes.some((d) => Number(d.nuevosBeneficiarios) > 0);
  const mostrarServicios = serieMensual === SERIE_SERVICIOS;
  const tieneDatosSerie = mostrarServicios ? tieneServiciosPorMes : tieneNuevosPorMes;

  return (
    <article className="reporte-mensual-shell">
      <header className="reporte-mensual-header">
        <div>
          <h2 className="reporte-mensual-title">Reporte Anual de Operaciones</h2>
        </div>

        <div className="reporte-mensual-filters">
          <div className="reporte-periodo-switch" role="tablist" aria-label="Tipo de vista">
            <Link to="/reportes/mensual" className="reporte-periodo-switch-link">
              Mensual
            </Link>
            <button type="button" className="is-active">
              Anual
            </button>
          </div>

          <div className="reporte-mensual-selectors">
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
          <IndicadorCard label="Nuevos beneficiarios" value={nuevosBeneficiarios} icon={UserPlus} />
          <IndicadorCard label="Total atendidos" value={beneficiariosAtendidos} icon={Users} />
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
                <h3 className="reporte-mensual-trend-title">
                  {mostrarServicios ? "Servicios otorgados por mes" : "Nuevos beneficiarios por mes"}
                </h3>
              </div>
              <div className="reporte-anual-trend-controls">
                <div className="reporte-periodo-switch" role="group" aria-label="Serie de la gráfica">
                  <button
                    type="button"
                    className={mostrarServicios ? "is-active" : ""}
                    onClick={() => setSerieMensual(SERIE_SERVICIOS)}
                    aria-pressed={mostrarServicios}
                  >
                    Servicios
                  </button>
                  <button
                    type="button"
                    className={!mostrarServicios ? "is-active" : ""}
                    onClick={() => setSerieMensual(SERIE_NUEVOS)}
                    aria-pressed={!mostrarServicios}
                  >
                    Nuevos beneficiarios
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="reporte-mensual-trend-content">
              {tieneDatosSerie ? (
                <div className="reporte-mensual-trend-chart" key={serieMensual}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={porMes} margin={{ top: 10, right: 16, bottom: 8, left: 0 }}>
                      {mostrarServicios ? (
                        <defs>
                          <linearGradient id="serviciosGradientAnual" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1e3b8a" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="#1e3b8a" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                      ) : (
                        <defs>
                          <linearGradient id="nuevosGradientAnual" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0f766e" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="#0f766e" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                      )}
                      <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="mesLabel"
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        minTickGap={0}
                        tick={{ fill: "#64748b", fontSize: 9, fontWeight: 600 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                        width={36}
                        allowDecimals={false}
                      />
                      <Tooltip
                        cursor={{ stroke: "#94a3b8", strokeDasharray: "3 3" }}
                        content={
                          mostrarServicios ? <ServiciosPorMesTooltip /> : <NuevosPorMesTooltip />
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey={mostrarServicios ? "servicios" : "nuevosBeneficiarios"}
                        stroke={mostrarServicios ? "#1e3b8a" : "#0f766e"}
                        strokeWidth={2.5}
                        fill={mostrarServicios ? "url(#serviciosGradientAnual)" : "url(#nuevosGradientAnual)"}
                        activeDot={{
                          r: 4,
                          stroke: mostrarServicios ? "#1e3b8a" : "#0f766e",
                          strokeWidth: 2,
                          fill: "#ffffff",
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="reporte-mxmap-hint">
                  {mostrarServicios
                    ? `No se registraron servicios por mes en ${anio}.`
                    : `No se registraron nuevos beneficiarios por mes en ${anio}.`}
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
          <p className="reporte-general-loading">Cargando indicadores del año {anio}...</p>
        ) : null}
      </>
    </article>
  );
}
