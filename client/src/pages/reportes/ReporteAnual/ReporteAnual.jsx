import "./ReporteAnual.css";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../../../components/ui/card";

export default function ReporteAnual() {
  const [anio, setAnio] = useState(new Date().getFullYear());
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, index) => currentYear - index);
  }, []);

  return (
    <article className="reporte-anual-shell">
      <header className="reporte-anual-header">
        <h2 className="reporte-anual-title">Reporte Anual de Operaciones</h2>
        <div className="reporte-anual-controls">
          <div className="reporte-periodo-switch" role="tablist" aria-label="Tipo de vista">
            <Link to="/reportes/mensual" className="reporte-periodo-switch-link">
              Mensual
            </Link>
            <button type="button" className="is-active">
              Anual
            </button>
          </div>

          <div className="reporte-anual-selectors">
            <label className="reporte-anual-select">
              <span>Año</span>
              <select value={anio} onChange={(e) => setAnio(Number(e.target.value))}>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </header>

      <Card className="reporte-anual-placeholder">
        <CardContent>
          <p>La vista anual se encuentra en construcción para el año {anio}.</p>
        </CardContent>
      </Card>
    </article>
  );
}
