import { Card, CardContent } from "../../../ui/card";
import DistribucionGeneroDonut from "../../DistribucionGeneroDonut/DistribucionGeneroDonut";
import DistribucionEtapaVidaList from "../../DistribucionEtapaVidaList/DistribucionEtapaVidaList";
import "./PersonalizadoDemograficosGrid.css";

export default function PersonalizadoDemograficosGrid({
  distribGeneroVista,
  distribEtapaVista,
  totalGeneroFiltrado,
}) {
  return (
    <div className="reporte-mensual-grid-secondary reporte-personalizado-dem-grid">
      <div className="reporte-mensual-grid-item">
        {distribGeneroVista.length ? (
          <DistribucionGeneroDonut
            distribucionGenero={distribGeneroVista}
            total={totalGeneroFiltrado}
            eyebrow="Género (atendidos)"
            totalLabel="Atendidos"
            emptyMessage="Sin datos de género con los filtros actuales."
          />
        ) : (
          <Card className="shadcn-card reporte-personalizado-empty-card">
            <CardContent>
              <p className="reporte-mxmap-hint">
                No hay categorías de género seleccionadas o los conteos son cero.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="reporte-mensual-grid-item">
        {distribEtapaVista.length ? (
          <DistribucionEtapaVidaList
            distribucionEtapaVida={distribEtapaVista}
            eyebrow="Etapa de vida"
            emptyMessage="Sin datos de etapa con los filtros actuales."
          />
        ) : (
          <Card className="shadcn-card reporte-personalizado-empty-card">
            <CardContent>
              <p className="reporte-mxmap-hint">No hay etapas seleccionadas o los conteos son cero.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
