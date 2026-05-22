import { BarChart3 } from "lucide-react";
import PersonalizadoMetricasBar from "../PersonalizadoMetricasBar/PersonalizadoMetricasBar";
import "../reportePersonalizado.ledger.chrome.css";
import "./PersonalizadoLedgerDimensiones.css";

export default function PersonalizadoLedgerDimensiones({
  muestraDemografia,
  metricas,
  onToggleMetrica,
  children,
}) {
  return (
    <section className="reporte-personalizado-ledger reporte-personalizado-ledger--dimensiones">
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
