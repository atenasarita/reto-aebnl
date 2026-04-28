import { useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { UserCheck, UserMinus, Users, X } from "lucide-react";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { useReporteGeneral } from "../../../hooks/useReporteGeneral";
import MapaBeneficiariosPorEstado from "../../../components/reportes/MapaBeneficiariosPorEstado/MapaBeneficiariosPorEstado";
import DistribucionGeneroDonut from "../../../components/reportes/DistribucionGeneroDonut/DistribucionGeneroDonut";
import DistribucionEtapaVidaList from "../../../components/reportes/DistribucionEtapaVidaList/DistribucionEtapaVidaList";
import IndicadorCard from "../../../components/reportes/IndicadorCard/IndicadorCard";
import "./ReporteGeneral.css";

function formatNumber(value) {
  return Number(value || 0).toLocaleString("es-MX");
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
        <IndicadorCard label="Total de beneficiarios" value={totalBeneficiarios} icon={Users} />
        <IndicadorCard label="Beneficiarios activos" value={beneficiariosActivos} icon={UserCheck} />
        <IndicadorCard
          label="Beneficiarios inactivos"
          value={beneficiariosInactivos}
          icon={UserMinus}
          iconVariant="secondary"
        />
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

        <DistribucionGeneroDonut
          distribucionGenero={distribucionGenero}
          total={totalBeneficiarios}
        />

        <DistribucionEtapaVidaList distribucionEtapaVida={distribucionEtapaVida} />
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
