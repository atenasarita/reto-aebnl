import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader } from "../../../ui/card";
import EstadosAtendidosCard from "../../EstadosAtendidosCard/EstadosAtendidosCard";
import ServiciosPorDiaTooltip from "../ServiciosPorDiaTooltip/ServiciosPorDiaTooltip";
import { METRICA_DEMOGRAFICOS } from "../reportePersonalizadoConstants";
import {
  GRANULARIDAD_SERVICIOS,
  tituloServiciosPorGranularidad,
} from "../reportePersonalizado.utils";
import "./PersonalizadoServiciosChartRow.css";

export default function PersonalizadoServiciosChartRow({
  metricas,
  serieServiciosVista,
  granularidadServicios,
  tieneServiciosSerie,
  distribEstadoVista,
  rangoLegible,
}) {
  const titulo = tituloServiciosPorGranularidad(granularidadServicios);
  const esDia = granularidadServicios === GRANULARIDAD_SERVICIOS.DIA;
  const esSemana = granularidadServicios === GRANULARIDAD_SERVICIOS.SEMANA;
  const esMes = granularidadServicios === GRANULARIDAD_SERVICIOS.MES;
  const nMeses = esMes ? serieServiciosVista.length : 0;

  const xAxisInterval =
    esSemana || (esMes && nMeses <= 18)
      ? 0
      : esDia
        ? "preserveStartEnd"
        : "preserveStartEnd";

  const chartCommon = (
    <>
      <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
      <XAxis
        dataKey="chartLabel"
        axisLine={false}
        tickLine={false}
        interval={xAxisInterval}
        minTickGap={esDia ? 28 : esSemana ? 0 : 8}
        tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
      />
      <YAxis
        axisLine={false}
        tickLine={false}
        tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
        width={36}
        allowDecimals={false}
      />
      <Tooltip
        cursor={
          esDia
            ? { stroke: "#94a3b8", strokeDasharray: "3 3" }
            : { fill: "rgba(30, 59, 138, 0.08)" }
        }
        content={<ServiciosPorDiaTooltip />}
      />
    </>
  );

  return (
    <div className="reporte-mensual-main-row reporte-personalizado-main-row">
      <Card className="reporte-mensual-trend">
        <CardHeader className="reporte-mensual-trend-header">
          <div>
            <h3 className="reporte-mensual-trend-title">{titulo}</h3>
          </div>
          {rangoLegible ? (
            <span className="reporte-personalizado-chart-rango">{rangoLegible}</span>
          ) : null}
        </CardHeader>
        <CardContent className="reporte-mensual-trend-content">
          {tieneServiciosSerie ? (
            <div className="reporte-mensual-trend-chart">
              <ResponsiveContainer width="100%" height="100%">
                {esDia ? (
                  <AreaChart
                    data={serieServiciosVista}
                    margin={{ top: 10, right: 16, bottom: 4, left: 0 }}
                  >
                    <defs>
                      <linearGradient id="serviciosGradientPersonalizado" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1e3b8a" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#1e3b8a" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    {chartCommon}
                    <Area
                      type="monotone"
                      dataKey="conteo"
                      stroke="#1e3b8a"
                      strokeWidth={2.5}
                      fill="url(#serviciosGradientPersonalizado)"
                      activeDot={{ r: 4, stroke: "#1e3b8a", strokeWidth: 2, fill: "#ffffff" }}
                    />
                  </AreaChart>
                ) : (
                  <BarChart
                    data={serieServiciosVista}
                    margin={{ top: 10, right: 16, bottom: 4, left: 0 }}
                    barCategoryGap="18%"
                  >
                    {chartCommon}
                    <Bar
                      dataKey="conteo"
                      fill="#1e3b8a"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={56}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="reporte-mxmap-hint">No se registraron servicios en el periodo seleccionado.</p>
          )}
        </CardContent>
      </Card>

      {metricas.has(METRICA_DEMOGRAFICOS) ? (
        <EstadosAtendidosCard
          distribucionEstado={distribEstadoVista}
          className="reporte-mensual-main-estados"
          limit={10}
        />
      ) : (
        <Card className="reporte-mensual-main-estados reporte-personalizado-side-placeholder shadcn-card">
          <CardHeader>
            <p className="reporte-general-bento-eyebrow">Estados atendidos</p>
          </CardHeader>
          <CardContent>
            <p className="reporte-mxmap-hint">
              Activa &quot;Datos demográficos&quot; para ver el desglose por estado.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function PersonalizadoSoloEstadosCard({ distribEstadoVista, limit }) {
  return <EstadosAtendidosCard distribucionEstado={distribEstadoVista} limit={limit} />;
}
