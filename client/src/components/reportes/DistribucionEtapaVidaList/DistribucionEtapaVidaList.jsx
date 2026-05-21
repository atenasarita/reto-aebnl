import { useId } from "react";
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
  getRowLabel,
  listAriaLabel,
  barFillClassName = "",
}) {
  const eyebrowId = useId();
  const hasData = distribucionEtapaVida.some((item) => Number(item.value) > 0);
  const resolveLabel = getRowLabel ?? ((item) => etapaShortLabel(item.key));
  const listLabel = listAriaLabel ?? eyebrow;

  return (
    <Card className="reporte-general-panel reporte-general-bento-life">
      <CardHeader>
        <p className="reporte-general-bento-eyebrow" id={eyebrowId}>
          {eyebrow}
        </p>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div
            className="reporte-general-bento-life-list"
            role="list"
            aria-labelledby={eyebrowId}
          >
            {distribucionEtapaVida.map((item) => {
              const pct = Math.min(100, Math.max(0, Number(item.porcentaje) || 0));
              const rowId = `${eyebrowId}-row-${String(item.key).replace(/\s+/g, "-")}`;
              return (
                <div key={item.key} className="reporte-general-bento-life-row" role="listitem">
                  <span className="reporte-general-bento-life-name" id={rowId}>
                    {resolveLabel(item)}
                  </span>
                  <span className="reporte-general-bento-life-pct" aria-hidden="true">
                    {pct}%
                  </span>
                  <div className="reporte-general-bento-life-bar-wrap">
                    <div
                      className={`reporte-general-bento-life-bar-fill ${barFillClassName}`.trim()}
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-labelledby={rowId}
                      aria-valuetext={`${resolveLabel(item)}: ${pct} por ciento`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="reporte-mxmap-hint" role="status">
            {emptyMessage}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
