import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { AlertTriangle, Package, Search } from "lucide-react";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import DistribucionEtapaVidaList from "../../../components/reportes/DistribucionEtapaVidaList/DistribucionEtapaVidaList";
import SearchBar from "../../../components/ui/SearchBar";
import Dropdown from "../../../components/ui/Dropdown";
import Pagination from "../../../components/ui/Pagination";
import ReportePersonalizadoShell from "../../../components/reportes/ReportePersonalizado/ReportePersonalizadoShell/ReportePersonalizadoShell";
import "../../../components/reportes/ReportePersonalizado/PersonalizadoKpiSection/PersonalizadoKpiSection.css";
import ReportesLoading from "../../../components/reportes/ReportesLoading/ReportesLoading";
import {
  defaultRangoMesActual,
  esRangoFechaValido,
  formatRangoLegible,
} from "../../../components/reportes/ReportePersonalizado/reportePersonalizado.utils";
import { useReporteInventario } from "../../../hooks/useReporteInventario";
import {
  buildCsvReporteInventarioHistorial,
  exportTimestampSlug,
  sanitizeFilenamePart,
  triggerCsvDownload,
} from "../../../utils/reportesCsvExport";
import "../ReportesMensual/ReportesMensual.css";
import "./ReporteInventario.css";

function formatNumber(value) {
  return Number(value || 0).toLocaleString("es-MX");
}

function splitFecha(value) {
  if (!value) {
    return { fecha: "—", hora: "" };
  }
  const raw = String(value);
  if (raw.includes("T")) {
    const [fecha, tiempo] = raw.split("T");
    return { fecha, hora: (tiempo || "").replace("Z", "").slice(0, 5) };
  }
  if (raw.includes(" ")) {
    const [fecha, tiempo] = raw.split(" ");
    return { fecha, hora: (tiempo || "").slice(0, 5) };
  }
  return { fecha: raw, hora: "" };
}

function getInitials(value) {
  if (!value) return "—";
  const parts = String(value).trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("");
  return initials || "—";
}

const ITEMS_POR_PAGINA_HISTORIAL = 10;

export default function ReporteInventario() {
  const { registerCsvExportHandler } = useOutletContext() || {};
  const def = useMemo(() => defaultRangoMesActual(), []);
  const aplicadoDesde = def.desde;
  const aplicadoHasta = def.hasta;
  const [liveMessage, setLiveMessage] = useState("");
  const [filtroBusquedaHistorial, setFiltroBusquedaHistorial] = useState("");
  const [filtroTipoHistorial, setFiltroTipoHistorial] = useState("");
  const [historialDesde, setHistorialDesde] = useState(def.desde);
  const [historialHasta, setHistorialHasta] = useState(def.hasta);
  const [historialErrorRango, setHistorialErrorRango] = useState("");

  const { data, loading, error, refetch } = useReporteInventario(aplicadoDesde, aplicadoHasta);

  const historialRangoValido = esRangoFechaValido(historialDesde, historialHasta);
  const {
    data: historialData,
    loading: loadingHistorial,
    error: historialFetchError,
    refetch: refetchHistorial,
  } = useReporteInventario(
    historialRangoValido ? historialDesde : "",
    historialRangoValido ? historialHasta : "",
  );

  const categoriasDistribucion = useMemo(
    () =>
      data.productosPorCategoria.map((row) => ({
        key: row.key,
        label: row.label,
        value: row.value,
        porcentaje: row.porcentaje,
      })),
    [data.productosPorCategoria],
  );
  const bajoStockOrdenado = useMemo(
    () => [...data.listaBajoStock].sort((a, b) => Number(a.cantidad) - Number(b.cantidad)),
    [data.listaBajoStock],
  );
  const maxBajoStock = useMemo(() => {
    if (!bajoStockOrdenado.length) return 0;
    return Math.max(
      ...bajoStockOrdenado.map((item) => Number(item.cantidad || 0)),
    );
  }, [bajoStockOrdenado]);

  useEffect(() => {
    if (loading) return;
    if (error) {
      setLiveMessage("Error al cargar el reporte de inventario.");
      return;
    }
    setLiveMessage(
      `Reporte listo. ${formatNumber(data.entradasUnidades)} entradas, ${formatNumber(data.salidasUnidades)} salidas y ${formatNumber(data.movimientosRegistrados)} movimientos en el periodo.`,
    );
  }, [
    data.entradasUnidades,
    data.movimientosRegistrados,
    data.salidasUnidades,
    error,
    loading,
  ]);

  const [paginaHistorial, setPaginaHistorial] = useState(1);
  const historialFiltrado = useMemo(() => {
    const q = filtroBusquedaHistorial.trim().toLowerCase();
    return historialData.historial.filter((row) => {
      const matchTipo = !filtroTipoHistorial || row.tipo === filtroTipoHistorial;
      if (!matchTipo) return false;
      if (!q) return true;
      const texto = `${row.fecha} ${row.clave} ${row.nombre} ${row.motivo} ${row.usuario}`.toLowerCase();
      return texto.includes(q);
    });
  }, [historialData.historial, filtroBusquedaHistorial, filtroTipoHistorial]);
  const totalHistorial = historialFiltrado.length;
  const historialPaginado = useMemo(() => {
    const inicio = (paginaHistorial - 1) * ITEMS_POR_PAGINA_HISTORIAL;
    return historialFiltrado.slice(inicio, inicio + ITEMS_POR_PAGINA_HISTORIAL);
  }, [historialFiltrado, paginaHistorial]);

  useEffect(() => {
    setPaginaHistorial(1);
  }, [filtroBusquedaHistorial, filtroTipoHistorial, historialDesde, historialHasta]);

  const handleHistorialDesdeChange = (value) => {
    setHistorialDesde(value);
    if (value && historialHasta && value > historialHasta) {
      setHistorialErrorRango(
        "La fecha inicial no puede ser posterior a la fecha final.",
      );
    } else {
      setHistorialErrorRango("");
    }
  };

  const handleHistorialHastaChange = (value) => {
    setHistorialHasta(value);
    if (historialDesde && value && historialDesde > value) {
      setHistorialErrorRango(
        "La fecha inicial no puede ser posterior a la fecha final.",
      );
    } else {
      setHistorialErrorRango("");
    }
  };

  const historialRangoLabel = historialRangoValido
    ? formatRangoLegible(historialDesde, historialHasta)
    : "";

  useEffect(() => {
    if (!registerCsvExportHandler) return undefined;
    registerCsvExportHandler(() => {
      if (!historialRangoValido) {
        window.alert("Selecciona un rango de fechas válido para exportar el historial.");
        return;
      }
      if (loadingHistorial) {
        window.alert("Espera a que termine de cargar el historial de movimientos.");
        return;
      }
      if (historialFetchError) {
        window.alert("No se puede exportar: el historial no se cargó correctamente.");
        return;
      }
      const csv = buildCsvReporteInventarioHistorial(
        historialData.historial,
        historialDesde,
        historialHasta,
      );
      const desdePart = sanitizeFilenamePart(historialDesde);
      const hastaPart = sanitizeFilenamePart(historialHasta);
      triggerCsvDownload(
        `historial_movimientos_${desdePart}_${hastaPart}_${exportTimestampSlug()}.csv`,
        csv,
      );
    });
    return () => registerCsvExportHandler(null);
  }, [
    historialDesde,
    historialFetchError,
    historialData.historial,
    historialHasta,
    historialRangoValido,
    loadingHistorial,
    registerCsvExportHandler,
  ]);

  return (
    <ReportePersonalizadoShell>
      <a href="#reporte-inventario-resultados" className="reporte-inventario-skip">
        Ir al contenido del reporte
      </a>

      <p className="reporte-inventario-live" role="status" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </p>

      {error ? (
        <div className="reporte-general-alert" role="alert">
          <p>{error}</p>
          <button type="button" onClick={refetch}>
            Reintentar
          </button>
        </div>
      ) : null}

      <div id="reporte-inventario-resultados" tabIndex={-1} aria-busy={loading}>
        {loading ? (
          <ReportesLoading
            message="Cargando indicadores de inventario…"
            className="reportes-loading--personalizado"
          />
        ) : (
          <div className="reporte-inventario-results-stack">
            <div className="reporte-inventario-grid">
              <section
                className="reporte-inventario-bajo-stock"
                aria-labelledby="reporte-inventario-bajo-stock-titulo"
              >
                <Card className="reporte-mensual-trend reporte-general-panel">
                  <CardHeader className="reporte-mensual-trend-header">
                    <div className="reporte-inventario-bajo-stock-title-wrap">
                      <AlertTriangle className="reporte-inventario-bajo-stock-icon" size={18} />
                      <h3
                        id="reporte-inventario-bajo-stock-titulo"
                        className="reporte-mensual-trend-title"
                      >
                        Productos con bajo stock
                      </h3>
                    </div>
                    <span className="reporte-inventario-historial-pill">
                      {formatNumber(bajoStockOrdenado.length)} item(s)
                    </span>
                  </CardHeader>
                  <CardContent className="reporte-inventario-historial-content">
                    {bajoStockOrdenado.length > 0 ? (
                      <ul className="reporte-inventario-bajo-stock-lista">
                        {bajoStockOrdenado.map((item) => {
                          const cantidad = Number(item.cantidad || 0);
                          const percent = maxBajoStock
                            ? Math.max(8, Math.round((cantidad / maxBajoStock) * 100))
                            : 0;
                          const variant = cantidad <= 5 ? "critico" : cantidad <= 10 ? "medio" : "bajo";
                          const unidad = item.unidadMedida || "u";
                          return (
                            <li
                              key={item.id || `${item.clave}-${item.nombre}`}
                              className={`reporte-inventario-bajo-stock-item reporte-inventario-bajo-stock-item--${variant}`}
                            >
                              <span className="reporte-inventario-bajo-stock-item-icon" aria-hidden="true">
                                <Package size={18} />
                              </span>
                              <div className="reporte-inventario-bajo-stock-info">
                                <span className="reporte-inventario-bajo-stock-nombre">
                                  {item.nombre || "—"}
                                </span>
                                <span className="reporte-inventario-bajo-stock-meta">
                                  {formatNumber(cantidad)} {unidad} restante{cantidad === 1 ? "" : "s"}
                                </span>
                              </div>
                              <div className="reporte-inventario-bajo-stock-bar">
                                <span
                                  className={`reporte-inventario-bajo-stock-bar-fill reporte-inventario-bajo-stock-bar-fill--${variant}`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="reporte-mxmap-hint" role="status">
                        Sin productos en nivel de bajo stock.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </section>

              <DistribucionEtapaVidaList
                distribucionEtapaVida={categoriasDistribucion}
                eyebrow="Productos por categoría"
                emptyMessage="Sin productos activos por categoría."
                getRowLabel={(item) => item.label}
                listAriaLabel="Distribución de productos activos por categoría"
                barFillClassName="reporte-inventario-cat-bar"
              />
            </div>

            <section
              className="reporte-inventario-historial"
              aria-labelledby="reporte-inventario-historial-titulo"
            >
                <Card className="reporte-mensual-trend reporte-general-panel">
                  <CardHeader className="reporte-mensual-trend-header">
                    <div>
                      <h3
                        id="reporte-inventario-historial-titulo"
                        className="reporte-mensual-trend-title"
                      >
                        Historial de movimientos
                      </h3>
                      <p
                        className="reporte-mensual-trend-sub"
                        id="reporte-inventario-historial-meta"
                      >
                        {loadingHistorial
                          ? "Cargando movimientos…"
                          : historialErrorRango
                            ? historialErrorRango
                            : historialFetchError
                              ? "Error al cargar el historial."
                              : totalHistorial > 0
                                ? `${formatNumber(totalHistorial)} registros${historialRangoLabel ? ` · ${historialRangoLabel}` : ""}`
                                : historialRangoValido
                                  ? "Sin movimientos en el periodo."
                                  : "Selecciona un rango de fechas válido."}
                      </p>
                    </div>
                    <div className="reporte-inventario-historial-filtros">
                      <div
                        className="reporte-inventario-historial-fechas"
                        role="group"
                        aria-label="Rango de fechas del historial"
                      >
                        <input
                          type="date"
                          className="reporte-inventario-historial-fecha"
                          value={historialDesde}
                          onChange={(e) => handleHistorialDesdeChange(e.target.value)}
                          aria-label="Fecha inicial"
                          aria-invalid={Boolean(historialErrorRango)}
                        />
                        <span className="reporte-inventario-historial-fecha-sep" aria-hidden>
                          —
                        </span>
                        <input
                          type="date"
                          className="reporte-inventario-historial-fecha"
                          value={historialHasta}
                          onChange={(e) => handleHistorialHastaChange(e.target.value)}
                          aria-label="Fecha final"
                          aria-invalid={Boolean(historialErrorRango)}
                        />
                      </div>
                      <SearchBar
                        icon={<Search size={16} />}
                        className="search-gestion reporte-inventario-historial-busqueda"
                        placeholder="Buscar movimiento..."
                        value={filtroBusquedaHistorial}
                        onChange={setFiltroBusquedaHistorial}
                        debounceMs={250}
                      />
                      <Dropdown
                        className="dropdown-gestion reporte-inventario-historial-tipo"
                        value={filtroTipoHistorial}
                        onChange={setFiltroTipoHistorial}
                        options={[
                          { label: "Todos", value: "" },
                          { label: "Entradas", value: "entrada" },
                          { label: "Salidas", value: "salida" },
                        ]}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="reporte-inventario-historial-content">
                    {historialFetchError ? (
                      <div className="reporte-general-alert" role="alert">
                        <p>{historialFetchError}</p>
                        <button type="button" onClick={refetchHistorial}>
                          Reintentar
                        </button>
                      </div>
                    ) : null}
                    {!historialFetchError && historialErrorRango ? (
                      <p className="reporte-mxmap-hint" role="alert">
                        {historialErrorRango}
                      </p>
                    ) : null}
                    {!historialFetchError &&
                    !historialErrorRango &&
                    historialRangoValido &&
                    loadingHistorial ? (
                      <ReportesLoading
                        message="Cargando historial de movimientos…"
                        className="reportes-loading--personalizado"
                      />
                    ) : null}
                    {!historialFetchError &&
                    !historialErrorRango &&
                    historialRangoValido &&
                    !loadingHistorial &&
                    totalHistorial > 0 ? (
                      <>
                        <div
                          className="reporte-inventario-tabla-wrap"
                          tabIndex={0}
                          role="region"
                          aria-labelledby="reporte-inventario-historial-titulo reporte-inventario-historial-meta"
                        >
                          <table className="reporte-inventario-tabla reporte-inventario-tabla--movimientos">
                            <caption>
                              Historial del {historialDesde} al {historialHasta}
                            </caption>
                            <thead>
                              <tr>
                                <th scope="col">Fecha</th>
                                <th scope="col">Item</th>
                                <th scope="col" className="reporte-inventario-col-tipo">
                                  Tipo de movimiento
                                </th>
                                <th scope="col" className="reporte-inventario-col-cantidad">
                                  Cantidad
                                </th>
                                <th scope="col">Usuario</th>
                              </tr>
                            </thead>
                            <tbody>
                              {historialPaginado.map((row) => {
                                const { fecha, hora } = splitFecha(row.fecha);
                                const usuario = row.usuario || "—";
                                const iniciales = getInitials(usuario);
                                return (
                                  <tr
                                    key={row.id}
                                    aria-label={`${row.tipoLabel} de ${row.nombre}, ${row.fecha}`}
                                  >
                                    <td>
                                      <div className="reporte-inventario-fecha">
                                        <time dateTime={row.fecha ? String(row.fecha) : undefined}>
                                          {fecha}
                                        </time>
                                        {hora ? (
                                          <span className="reporte-inventario-hora">{hora}</span>
                                        ) : null}
                                      </div>
                                    </td>
                                    <td>
                                      <div className="reporte-inventario-item">
                                        <span className="reporte-inventario-item-icon" aria-hidden="true">
                                          <Package size={16} />
                                        </span>
                                        <div className="reporte-inventario-item-text">
                                          <span className="reporte-inventario-item-nombre">
                                            {row.nombre || "—"}
                                          </span>
                                          <span className="reporte-inventario-item-clave">
                                            {row.clave || "—"}
                                          </span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="reporte-inventario-col-tipo">
                                      <span
                                        className={`reporte-inventario-tipo reporte-inventario-tipo--${row.tipo}`}
                                      >
                                        <span className="visually-hidden">Tipo de movimiento: </span>
                                        {row.tipoLabel}
                                      </span>
                                    </td>
                                    <td className="reporte-inventario-col-cantidad">
                                      <span className="reporte-inventario-cantidad">
                                        {formatNumber(row.cantidad)}
                                      </span>
                                    </td>
                                    <td>
                                      <div className="reporte-inventario-usuario">
                                        <span className="reporte-inventario-avatar" aria-hidden="true">
                                          {iniciales}
                                        </span>
                                        <span className="reporte-inventario-usuario-nombre">
                                          {usuario}
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <Pagination
                          currentPage={paginaHistorial}
                          totalItems={totalHistorial}
                          itemsPerPage={ITEMS_POR_PAGINA_HISTORIAL}
                          onPageChange={setPaginaHistorial}
                        />
                      </>
                    ) : !historialFetchError &&
                      !historialErrorRango &&
                      historialRangoValido &&
                      !loadingHistorial ? (
                      <p className="reporte-mxmap-hint" role="status">
                        No hay movimientos para los filtros seleccionados.
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
            </section>
          </div>
        )}
      </div>
    </ReportePersonalizadoShell>
  );
}
