import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { ExternalLink, Search } from "lucide-react";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import Dropdown from "../../../components/ui/Dropdown";
import SearchBar from "../../../components/ui/SearchBar";
import {
  fmtMontoFondo,
  formatConceptoMovimiento,
  formatOrigenMovimiento,
  MontoCell,
  SaldoCell,
} from "../../../components/fondo/FondoMovimientosDisplay";
import IndicadorCard from "../../../components/reportes/IndicadorCard/IndicadorCard";
import ReportesLoading from "../../../components/reportes/ReportesLoading/ReportesLoading";
import { useReporteDonaciones } from "../../../hooks/useReporteDonaciones";
import {
  defaultRangoMesActual,
  esRangoFechaValido,
  formatRangoLegible,
} from "../../../components/reportes/ReportePersonalizado/reportePersonalizado.utils";
import {
  buildCsvReporteDonaciones,
  exportTimestampSlug,
  triggerCsvDownload,
} from "../../../utils/reportesCsvExport";
import "../../styles/Recibos.css";
import "../../styles/Donaciones.css";
import "../ReportesMensual/ReportesMensual.css";
import "../ReporteInventario/ReporteInventario.css";
import "./ReporteDonaciones.css";

const TIPO_FILTRO_OPTIONS = [
  { label: "Todos", value: "" },
  { label: "Abonos", value: "abono" },
  { label: "Egresos", value: "egreso" },
];

function splitFecha(raw) {
  if (!raw) return { fecha: "—", hora: "" };
  if (typeof raw === "string" && raw.includes("T")) {
    const [fecha, tiempo] = raw.split("T");
    return { fecha, hora: (tiempo || "").replace("Z", "").slice(0, 5) };
  }
  if (typeof raw === "string" && raw.includes(" ")) {
    const [fecha, tiempo] = raw.split(" ");
    return { fecha, hora: (tiempo || "").slice(0, 5) };
  }
  return { fecha: String(raw), hora: "" };
}

function matchesBusqueda(m, q) {
  if (!q) return true;
  const hay = [
    m.fecha,
    m.tipo_movimiento,
    formatOrigenMovimiento(m),
    formatConceptoMovimiento(m),
    m.concepto,
    m.motivo,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

function fechaMovimientoYmd(fechaRaw) {
  const day = String(fechaRaw ?? "").slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : "";
}

function matchesRangoFecha(m, desde, hasta) {
  if (!esRangoFechaValido(desde, hasta)) return false;
  const day = fechaMovimientoYmd(m.fecha);
  if (!day) return false;
  return day >= desde && day <= hasta;
}

function tipoDonadorLabel(tipo) {
  return tipo === "marca" ? "Marca" : "Familia";
}

export default function ReporteDonaciones() {
  const { registerCsvExportHandler } = useOutletContext() || {};
  const defRango = useMemo(() => defaultRangoMesActual(), []);
  const [donadorId, setDonadorId] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [fechaDesde, setFechaDesde] = useState(defRango.desde);
  const [fechaHasta, setFechaHasta] = useState(defRango.hasta);
  const [errorRango, setErrorRango] = useState("");

  const {
    donadores,
    movimientos,
    loadingDonadores,
    loadingMovimientos,
    error,
    fetchDonadores,
    fetchMovimientosPorDonador,
  } = useReporteDonaciones();

  useEffect(() => {
    fetchDonadores().catch(() => {});
  }, [fetchDonadores]);

  useEffect(() => {
    if (!donadorId) return;
    fetchMovimientosPorDonador(donadorId).catch(() => {});
  }, [donadorId, fetchMovimientosPorDonador]);

  useEffect(() => {
    setFechaDesde(defRango.desde);
    setFechaHasta(defRango.hasta);
    setErrorRango("");
    setFiltroTipo("");
    setBusqueda("");
  }, [donadorId, defRango.desde, defRango.hasta]);

  const rangoValido = esRangoFechaValido(fechaDesde, fechaHasta);
  const rangoLabel = rangoValido ? formatRangoLegible(fechaDesde, fechaHasta) : "";

  const handleFechaDesdeChange = (value) => {
    setFechaDesde(value);
    if (value && fechaHasta && value > fechaHasta) {
      setErrorRango("La fecha inicial no puede ser posterior a la fecha final.");
    } else {
      setErrorRango("");
    }
  };

  const handleFechaHastaChange = (value) => {
    setFechaHasta(value);
    if (fechaDesde && value && fechaDesde > value) {
      setErrorRango("La fecha inicial no puede ser posterior a la fecha final.");
    } else {
      setErrorRango("");
    }
  };

  const donadorActivo = useMemo(
    () => donadores.find((d) => String(d.id_donador) === String(donadorId)),
    [donadores, donadorId]
  );

  const donadorOptions = useMemo(
    () => [
      { label: "Seleccionar marca o familia…", value: "" },
      ...donadores.map((d) => {
        const tipo = tipoDonadorLabel(d.tipo_origen);
        return {
          label: `${d.nombre} (${tipo}) — ${fmtMontoFondo(d.saldo)}`,
          value: String(d.id_donador),
        };
      }),
    ],
    [donadores]
  );

  const busquedaNorm = busqueda.trim().toLowerCase();
  const movimientosFiltrados = useMemo(() => {
    if (!rangoValido) return [];
    return movimientos.filter((m) => {
      if (!matchesRangoFecha(m, fechaDesde, fechaHasta)) return false;
      const tipo = m.tipo_movimiento?.toLowerCase();
      if (filtroTipo === "abono" && tipo !== "abono") return false;
      if (filtroTipo === "egreso" && tipo !== "egreso") return false;
      return matchesBusqueda(m, busquedaNorm);
    });
  }, [movimientos, filtroTipo, busquedaNorm, fechaDesde, fechaHasta, rangoValido]);

  const resumen = useMemo(() => {
    let abonos = 0;
    let egresos = 0;
    for (const m of movimientosFiltrados) {
      const n = Number(m.monto) || 0;
      if (m.tipo_movimiento === "abono") abonos += n;
      else if (m.tipo_movimiento === "egreso") egresos += n;
    }
    return { abonos, egresos, total: movimientosFiltrados.length };
  }, [movimientosFiltrados]);

  const metaHistorial = useMemo(() => {
    if (!donadorId) return null;
    if (loadingMovimientos) return "Cargando movimientos…";
    if (error) return "Error al cargar movimientos.";
    if (errorRango) return errorRango;
    if (!rangoValido) return "Seleccione un rango de fechas válido.";
    if (resumen.total === 0) {
      const sinResultados =
        busquedaNorm || filtroTipo
          ? "Sin resultados con los filtros actuales."
          : "Sin movimientos en el periodo seleccionado.";
      return rangoLabel ? `${sinResultados} (${rangoLabel})` : sinResultados;
    }
    const count = `${resumen.total} movimiento${resumen.total === 1 ? "" : "s"}`;
    return rangoLabel ? `${count} · ${rangoLabel}` : count;
  }, [
    donadorId,
    loadingMovimientos,
    error,
    errorRango,
    rangoValido,
    rangoLabel,
    resumen.total,
    busquedaNorm,
    filtroTipo,
  ]);

  useEffect(() => {
    if (!registerCsvExportHandler) return undefined;
    registerCsvExportHandler(() => {
      if (!donadorActivo || movimientosFiltrados.length === 0) {
        window.alert("No hay movimientos para exportar con la selección actual.");
        return;
      }
      const csv = buildCsvReporteDonaciones(donadorActivo, movimientosFiltrados);
      const slug = donadorActivo.nombre.replace(/\s+/g, "_").slice(0, 40);
      triggerCsvDownload(
        `reporte_donaciones_${slug}_${exportTimestampSlug()}.csv`,
        csv
      );
    });
    return () => registerCsvExportHandler(null);
  }, [registerCsvExportHandler, donadorActivo, movimientosFiltrados]);

  const showHistorial = Boolean(donadorId);
  const showTabla =
    showHistorial &&
    !error &&
    !errorRango &&
    rangoValido &&
    !loadingMovimientos &&
    resumen.total > 0;

  return (
    <article className="reporte-donaciones-shell donaciones-page">
      <section
        className="reporte-donaciones-controls reporte-general-panel"
        aria-labelledby="reporte-donaciones-titulo"
      >
        <header className="reporte-donaciones-controls-head">
          <h2 id="reporte-donaciones-titulo" className="section-title">
            Movimientos por fondo
          </h2>
          <p className="section-sub reporte-donaciones-lead">
            Consulte abonos y egresos de cada marca o familia registrada.
          </p>
        </header>

        {loadingDonadores && donadores.length === 0 ? (
          <ReportesLoading
            message="Cargando fondos…"
            className="reportes-loading--personalizado"
          />
        ) : donadores.length === 0 ? (
          <div className="reporte-donaciones-idle reporte-donaciones-idle--alert">
            <p className="reporte-donaciones-idle-title">Sin fondos registrados</p>
            <p className="reporte-donaciones-idle-text">
              Cree una marca o familia en Donaciones para generar este reporte.
            </p>
            <Link to="/donaciones" className="reporte-donaciones-cta-link">
              <ExternalLink size={16} aria-hidden />
              Ir a Donaciones
            </Link>
          </div>
        ) : (
          <div className="reporte-donaciones-controls-stack">
            <div className="reporte-donaciones-field">
              <label className="fieldLabel" htmlFor="reporte-donador-select">
                Marca o familia
              </label>
              <Dropdown
                className="dropdown-gestion reporte-donaciones-dropdown"
                options={donadorOptions}
                value={donadorId}
                onChange={setDonadorId}
              />
            </div>

            {!donadorId ? (
              <div className="reporte-donaciones-idle reporte-donaciones-idle--hint">
                <p className="reporte-donaciones-idle-title">Elija un fondo</p>
                <p className="reporte-donaciones-idle-text">
                  Los indicadores y el historial aparecerán al seleccionar una marca o familia.
                </p>
              </div>
            ) : null}

            {donadorActivo ? (
              <div
                className="reporte-donaciones-fondo-resumen"
                aria-live="polite"
                aria-label="Resumen del fondo seleccionado"
              >
                <p className="reporte-donaciones-fondo-context">
                  <span
                    className={`reporte-donaciones-tipo reporte-donaciones-tipo--${donadorActivo.tipo_origen}`}
                  >
                    {tipoDonadorLabel(donadorActivo.tipo_origen)}
                  </span>
                  <span className="reporte-donaciones-fondo-name">{donadorActivo.nombre}</span>
                </p>
                <div className="reporte-mensual-kpi-grid reporte-donaciones-kpi-grid">
                  <IndicadorCard
                    label="Abonos del periodo"
                    value={resumen.abonos}
                    displayValue={fmtMontoFondo(resumen.abonos)}
                    numberVariant="success"
                  />
                  <IndicadorCard
                    label="Egresos del periodo"
                    value={resumen.egresos}
                    displayValue={fmtMontoFondo(resumen.egresos)}
                    numberVariant="danger"
                  />
                  <IndicadorCard
                    label="Saldo actual"
                    value={donadorActivo.saldo}
                    displayValue={fmtMontoFondo(donadorActivo.saldo)}
                  />
                </div>
              </div>
            ) : null}
          </div>
        )}
      </section>

      {showHistorial ? (
        <section
          className="reporte-donaciones-historial"
          aria-labelledby="reporte-donaciones-historial-titulo"
        >
          <Card className="reporte-mensual-trend reporte-general-panel">
            <CardHeader className="reporte-mensual-trend-header reporte-donaciones-historial-header">
              <div>
                <h3
                  id="reporte-donaciones-historial-titulo"
                  className="reporte-mensual-trend-title"
                >
                  Historial de movimientos
                </h3>
                {metaHistorial ? (
                  <p
                    id="reporte-donaciones-historial-meta"
                    className="reporte-mensual-trend-sub"
                  >
                    {metaHistorial}
                  </p>
                ) : null}
              </div>
              <div className="reporte-inventario-historial-filtros reporte-donaciones-historial-filtros">
                <div
                  className="reporte-inventario-historial-fechas"
                  role="group"
                  aria-label="Rango de fechas del historial"
                >
                  <input
                    type="date"
                    className="reporte-inventario-historial-fecha"
                    value={fechaDesde}
                    onChange={(e) => handleFechaDesdeChange(e.target.value)}
                    aria-label="Fecha inicial"
                    aria-invalid={Boolean(errorRango)}
                  />
                  <span className="reporte-inventario-historial-fecha-sep" aria-hidden>
                    -
                  </span>
                  <input
                    type="date"
                    className="reporte-inventario-historial-fecha"
                    value={fechaHasta}
                    onChange={(e) => handleFechaHastaChange(e.target.value)}
                    aria-label="Fecha final"
                    aria-invalid={Boolean(errorRango)}
                  />
                </div>
                <SearchBar
                  icon={<Search size={16} />}
                  className="search-gestion reporte-inventario-historial-busqueda"
                  placeholder="Buscar movimiento…"
                  value={busqueda}
                  onChange={setBusqueda}
                  debounceMs={250}
                />
                <Dropdown
                  className="dropdown-gestion reporte-inventario-historial-tipo"
                  value={filtroTipo}
                  onChange={setFiltroTipo}
                  options={TIPO_FILTRO_OPTIONS}
                />
              </div>
            </CardHeader>

            <CardContent className="reporte-donaciones-historial-content">
              {error ? (
                <div className="reporte-general-alert" role="alert">
                  <p>{error}</p>
                  <button
                    type="button"
                    onClick={() => fetchMovimientosPorDonador(donadorId).catch(() => {})}
                  >
                    Reintentar
                  </button>
                </div>
              ) : null}

              {!error && errorRango ? (
                <p className="reporte-mxmap-hint" role="alert">
                  {errorRango}
                </p>
              ) : null}

              {!error && !errorRango && loadingMovimientos ? (
                <ReportesLoading
                  message="Cargando movimientos…"
                  className="reportes-loading--personalizado"
                />
              ) : null}

              {!error && !errorRango && !loadingMovimientos && !showTabla ? (
                <p className="reporte-mxmap-hint" role="status">
                  {metaHistorial}
                </p>
              ) : null}

              {showTabla ? (
                <div
                  className="reporte-donaciones-tabla-wrap table-wrap"
                  tabIndex={0}
                  role="region"
                  aria-labelledby="reporte-donaciones-historial-titulo reporte-donaciones-historial-meta"
                >
                  <table className="recibos-table reporte-donaciones-tabla">
                    <thead>
                      <tr>
                        <th scope="col">Fecha</th>
                        <th scope="col">Tipo</th>
                        <th scope="col">Origen / destino</th>
                        <th scope="col">Concepto</th>
                        <th className="text-right" scope="col">
                          Monto
                        </th>
                        <th className="text-right" scope="col">
                          Saldo
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {movimientosFiltrados.map((m) => {
                        const conceptoTexto = formatConceptoMovimiento(m);
                        const { fecha, hora } = splitFecha(m.fecha);
                        return (
                          <tr key={m.id_movimiento}>
                            <td>
                              <div className="reporte-inventario-fecha">
                                <time dateTime={m.fecha ? String(m.fecha) : undefined}>
                                  {fecha}
                                </time>
                                {hora ? (
                                  <span className="reporte-inventario-hora">{hora}</span>
                                ) : null}
                              </div>
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  m.tipo_movimiento === "abono"
                                    ? "badge-donacion badge-donacion--abono"
                                    : "badge-egreso badge-egreso--egreso"
                                }`}
                              >
                                {m.tipo_movimiento === "abono" ? "Abono" : "Egreso"}
                              </span>
                            </td>
                            <td>{formatOrigenMovimiento(m)}</td>
                            <td>
                              <span className="donaciones-concepto" title={conceptoTexto}>
                                {conceptoTexto}
                              </span>
                            </td>
                            <MontoCell tipo={m.tipo_movimiento} monto={m.monto} />
                            <SaldoCell value={m.saldo_nuevo} />
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </section>
      ) : null}
    </article>
  );
}
