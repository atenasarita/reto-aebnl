import { Cell, Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../../ui/chart";
import "./DistribucionGeneroDonut.css";

const GENDER_CHART_COLORS = {
  femenino: "#1e3b8a",
  masculino: "#C0DBFE",
  otro: "#CBD5E1",
};

const GENDER_DISPLAY = {
  femenino: "Mujeres",
  masculino: "Hombres",
  otro: "Otro",
};

function formatCompact(n) {
  const v = Number(n) || 0;
  if (v >= 1_000_000) {
    const s = (v / 1_000_000).toFixed(1);
    return `${s.endsWith(".0") ? s.slice(0, -2) : s}M`;
  }
  if (v >= 1000) {
    const s = (v / 1000).toFixed(1);
    return `${s.endsWith(".0") ? s.slice(0, -2) : s}k`;
  }
  return String(v);
}

export default function DistribucionGeneroDonut({
  distribucionGenero = [],
  total = 0,
  eyebrow = "Distribución de género",
  totalLabel = "Total",
  emptyMessage = "Sin datos de género para el periodo.",
}) {
  const pieGenero = distribucionGenero
    .filter((item) => Number(item.value) > 0)
    .map((item) => ({
      key: item.key,
      name: GENDER_DISPLAY[item.key] ?? item.label,
      value: Number(item.value) || 0,
      porcentaje: Number(item.porcentaje) || 0,
      fill: GENDER_CHART_COLORS[item.key] ?? "#94a3b8",
    }));

  const generoChartConfig = pieGenero.reduce((acc, row) => {
    acc[row.key] = { label: row.name, color: row.fill };
    return acc;
  }, {});

  return (
    <Card className="reporte-general-panel reporte-general-bento-gender">
      <CardHeader className="reporte-general-bento-gender-header">
        <p className="reporte-general-bento-eyebrow reporte-general-bento-eyebrow--centered">
          {eyebrow}
        </p>
      </CardHeader>
      <CardContent className="reporte-general-bento-gender-content">
        {pieGenero.length ? (
          <div className="reporte-general-bento-gender-inner">
            <div className="reporte-general-bento-donut">
              <ChartContainer
                config={generoChartConfig}
                className="reporte-general-chart reporte-general-chart-donut"
              >
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={pieGenero}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="62%"
                    outerRadius="88%"
                    strokeWidth={2}
                    stroke="#ffffff"
                  >
                    {pieGenero.map((entry) => (
                      <Cell key={entry.key} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="reporte-general-bento-donut-center">
                <p className="reporte-general-bento-donut-total">
                  {formatCompact(total)}
                </p>
                <p className="reporte-general-bento-donut-label">{totalLabel}</p>
              </div>
            </div>
            <div className="reporte-general-bento-gender-legend">
              {pieGenero.map((row) => (
                <div key={row.key} className="reporte-general-bento-legend-row">
                  <span
                    className="reporte-general-bento-legend-dot"
                    style={{ background: row.fill }}
                  />
                  <span className="reporte-general-bento-legend-text">
                    <span className="reporte-general-bento-legend-name">
                      {row.name}
                    </span>
                    <span className="reporte-general-bento-legend-pct">
                      {row.porcentaje}%
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="reporte-mxmap-hint">{emptyMessage}</p>
        )}
      </CardContent>
    </Card>
  );
}
