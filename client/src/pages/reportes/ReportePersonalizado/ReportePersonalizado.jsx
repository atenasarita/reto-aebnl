import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import PersonalizadoDemograficosGrid from "../../../components/reportes/ReportePersonalizado/PersonalizadoDemograficosGrid/PersonalizadoDemograficosGrid";
import PersonalizadoFiltrosPanel from "../../../components/reportes/ReportePersonalizado/PersonalizadoFiltrosPanel/PersonalizadoFiltrosPanel";
import PersonalizadoKpiSection from "../../../components/reportes/ReportePersonalizado/PersonalizadoKpiSection/PersonalizadoKpiSection";
import PersonalizadoRangoFechasCard from "../../../components/reportes/ReportePersonalizado/PersonalizadoRangoFechasCard/PersonalizadoRangoFechasCard";
import PersonalizadoResultadosDivider from "../../../components/reportes/ReportePersonalizado/PersonalizadoResultadosDivider/PersonalizadoResultadosDivider";
import PersonalizadoServiciosChartRow, {
  PersonalizadoSoloEstadosCard,
} from "../../../components/reportes/ReportePersonalizado/PersonalizadoServiciosChartRow/PersonalizadoServiciosChartRow";
import ReportePersonalizadoShell from "../../../components/reportes/ReportePersonalizado/ReportePersonalizadoShell/ReportePersonalizadoShell";
import ReportesLoading from "../../../components/reportes/ReportesLoading/ReportesLoading";
import {
  METRICA_DEMOGRAFICOS,
  METRICA_NUEVOS,
  METRICA_SERVICIOS,
} from "../../../components/reportes/ReportePersonalizado/reportePersonalizadoConstants";
import {
  construirSerieServiciosVista,
  defaultRangoMesActual,
  filtrarDistribucionPorClaves,
  formatRangoLegible,
  esRangoFechaValido,
  resolverGranularidadServicios,
  resolverSeleccion,
  textoMetricas,
  tituloServiciosPorGranularidad,
} from "../../../components/reportes/ReportePersonalizado/reportePersonalizado.utils";
import {
  buildCsvReportePersonalizado,
  exportTimestampSlug,
  sanitizeFilenamePart,
  triggerCsvDownload,
} from "../../../utils/reportesCsvExport";
import { useReportePersonalizado } from "../../../hooks/useReportePersonalizado";


function toggleSelectionValue(prev, items, key, resetWhenAllSelected = true) {
  const all = new Set(items.map((row) => row.key));
  const current = prev === null ? new Set(all) : new Set(prev);

  if (current.has(key)) {
    current.delete(key);
  } else {
    current.add(key);
  }

  const allSelected = current.size === all.size && [...all].every((itemKey) => current.has(itemKey));

  if (resetWhenAllSelected && allSelected) {
    return null;
  }

  return current;
}

export default function ReportePersonalizado() {
  const { registerCsvExportHandler } = useOutletContext() || {};
  const def = useMemo(() => defaultRangoMesActual(), []);
  const [desdeDraft, setDesdeDraft] = useState(def.desde);
  const [hastaDraft, setHastaDraft] = useState(def.hasta);
  const [aplicadoDesde, setAplicadoDesde] = useState("");
  const [aplicadoHasta, setAplicadoHasta] = useState("");
  const [errorRango, setErrorRango] = useState("");

  const [metricas, setMetricas] = useState(
    () => new Set([METRICA_SERVICIOS, METRICA_NUEVOS, METRICA_DEMOGRAFICOS]),
  );
  const [generosSel, setGenerosSel] = useState(null);
  const [etapasSel, setEtapasSel] = useState(null);
  const [estadosSel, setEstadosSel] = useState(null);
  const [filtrosPanelAbierto, setFiltrosPanelAbierto] = useState(false);
  const prevHayDatosRef = useRef(false);

  const { data, loading, error, refetch } = useReportePersonalizado(aplicadoDesde, aplicadoHasta);

  const generosEfectivos = useMemo(
    () => resolverSeleccion(data.distribucionGenero, generosSel),
    [data.distribucionGenero, generosSel],
  );
  const etapasEfectivas = useMemo(
    () => resolverSeleccion(data.distribucionEtapaVida, etapasSel),
    [data.distribucionEtapaVida, etapasSel],
  );
  const estadosEfectivos = useMemo(
    () => resolverSeleccion(data.distribucionEstado, estadosSel),
    [data.distribucionEstado, estadosSel],
  );

  const distribGeneroVista = useMemo(
    () => filtrarDistribucionPorClaves(data.distribucionGenero, generosEfectivos),
    [data.distribucionGenero, generosEfectivos],
  );
  const distribEtapaVista = useMemo(
    () => filtrarDistribucionPorClaves(data.distribucionEtapaVida, etapasEfectivas),
    [data.distribucionEtapaVida, etapasEfectivas],
  );
  const distribEstadoVista = useMemo(
    () => filtrarDistribucionPorClaves(data.distribucionEstado, estadosEfectivos),
    [data.distribucionEstado, estadosEfectivos],
  );

  const totalGeneroFiltrado = useMemo(
    () => distribGeneroVista.reduce((acc, row) => acc + Number(row.value || 0), 0),
    [distribGeneroVista],
  );

  const granularidadServicios = useMemo(
    () => resolverGranularidadServicios(aplicadoDesde, aplicadoHasta),
    [aplicadoDesde, aplicadoHasta],
  );

  const serieServiciosVista = useMemo(
    () => construirSerieServiciosVista(data.serviciosPorDia, granularidadServicios),
    [data.serviciosPorDia, granularidadServicios],
  );

  const tieneServiciosSerie = serieServiciosVista.some((d) => Number(d.conteo) > 0);

  const periodoAplicado = Boolean(aplicadoDesde && aplicadoHasta);

  const hayDatos = periodoAplicado;

  const toggleMetrica = useCallback((id) => {
    setMetricas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size <= 1) return prev;
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleGenero = useCallback((key) => {
    setGenerosSel((prev) => toggleSelectionValue(prev, data.distribucionGenero, key));
  }, [data.distribucionGenero]);

  const toggleEtapa = useCallback((key) => {
    setEtapasSel((prev) => toggleSelectionValue(prev, data.distribucionEtapaVida, key));
  }, [data.distribucionEtapaVida]);

  const toggleEstado = useCallback((key) => {
    setEstadosSel((prev) => toggleSelectionValue(prev, data.distribucionEstado, key));
  }, [data.distribucionEstado]);

  const aplicarFiltros = useCallback(() => {
    setErrorRango("");
    if (!esRangoFechaValido(desdeDraft, hastaDraft)) {
      setErrorRango(
        'Rango inv\u00e1lido: comprueba que \u00abdesde\u00bb no sea posterior a \u00abhasta\u00bb.',
      );
      return;
    }
    setAplicadoDesde(desdeDraft);
    setAplicadoHasta(hastaDraft);
  }, [desdeDraft, hastaDraft]);

  const metricasTieneServicios = metricas.has(METRICA_SERVICIOS);
  const metricasTieneNuevos = metricas.has(METRICA_NUEVOS);
  const metricasTieneDemo = metricas.has(METRICA_DEMOGRAFICOS);
  const granularidadLabel = tituloServiciosPorGranularidad(granularidadServicios);

  useEffect(() => {
    if (!registerCsvExportHandler) return undefined;
    registerCsvExportHandler(() => {
      if (!hayDatos) {
        globalThis.alert("Aplica primero el periodo en las fechas y pulsa «Generar reporte».");
        return;
      }
      const csv = buildCsvReportePersonalizado({
        desde: aplicadoDesde,
        hasta: aplicadoHasta,
        filtrosMetricasTexto: textoMetricas(metricas),
        metricasTieneServicios,
        metricasTieneNuevos,
        metricasTieneDemo,
        data,
        distribGeneroVista,
        distribEtapaVista,
        distribEstadoVista,
        serieServiciosVista,
        granularidadLabel,
      });
      const desdePart = sanitizeFilenamePart(aplicadoDesde || "desde");
      const hastaPart = sanitizeFilenamePart(aplicadoHasta || "hasta");
      triggerCsvDownload(
        `reporte_personalizado_${desdePart}_${hastaPart}_${exportTimestampSlug()}.csv`,
        csv,
      );
    });
    return () => registerCsvExportHandler(null);
  }, [
    aplicadoDesde,
    aplicadoHasta,
    hayDatos,
    data,
    distribEstadoVista,
    distribEtapaVista,
    distribGeneroVista,
    granularidadLabel,
    metricas,
    metricasTieneDemo,
    metricasTieneNuevos,
    metricasTieneServicios,
    registerCsvExportHandler,
    serieServiciosVista,
  ]);

  const muestraDemo = metricas.has(METRICA_DEMOGRAFICOS);

  const muestraServicios = metricas.has(METRICA_SERVICIOS);
  const muestraSoloEstados = !muestraServicios && metricas.has(METRICA_DEMOGRAFICOS);

  useEffect(() => {
    if (hayDatos && !prevHayDatosRef.current) {
      setFiltrosPanelAbierto(true);
    }
    prevHayDatosRef.current = hayDatos;
  }, [hayDatos]);

  return (
    <ReportePersonalizadoShell>
      <PersonalizadoRangoFechasCard
        desdeDraft={desdeDraft}
        hastaDraft={hastaDraft}
        onDesdeChange={setDesdeDraft}
        onHastaChange={setHastaDraft}
        errorRango={errorRango}
        onGenerarReporte={aplicarFiltros}
        onAbrirFiltros={hayDatos ? () => setFiltrosPanelAbierto((prev) => !prev) : undefined}
        filtrosAbiertos={filtrosPanelAbierto}
        hayReporte={hayDatos}
      />

      {error ? (
        <div className="reporte-general-alert" role="alert">
          <p>{error}</p>
          <button type="button" onClick={refetch}>
            Reintentar
          </button>
        </div>
      ) : null}

      {hayDatos ? (
        <>
          <PersonalizadoFiltrosPanel
            open={filtrosPanelAbierto}
            onOpenChange={setFiltrosPanelAbierto}
            muestraDemografia={muestraDemo}
            metricas={metricas}
            onToggleMetrica={toggleMetrica}
            hayDatos={hayDatos}
            distribucionEstado={data.distribucionEstado}
            generosEfectivos={generosEfectivos}
            etapasEfectivas={etapasEfectivas}
            estadosEfectivos={estadosEfectivos}
            onToggleGenero={toggleGenero}
            onToggleEtapa={toggleEtapa}
            onToggleEstado={toggleEstado}
          />

          <PersonalizadoResultadosDivider />

          {loading ? (
            <ReportesLoading
              message="Cargando datos del periodo seleccionado…"
              className="reportes-loading--personalizado"
            />
          ) : (
            <>
              <PersonalizadoKpiSection metricas={metricas} data={data} />
              {muestraServicios && (
                <PersonalizadoServiciosChartRow
                  metricas={metricas}
                  serieServiciosVista={serieServiciosVista}
                  granularidadServicios={granularidadServicios}
                  tieneServiciosSerie={tieneServiciosSerie}
                  distribEstadoVista={distribEstadoVista}
                  rangoLegible={formatRangoLegible(aplicadoDesde, aplicadoHasta)}
                />
              )}
              {muestraSoloEstados && (
                <PersonalizadoSoloEstadosCard distribEstadoVista={distribEstadoVista} limit={12} />
              )}

              {metricas.has(METRICA_DEMOGRAFICOS) ? (
                <PersonalizadoDemograficosGrid
                  distribGeneroVista={distribGeneroVista}
                  distribEtapaVista={distribEtapaVista}
                  totalGeneroFiltrado={totalGeneroFiltrado}
                />
              ) : null}
            </>
          )}
        </>
      ) : null}
    </ReportePersonalizadoShell>
  );
}
