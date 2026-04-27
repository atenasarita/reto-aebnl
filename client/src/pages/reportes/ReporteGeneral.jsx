import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { CircleCheck, UserMinus, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../components/ui/chart";
import { useReporteGeneral } from "../../hooks/useReporteGeneral";

function formatNumber(value) {
  return Number(value || 0).toLocaleString("es-MX");
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

  const generoConfig = {
    value: { label: "Beneficiarios", color: "#2563eb" },
  };

  const etapasConfig = {
    value: { label: "Beneficiarios", color: "#1d4ed8" },
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

      <div className="reporte-general-kpi-grid">
        <Card className="reporte-general-kpi-card reporte-general-kpi-bento">
          <CardContent className="reporte-general-kpi-bento-inner">
            <div className="reporte-general-kpi-bento-copy">
              <p className="reporte-general-kpi-eyebrow">Total de beneficiarios</p>
              <p className="reporte-general-kpi-number">{formatNumber(totalBeneficiarios)}</p>
            </div>
            <div className="reporte-general-kpi-icon-wrap reporte-general-kpi-icon-wrap--primary" aria-hidden>
              <Users className="reporte-general-kpi-icon" strokeWidth={2} />
            </div>
          </CardContent>
        </Card>

        <Card className="reporte-general-kpi-card reporte-general-kpi-bento">
          <CardContent className="reporte-general-kpi-bento-inner">
            <div className="reporte-general-kpi-bento-copy">
              <p className="reporte-general-kpi-eyebrow">Beneficiarios activos</p>
              <p className="reporte-general-kpi-number">{formatNumber(beneficiariosActivos)}</p>
            </div>
            <div className="reporte-general-kpi-icon-wrap reporte-general-kpi-icon-wrap--primary" aria-hidden>
              <CircleCheck className="reporte-general-kpi-icon" strokeWidth={2} />
            </div>
          </CardContent>
        </Card>

        <Card className="reporte-general-kpi-card reporte-general-kpi-bento">
          <CardContent className="reporte-general-kpi-bento-inner">
            <div className="reporte-general-kpi-bento-copy">
              <p className="reporte-general-kpi-eyebrow">Beneficiarios inactivos</p>
              <p className="reporte-general-kpi-number">{formatNumber(beneficiariosInactivos)}</p>
            </div>
            <div className="reporte-general-kpi-icon-wrap reporte-general-kpi-icon-wrap--secondary" aria-hidden>
              <UserMinus className="reporte-general-kpi-icon" strokeWidth={2} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="reporte-general-panel">
        <CardHeader>
          <CardTitle>Distribución de género</CardTitle>
          <CardDescription>Composición actual por género reportado.</CardDescription>
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
          <CardDescription>Segmentación etaria del padrón actual.</CardDescription>
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

      {loading ? <p className="reporte-general-loading">Sincronizando indicadores del tablero...</p> : null}
    </section>
  );
}
