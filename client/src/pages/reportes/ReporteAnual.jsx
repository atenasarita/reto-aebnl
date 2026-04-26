import { useMemo, useState } from "react";

const MONTH_OPTIONS = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

export default function ReporteAnual() {
  const [modoPeriodo, setModoPeriodo] = useState("mensual");
  const [mes, setMes] = useState("01");
  const [anio, setAnio] = useState(String(new Date().getFullYear()));

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, index) => String(currentYear - index));
  }, []);

  return (
    <article className="reporte-placeholder reporte-general-card">
      <div className="reporte-card-head">
        <h2>Reporte por Período</h2>
        <span className="reporte-card-badge">Mensual / Anual</span>
      </div>

      <div className="reporte-periodo-switch" role="tablist" aria-label="Modo de periodo">
        <button
          type="button"
          className={modoPeriodo === "mensual" ? "is-active" : ""}
          onClick={() => setModoPeriodo("mensual")}
        >
          Mensual
        </button>
        <button
          type="button"
          className={modoPeriodo === "anual" ? "is-active" : ""}
          onClick={() => setModoPeriodo("anual")}
        >
          Anual
        </button>
      </div>

      <div className="reporte-periodo-filtros">
        {modoPeriodo === "mensual" ? (
          <>
            <label>
              Mes
              <select value={mes} onChange={(e) => setMes(e.target.value)}>
                {MONTH_OPTIONS.map((monthOption) => (
                  <option key={monthOption.value} value={monthOption.value}>
                    {monthOption.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Año
              <select value={anio} onChange={(e) => setAnio(e.target.value)}>
                {yearOptions.map((yearOption) => (
                  <option key={yearOption} value={yearOption}>
                    {yearOption}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : (
          <label>
            Año
            <select value={anio} onChange={(e) => setAnio(e.target.value)}>
              {yearOptions.map((yearOption) => (
                <option key={yearOption} value={yearOption}>
                  {yearOption}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <p className="reporte-periodo-hint">
        Usa esta sección para alternar entre vista mensual y anual del mismo reporte.
      </p>
    </article>
  );
}
