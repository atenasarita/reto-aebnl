import { Card, CardContent } from "../../ui/card";
import "./IndicadorCard.css";

function formatNumber(value) {
  return Number(value || 0).toLocaleString("es-MX");
}

export default function IndicadorCard({
  label,
  value,
  icon: Icon,
  iconVariant = "primary",
}) {
  return (
    <Card className="reporte-general-kpi-card reporte-general-kpi-bento">
      <CardContent className="reporte-general-kpi-bento-inner">
        <div className="reporte-general-kpi-bento-copy">
          <p className="reporte-general-kpi-eyebrow">{label}</p>
          <p className="reporte-general-kpi-number">{formatNumber(value)}</p>
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
