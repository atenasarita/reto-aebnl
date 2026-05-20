import { useMemo } from "react";
import { Card, CardContent, CardHeader } from "../../ui/card";
import "./EstadosAtendidosCard.css";

function formatNumber(value) {
  return Number(value || 0).toLocaleString("es-MX");
}

export default function EstadosAtendidosCard({
  distribucionEstado = [],
  className = "",
  title = "Estados atendidos",
  limit = 10,
}) {
  const estadosOrdenados = useMemo(() => {
    return [...distribucionEstado].sort((a, b) => {
      if (Number(b.value) !== Number(a.value)) return Number(b.value) - Number(a.value);
      return String(a.label).localeCompare(String(b.label), "es", { sensitivity: "base" });
    });
  }, [distribucionEstado]);

  const maxEstadoValue = useMemo(() => {
    return distribucionEstado.reduce((acc, row) => Math.max(acc, Number(row.value || 0)), 0);
  }, [distribucionEstado]);

  return (
    <Card className={`reporte-general-panel reporte-mensual-estados ${className}`.trim()}>
      <CardHeader>
        <p className="reporte-general-bento-eyebrow">{title}</p>
      </CardHeader>
      <CardContent>
        {estadosOrdenados.length ? (
          <div className="reporte-mensual-estados-list">
            {estadosOrdenados.slice(0, limit).map((row) => {
              const pct = maxEstadoValue
                ? Math.round((Number(row.value) / maxEstadoValue) * 100)
                : 0;
              return (
                <div key={row.key} className="reporte-mensual-estados-row">
                  <span className="reporte-mensual-estados-name">{row.label}</span>
                  <span className="reporte-mensual-estados-value">{formatNumber(row.value)}</span>
                  <div className="reporte-mensual-estados-bar-wrap">
                    <div
                      className="reporte-mensual-estados-bar-fill"
                      style={{ width: `${Math.min(100, Math.max(2, pct))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="reporte-mxmap-hint">Sin estados atendidos en el periodo.</p>
        )}
      </CardContent>
    </Card>
  );
}
