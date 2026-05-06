import { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import "./MapaBeneficiariosPorEstado.css";

const COLOR_ALTA = "#1e3b8a";
const COLOR_MEDIA = "#64748b";
const COLOR_EN_PROGRESO = "#bfdbfe";
const COLOR_SIN_COBERTURA = "#e2e8f0";

function fillForBucket(value, max) {
  if (value <= 0) return COLOR_SIN_COBERTURA;
  if (max <= 0) return COLOR_SIN_COBERTURA;
  const t1 = max / 3;
  const t2 = (2 * max) / 3;
  if (value >= t2) return COLOR_ALTA;
  if (value >= t1) return COLOR_MEDIA;
  return COLOR_EN_PROGRESO;
}

function normalizeMatch(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const GEO_URL = `${import.meta.env.BASE_URL}geo/mexico-states.geojson`;

export default function MapaBeneficiariosPorEstado({ distribucionEstado = [] }) {
  const [hover, setHover] = useState(null);

  const byEstado = useMemo(() => {
    const map = new Map();
    distribucionEstado.forEach((row) => {
      map.set(normalizeMatch(row.label), row);
    });
    return map;
  }, [distribucionEstado]);

  const maxVal = useMemo(() => {
    return distribucionEstado.reduce((m, r) => Math.max(m, r.value), 0);
  }, [distribucionEstado]);

  return (
    <div className="reporte-mxmap">
      <div className="reporte-mxmap-frame reporte-mxmap-frame--legend">
        <ComposableMap projection="geoMercator" projectionConfig={{ center: [-102, 23.5], scale: 1080 }} width={800} height={420}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const name = geo.properties?.name || "";
                const row = byEstado.get(normalizeMatch(name));
                const value = row?.value ?? 0;
                const fill = fillForBucket(value, maxVal);
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => setHover({ name, value, label: row?.label ?? name })}
                    onMouseLeave={() => setHover(null)}
                    style={{
                      default: {
                        fill,
                        stroke: "#ffffff",
                        strokeWidth: 0.55,
                        outline: "none",
                      },
                      hover: {
                        fill: "#2563eb",
                        stroke: "#ffffff",
                        strokeWidth: 0.75,
                        outline: "none",
                      },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
        <div className="reporte-mxmap-floating-legend" role="list" aria-label="Leyenda de cobertura por estado">
          <div className="reporte-mxmap-floating-legend-row" role="listitem">
            <span className="reporte-mxmap-floating-dot" style={{ background: COLOR_ALTA }} />
            <span>Alta cobertura</span>
          </div>
          <div className="reporte-mxmap-floating-legend-row" role="listitem">
            <span className="reporte-mxmap-floating-dot" style={{ background: COLOR_MEDIA }} />
            <span>Media cobertura</span>
          </div>
          <div className="reporte-mxmap-floating-legend-row" role="listitem">
            <span className="reporte-mxmap-floating-dot" style={{ background: COLOR_EN_PROGRESO }} />
            <span>Baja cobertura</span>
          </div>
          <div className="reporte-mxmap-floating-legend-row" role="listitem">
            <span className="reporte-mxmap-floating-dot" style={{ background: COLOR_SIN_COBERTURA }} />
            <span>Sin cobertura</span>
          </div>
        </div>
      </div>
      <div className="reporte-mxmap-footer reporte-mxmap-footer--solo-hint">
        <p className="reporte-mxmap-hint">
          {hover ? (
            <>
              <strong>{hover.label}</strong>
              {": "}
              {hover.value.toLocaleString("es-MX")} beneficiarios
            </>
          ) : (
            "Pasa el cursor sobre un estado para ver el total."
          )}
        </p>
      </div>
    </div>
  );
}
