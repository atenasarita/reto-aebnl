import { useCallback, useMemo, useState } from "react";
import PersonalizadoDemograficosGrid from "../../../components/reportes/ReportePersonalizado/PersonalizadoDemograficosGrid/PersonalizadoDemograficosGrid";
import PersonalizadoFiltrosDemograficos from "../../../components/reportes/ReportePersonalizado/PersonalizadoFiltrosDemograficos/PersonalizadoFiltrosDemograficos";
import PersonalizadoLedgerDimensiones from "../../../components/reportes/ReportePersonalizado/PersonalizadoLedgerDimensiones/PersonalizadoLedgerDimensiones";
import PersonalizadoKpiSection from "../../../components/reportes/ReportePersonalizado/PersonalizadoKpiSection/PersonalizadoKpiSection";
import PersonalizadoRangoFechasCard from "../../../components/reportes/ReportePersonalizado/PersonalizadoRangoFechasCard/PersonalizadoRangoFechasCard";
import PersonalizadoResumenSeleccion from "../../../components/reportes/ReportePersonalizado/PersonalizadoResumenSeleccion/PersonalizadoResumenSeleccion";
import PersonalizadoResultadosDivider from "../../../components/reportes/ReportePersonalizado/PersonalizadoResultadosDivider/PersonalizadoResultadosDivider";
import PersonalizadoServiciosChartRow, {
  PersonalizadoSoloEstadosCard,
} from "../../../components/reportes/ReportePersonalizado/PersonalizadoServiciosChartRow/PersonalizadoServiciosChartRow";
import PersonalizadoSinDatosState from "../../../components/reportes/ReportePersonalizado/PersonalizadoSinDatosState/PersonalizadoSinDatosState";
import ReportePersonalizadoShell from "../../../components/reportes/ReportePersonalizado/ReportePersonalizadoShell/ReportePersonalizadoShell";
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
} from "../../../components/reportes/ReportePersonalizado/reportePersonalizado.utils";
import { useReportePersonalizado } from "../../../hooks/useReportePersonalizado";

export default function ReportePersonalizado() {
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
    setGenerosSel((prev) => {
      const all = new Set(data.distribucionGenero.map((r) => r.key));
      const cur = prev === null ? new Set(all) : new Set(prev);
      if (cur.has(key)) cur.delete(key);
      else cur.add(key);
      if (cur.size === all.size && [...all].every((k) => cur.has(k))) return null;
      return cur;
    });
  }, [data.distribucionGenero]);

  const toggleEtapa = useCallback((key) => {
    setEtapasSel((prev) => {
      const all = new Set(data.distribucionEtapaVida.map((r) => r.key));
      const cur = prev === null ? new Set(all) : new Set(prev);
      if (cur.has(key)) cur.delete(key);
      else cur.add(key);
      if (cur.size === all.size && [...all].every((k) => cur.has(k))) return null;
      return cur;
    });
  }, [data.distribucionEtapaVida]);

  const toggleEstado = useCallback((key) => {
    setEstadosSel((prev) => {
      const all = new Set(data.distribucionEstado.map((r) => r.key));
      const cur = prev === null ? new Set(all) : new Set(prev);
      if (cur.has(key)) cur.delete(key);
      else cur.add(key);
      if (all.size && cur.size === all.size && [...all].every((k) => cur.has(k))) return null;
      return cur;
    });
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

  const rangoResumenPie = useMemo(() => {
    if (esRangoFechaValido(desdeDraft, hastaDraft)) {
      return formatRangoLegible(desdeDraft, hastaDraft);
    }
    return "Periodo no definido";
  }, [desdeDraft, hastaDraft]);

  const filtrosActivosResumen = useMemo(() => textoMetricas(metricas), [metricas]);

  const regionAnalisisResumen = useMemo(() => {
    if (!metricas.has(METRICA_DEMOGRAFICOS)) return "No aplica";
    if (!periodoAplicado) return "Cobertura global (tras generar)";
    if (data.distribucionEstado.length === 0) return "Sin datos en el periodo";
    const all = new Set(data.distribucionEstado.map((r) => r.key));
    if (estadosSel === null || estadosEfectivos.size === all.size) return "Cobertura global";
    if (estadosEfectivos.size === 0) return "Sin estados seleccionados";
    return `${estadosEfectivos.size} estado${estadosEfectivos.size === 1 ? "" : "s"}`;
  }, [
    metricas,
    periodoAplicado,
    data.distribucionEstado,
    estadosSel,
    estadosEfectivos,
  ]);

  const muestraDemo = metricas.has(METRICA_DEMOGRAFICOS);

  return (
    <ReportePersonalizadoShell>

      <div className="reporte-personalizado-filters-stack">
        <PersonalizadoRangoFechasCard
          desdeDraft={desdeDraft}
          hastaDraft={hastaDraft}
          onDesdeChange={setDesdeDraft}
          onHastaChange={setHastaDraft}
          errorRango={errorRango}
        />
        <PersonalizadoLedgerDimensiones
          muestraDemografia={muestraDemo}
          metricas={metricas}
          onToggleMetrica={toggleMetrica}
        >
          {muestraDemo ? (
            <PersonalizadoFiltrosDemograficos
              hayDatos={hayDatos}
              distribucionEstado={data.distribucionEstado}
              generosEfectivos={generosEfectivos}
              etapasEfectivas={etapasEfectivas}
              estadosEfectivos={estadosEfectivos}
              onToggleGenero={toggleGenero}
              onToggleEtapa={toggleEtapa}
              onToggleEstado={toggleEstado}
            />
          ) : null}
        </PersonalizadoLedgerDimensiones>
      </div>
      <PersonalizadoResumenSeleccion
        rangoTemporal={rangoResumenPie}
        filtrosActivos={filtrosActivosResumen}
        regionAnalisis={regionAnalisisResumen}
        onGenerarReporte={aplicarFiltros}
      />

      {!hayDatos ? <PersonalizadoSinDatosState /> : null}

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
          <PersonalizadoResultadosDivider />
          <PersonalizadoKpiSection metricas={metricas} data={data} />
          {metricas.has(METRICA_SERVICIOS) ? (
            <PersonalizadoServiciosChartRow
              metricas={metricas}
              serieServiciosVista={serieServiciosVista}
              granularidadServicios={granularidadServicios}
              tieneServiciosSerie={tieneServiciosSerie}
              distribEstadoVista={distribEstadoVista}
              rangoLegible={formatRangoLegible(aplicadoDesde, aplicadoHasta)}
            />
          ) : metricas.has(METRICA_DEMOGRAFICOS) ? (
            <PersonalizadoSoloEstadosCard distribEstadoVista={distribEstadoVista} limit={12} />
          ) : null}
          {metricas.has(METRICA_DEMOGRAFICOS) ? (
            <PersonalizadoDemograficosGrid
              distribGeneroVista={distribGeneroVista}
              distribEtapaVista={distribEtapaVista}
              totalGeneroFiltrado={totalGeneroFiltrado}
            />
          ) : null}
          {loading ? (
            <p className="reporte-general-loading">Cargando datos del periodo seleccionado...</p>
          ) : null}
        </>
      ) : null}
    </ReportePersonalizadoShell>
  );
}
