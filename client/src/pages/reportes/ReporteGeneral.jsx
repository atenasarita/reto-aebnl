import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../../components/ui/chart";
import { useReporteGeneral } from "../../hooks/useReporteGeneral";

function getPercent(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export default function ReporteGeneral() {
  const { data, loading, error, refetch } = useReporteGeneral();
  const {
    totalBeneficiarios,
    beneficiariosActivos,
    beneficiariosInactivos,
    distribucionGenero,
    distribucionEtapaVida,
  } = data;

  const activosPorcentaje = getPercent(beneficiariosActivos, totalBeneficiarios);
  const dataEstatus = [{ tramo: "Beneficiarios", activos: beneficiariosActivos, inactivos: beneficiariosInactivos }];

  const generoConfig = {
    value: { label: "Beneficiarios", color: "#2563eb" },
  };

  const etapasConfig = {
    value: { label: "Beneficiarios", color: "#1d4ed8" },
  };

  const estatusConfig = {
    activos: { label: "Activos", color: "#2563eb" },
    inactivos: { label: "Inactivos", color: "#93c5fd" },
  };

  return (
    <section className="reporte-general-dashboard">
      {error ? (
        <div className="reporte-general-alert" role="alert">
          <p>{error}</p>
          <button type="button" onClick={refetch}>
            Reintentar
          </button>
        </div>
      ) : null}

      <Card className="reporte-general-panel">
        <CardHeader>
          <CardTitle>Distribución de género</CardTitle>
          <CardDescription>Beneficiarios por sexo registrado.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={generoConfig} className="reporte-general-chart reporte-general-chart-compact">
            <BarChart data={distribucionGenero} layout="vertical" margin={{ left: 6, right: 8 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                width={90}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#334155", fontSize: 12, fontWeight: 600 }}
              />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="value" name="Beneficiarios" fill="var(--color-value)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ChartContainer>
          <div className="reporte-general-percent-list">
            {distribucionGenero.map((item) => (
              <div key={item.key} className="reporte-general-percent-row">
                <span>{item.label}</span>
                <strong>{item.porcentaje}%</strong>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="reporte-general-panel">
        <CardHeader>
          <CardTitle>Distribución por etapa de vida</CardTitle>
          <CardDescription>Segmentación actual de beneficiarios.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={etapasConfig} className="reporte-general-chart">
            <BarChart data={distribucionEtapaVida} margin={{ left: 0, right: 10 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#334155", fontSize: 12 }}
                interval={0}
              />
              <YAxis axisLine={false} tickLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" name="Beneficiarios" fill="var(--color-value)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
          <div className="reporte-general-percent-list">
            {distribucionEtapaVida.map((item) => (
              <div key={item.key} className="reporte-general-percent-row">
                <span>{item.label}</span>
                <strong>{item.porcentaje}%</strong>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="reporte-general-stat-card">
        <CardHeader>
          <CardTitle>Total de beneficiarios</CardTitle>
          <CardDescription>Conteo general del padrón.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="reporte-general-stat-value">{totalBeneficiarios.toLocaleString("es-MX")}</p>
        </CardContent>
      </Card>

      <Card className="reporte-general-stat-card">
        <CardHeader>
          <CardTitle>Beneficiarios activos / inactivos</CardTitle>
          <CardDescription>Estatus operativo actual.</CardDescription>
        </CardHeader>
        <CardContent className="reporte-general-status-content">
          <div className="reporte-general-status-row">
            <span>Activos</span>
            <strong>{beneficiariosActivos.toLocaleString("es-MX")}</strong>
          </div>
          <div className="reporte-general-status-row">
            <span>Inactivos</span>
            <strong>{beneficiariosInactivos.toLocaleString("es-MX")}</strong>
          </div>

          <ChartContainer config={estatusConfig} className="reporte-general-chart reporte-general-chart-compact">
            <BarChart data={dataEstatus} margin={{ left: 0, right: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="tramo" hide />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="activos" name="Activos" stackId="estado" fill="var(--color-activos)" />
              <Bar dataKey="inactivos" name="Inactivos" stackId="estado" fill="var(--color-inactivos)" />
            </BarChart>
          </ChartContainer>
          <p className="reporte-general-status-caption">{activosPorcentaje}% del padrón está activo.</p>
        </CardContent>
      </Card>

      {loading ? <p className="reporte-general-loading">Cargando datos del reporte general...</p> : null}
    </section>
  );
}
