import PropTypes from "prop-types";
import { BarChart3 } from "lucide-react";
import PersonalizadoMetricasBar from "../PersonalizadoMetricasBar/PersonalizadoMetricasBar";
import "../reportePersonalizado.ledger.chrome.css";
import "./PersonalizadoLedgerDimensiones.css";

function PersonalizadoLedgerDimensiones({
  variant = "inline",
  muestraDemografia,
  metricas,
  onToggleMetrica,
  children,
}) {
  const variantClass =
    variant === "panel"
      ? " reporte-personalizado-ledger--panel"
      : "";

  return (
    <section className={`reporte-personalizado-ledger reporte-personalizado-ledger--dimensiones${variantClass}`}>
      <header className="reporte-personalizado-ledger-toolbar reporte-personalizado-ledger-toolbar--stretch">
        <div className="reporte-personalizado-ledger-toolbar-lead">
          <BarChart3 className="reporte-personalizado-ledger-toolbar-icon" strokeWidth={2} aria-hidden />
          <h2 className="reporte-personalizado-ledger-toolbar-title">Dimensiones de datos demográficos</h2>
        </div>
        <PersonalizadoMetricasBar
          metricas={metricas}
          onToggleMetrica={onToggleMetrica}
          className="reporte-personalizado-metrics-bar--ledger"
        />
      </header>
      <div className="reporte-personalizado-ledger-body-flat">
        {muestraDemografia ? (
          children
        ) : (
          <p className="reporte-personalizado-ledger-off">
            Activa &quot;Datos Demográficos&quot; para configurar género, etapa de vida y estados por región.
          </p>
        )}
      </div>
    </section>
  );
}

PersonalizadoLedgerDimensiones.propTypes = {
  variant: PropTypes.string,
  muestraDemografia: PropTypes.bool,
  metricas: PropTypes.instanceOf(Set).isRequired,
  onToggleMetrica: PropTypes.func.isRequired,
  children: PropTypes.node,
};

export default PersonalizadoLedgerDimensiones;
