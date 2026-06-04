import { Card, CardContent } from "../../ui/card";
import "./IndicadorCard.css";

function formatNumber(value) {
  return Number(value || 0).toLocaleString("es-MX");
}

export default function IndicadorCard({
  label,
  value,
  displayValue,
  icon: Icon,
  iconVariant = "primary",
  numberVariant = "default",
}) {
  const shown = displayValue ?? formatNumber(value);
  const isCurrency = Boolean(displayValue);

  return (
    <Card className="reporte-general-kpi-card reporte-general-kpi-bento">
      <CardContent className="reporte-general-kpi-bento-inner">
        <div className="reporte-general-kpi-bento-copy">
          <p className="reporte-general-kpi-eyebrow">{label}</p>
          <p
            className={[
              "reporte-general-kpi-number",
              isCurrency ? "reporte-general-kpi-number--currency" : "",
              numberVariant !== "default"
                ? `reporte-general-kpi-number--${numberVariant}`
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {shown}
          </p>
        </div>
        <div
          className={`reporte-general-kpi-icon-wrap reporte-general-kpi-icon-wrap--${iconVariant}`}
          aria-hidden
        >
          <Icon className="reporte-general-kpi-icon" strokeWidth={2} />
        </div>
      </CardContent>
    </Card>
  );
}
