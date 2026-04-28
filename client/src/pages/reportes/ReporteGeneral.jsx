import { useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Cell, Pie, PieChart } from "recharts";
import { UserCheck, UserMinus, Users, X } from "lucide-react";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../../components/ui/chart";
import { useReporteGeneral } from "../../hooks/useReporteGeneral";
import MapaBeneficiariosPorEstado from "../../components/reportes/MapaBeneficiariosPorEstado";

function formatNumber(value) {
  return Number(value || 0).toLocaleString("es-MX");
}

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

function etapaShortLabel(key) {
  const k = String(key || "").toLowerCase();
  if (k.includes("infancia")) return "Infancia";
  if (k.includes("adolescencia")) return "Adolescencia";
  if (k.includes("adultez")) return "Adultez";
  if (k.includes("adulto_mayor") || k.includes("mayor")) return "Adulto mayor";
  return "Etapa";
}

export default function ReporteGeneral() {
  const estadosDialogRef = useRef(null);
  const { data, loading, error, refetch } = useReporteGeneral();
  const {
    totalBeneficiarios,
    beneficiariosActivos,
    beneficiariosInactivos,
    distribucionGenero,
    distribucionEtapaVida,
    distribucionEstado,
  } = data;

  const pieGenero = distribucionGenero
    .filter((item) => item.value > 0)
    .map((item) => ({
      key: item.key,
      name: GENDER_DISPLAY[item.key] ?? item.label,
      value: item.value,
      porcentaje: item.porcentaje,
      fill: GENDER_CHART_COLORS[item.key] ?? "#94a3b8",
    }));

  const generoChartConfig = pieGenero.reduce((acc, row) => {
    acc[row.key] = { label: row.name, color: row.fill };
    return acc;
  }, {});

  const estadosOrdenados = useMemo(() => {
    return [...distribucionEstado].sort((a, b) => {
      if (b.value !== a.value) return b.value - a.value;
      return a.label.localeCompare(b.label, "es", { sensitivity: "base" });
    });
  }, [distribucionEstado]);

  const sumaEstados = useMemo(
    () => distribucionEstado.reduce((acc, row) => acc + Number(row.value || 0), 0),
    [distribucionEstado],
  );

  function openEstadosDialog() {
    estadosDialogRef.current?.showModal();
  }

  function closeEstadosDialog() {
    estadosDialogRef.current?.close();
  }

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
              <UserCheck className="reporte-general-kpi-icon" strokeWidth={2} />
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

      <div className="reporte-general-bento">
        <Card className="reporte-general-panel reporte-general-bento-map">
          <CardHeader className="reporte-general-bento-header">
            <h2 className="reporte-general-bento-title">Cobertura por estado</h2>
            <button type="button" className="reporte-general-bento-link" onClick={openEstadosDialog}>
              Ver detalles &gt;
            </button>
          </CardHeader>
          <CardContent className="reporte-general-map-card-content">
            <MapaBeneficiariosPorEstado distribucionEstado={distribucionEstado} />
          </CardContent>
        </Card>

        <Card className="reporte-general-panel reporte-general-bento-gender">
          <CardHeader className="reporte-general-bento-gender-header">
            <p className="reporte-general-bento-eyebrow reporte-general-bento-eyebrow--centered">Distribución de género</p>
          </CardHeader>
          <CardContent className="reporte-general-bento-gender-content">
            {pieGenero.length ? (
              <div className="reporte-general-bento-gender-inner">
                <div className="reporte-general-bento-donut">
                  <ChartContainer config={generoChartConfig} className="reporte-general-chart reporte-general-chart-donut">
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
                    <p className="reporte-general-bento-donut-total">{formatCompact(totalBeneficiarios)}</p>
                    <p className="reporte-general-bento-donut-label">Total</p>
                  </div>
                </div>
                <div className="reporte-general-bento-gender-legend">
                  {pieGenero.map((row) => (
                    <div key={row.key} className="reporte-general-bento-legend-row">
                      <span className="reporte-general-bento-legend-dot" style={{ background: row.fill }} />
                      <span className="reporte-general-bento-legend-text">
                        <span className="reporte-general-bento-legend-name">{row.name}</span>
                        <span className="reporte-general-bento-legend-pct">{row.porcentaje}%</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="reporte-mxmap-hint">Sin datos de género para el periodo.</p>
            )}
          </CardContent>
        </Card>

        <Card className="reporte-general-panel reporte-general-bento-life">
          <CardHeader>
            <p className="reporte-general-bento-eyebrow">Etapa de vida</p>
          </CardHeader>
          <CardContent>
            <div className="reporte-general-bento-life-list">
              {distribucionEtapaVida.map((item) => (
                <div key={item.key} className="reporte-general-bento-life-row">
                  <span className="reporte-general-bento-life-name">{etapaShortLabel(item.key)}</span>
                  <span className="reporte-general-bento-life-pct">{item.porcentaje}%</span>
                  <div className="reporte-general-bento-life-bar-wrap">
                    <div
                      className="reporte-general-bento-life-bar-fill"
                      style={{ width: `${Math.min(100, Math.max(0, item.porcentaje))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {typeof document !== "undefined"
        ? createPortal(
            <dialog
              ref={estadosDialogRef}
              className="reporte-estados-dialog"
              aria-labelledby="reporte-estados-dialog-title"
            >
              <div className="reporte-estados-dialog-inner">
                <div className="reporte-estados-dialog-header">
                  <div>
                    <h3 id="reporte-estados-dialog-title" className="reporte-estados-dialog-title">
                      Beneficiarios por estado
                    </h3>
                    <p className="reporte-estados-dialog-sub">Conteo según domicilio registrado.</p>
                  </div>
                  <button type="button" className="reporte-estados-dialog-close" onClick={closeEstadosDialog} aria-label="Cerrar">
                    <X size={18} strokeWidth={2} />
                  </button>
                </div>
                <div className="reporte-estados-dialog-scroll">
                  <table className="reporte-estados-table">
                    <thead>
                      <tr>
                        <th scope="col">Estado</th>
                        <th scope="col" className="reporte-estados-col-num">
                          Beneficiarios
                        </th>
                        <th scope="col" className="reporte-estados-col-pct">
                          %
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {estadosOrdenados.length ? (
                        estadosOrdenados.map((row) => (
                          <tr key={row.key}>
                            <td>{row.label}</td>
                            <td className="reporte-estados-col-num">{formatNumber(row.value)}</td>
                            <td className="reporte-estados-col-pct">{row.porcentaje}%</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} style={{ textAlign: "center", color: "#64748b", padding: "1.25rem" }}>
                            No hay datos por estado para mostrar.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="reporte-estados-dialog-footer">
                  <span>
                    Suma por estado: <strong>{formatNumber(sumaEstados)}</strong>

                  </span>
                </div>
              </div>
            </dialog>,
            document.body,
          )
        : null}

      {loading ? <p className="reporte-general-loading">Sincronizando indicadores del tablero...</p> : null}
    </section>
  );
}
