import { Card, CardContent } from "../../ui/card";
import "./IndicadorCard.css";

function formatNumber(value) {
  return Number(value || 0).toLocaleString("es-MX");
}

export default function IndicadorCard({
  label,
  value,
  displayValue,
  numberVariant = "default",
}) {
  const shown = displayValue ?? formatNumber(value);
  const isCurrency = Boolean(displayValue);

  return (
    <Card className="reporte-general-kpi-card reporte-general-kpi-stat">
      <CardContent className="reporte-general-kpi-stat-inner">
        <p className="reporte-general-kpi-stat-label">{label}</p>
        <p
          className={[
            "reporte-general-kpi-stat-value",
            isCurrency ? "reporte-general-kpi-stat-value--currency" : "",
            numberVariant !== "default"
              ? `reporte-general-kpi-stat-value--${numberVariant}`
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {shown}
        </p>
      </CardContent>
    </Card>
  );
}
