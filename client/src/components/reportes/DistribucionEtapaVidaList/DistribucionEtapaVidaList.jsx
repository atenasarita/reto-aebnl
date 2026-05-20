import { Card, CardContent, CardHeader } from "../../ui/card";
import "./DistribucionEtapaVidaList.css";

function etapaShortLabel(key) {
  const k = String(key || "").toLowerCase();
  if (k.includes("infancia")) return "Infancia";
  if (k.includes("adolescencia")) return "Adolescencia";
  if (k.includes("adultez")) return "Adultez";
  if (k.includes("adulto_mayor") || k.includes("mayor")) return "Adulto mayor";
  return "Etapa";
}

export default function DistribucionEtapaVidaList({
  distribucionEtapaVida = [],
  eyebrow = "Etapa de vida",
  emptyMessage = "Sin datos de etapa de vida para el periodo.",
}) {
  const hasData = distribucionEtapaVida.some((item) => Number(item.value) > 0);

  return (
    <Card className="reporte-general-panel reporte-general-bento-life">
      <CardHeader>
        <p className="reporte-general-bento-eyebrow">{eyebrow}</p>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="reporte-general-bento-life-list">
            {distribucionEtapaVida.map((item) => (
              <div key={item.key} className="reporte-general-bento-life-row">
                <span className="reporte-general-bento-life-name">
                  {etapaShortLabel(item.key)}
                </span>
                <span className="reporte-general-bento-life-pct">
                  {Number(item.porcentaje) || 0}%
                </span>
                <div className="reporte-general-bento-life-bar-wrap">
                  <div
                    className="reporte-general-bento-life-bar-fill"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, Number(item.porcentaje) || 0)
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="reporte-mxmap-hint">{emptyMessage}</p>
        )}
      </CardContent>
    </Card>
  );
}
