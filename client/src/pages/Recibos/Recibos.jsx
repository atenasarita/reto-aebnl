import { useState, useEffect, useCallback, useId, useRef } from "react";
import { X, AlertTriangle } from "lucide-react";
import { useSearchParams } from 'react-router-dom'


import "../styles/Recibos.css";

import { API_URL } from '../../utils/config'
import { authFetch } from '../../utils/auth'
import { todayDate } from '../../utils/dateTime';

const fmt = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n ?? 0);

const fmtFecha = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtMes = (iso) => {
  if (!iso) return "";
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
};

const hoy = () => todayDate();

// Loader
function Skeleton({ rows = 4 }) {
  return (
    <div className="skeleton-wrap" role="status" aria-live="polite" aria-label="Cargando recibos">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-row" style={{ animationDelay: `${i * 0.07}s` }} />
      ))}
    </div>
  );
}

// Método de pago
function PagoBadge({ metodo }) {
  const map = {
    efectivo: { label: "Efectivo", cls: "badge-efectivo" },
    tarjeta: { label: "Tarjeta", cls: "badge-tarjeta" },
    donacion: { label: "Donación", cls: "badge-donacion" },
  };
  const { label, cls } = map[metodo] ?? { label: metodo, cls: "" };
  return <span className={`badge ${cls}`}>{label}</span>;
}

// Detalles
function ReciboDetalle({ recibo, onClose }) {
  const dialogTitleId = useId();
  const dialogDescId = useId();
  const closeBtnRef = useRef(null);

  useEffect(() => {
    if (!recibo) return undefined;

    closeBtnRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [recibo, onClose]);

  if (!recibo) return null;

  const totalInv = recibo.items_inventario?.reduce((s, i) => s + Number(i.subtotal), 0) ?? 0;

  return (
    <div className="detalle-overlay" onClick={onClose}>
      <div
        className="detalle-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        aria-describedby={dialogDescId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="detalle-header">
          <div>
            <p className="detalle-folio">Folio #{recibo.id_servicio_otorgado}</p>
            <h2 id={dialogTitleId} className="detalle-nombre">{recibo.beneficiario}</h2>
            <p id={dialogDescId} className="detalle-meta">
              {recibo.servicio} · {fmtFecha(recibo.fecha)} {recibo.hora}
            </p>
          </div>
          <button ref={closeBtnRef} className="btn-close" onClick={onClose} aria-label="Cerrar detalle del recibo"><X size={18} /></button>
        </div>

        {recibo.items_inventario?.length > 0 && (
          <section className="detalle-section">
            <h3 className="detalle-section-title">Artículos de inventario</h3>
            <table className="detalle-table">
              <thead>
                <tr>
                  <th>Artículo</th>
                  <th className="text-right">Cant.</th>
                  <th className="text-right">P. Unit.</th>
                  <th className="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {recibo.items_inventario.map((item) => (
                  <tr key={item.id_venta_inventario}>
                    <td>{item.nombre_articulo}</td>
                    <td className="text-right">{item.cantidad}</td>
                    <td className="text-right">{fmt(item.precio_unitario)}</td>
                    <td className="text-right">{fmt(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <section className="detalle-section">
          <h3 className="detalle-section-title">Resumen financiero</h3>
          <div className="detalle-financiero">
            <div className="fin-row">
              <span>Monto servicio</span>
              <span>{fmt(recibo.financiero?.monto_servicio)}</span>
            </div>
            {totalInv > 0 && (
              <div className="fin-row">
                <span>Inventario</span>
                <span>{fmt(totalInv)}</span>
              </div>
            )}
            {recibo.financiero?.descuento > 0 && (
              <div className="fin-row fin-descuento">
                <span>Descuento</span>
                <span>− {fmt(recibo.financiero.descuento)}</span>
              </div>
            )}
            <div className="fin-row fin-total">
              <span>Total</span>
              <span>{fmt(recibo.financiero?.cuota_total)}</span>
            </div>
            <div className="fin-row fin-pagado">
              <span>Aportación familia</span>
              <span>{fmt(recibo.financiero?.monto_pagado)}</span>
            </div>
            {(recibo.financiero?.monto_donacion ?? 0) > 0 && (
              <div className="fin-row fin-donacion">
                <span>Fondo donaciones</span>
                <span>{fmt(recibo.financiero.monto_donacion)}</span>
              </div>
            )}
            <div className="fin-row fin-total-cobrado">
              <span>Total cobrado</span>
              <span>
                {fmt(
                  Number(recibo.financiero?.monto_pagado ?? 0) +
                    Number(recibo.financiero?.monto_donacion ?? 0)
                )}
              </span>
            </div>
          </div>
          {recibo.financiero?.metodo_pago && (
            <div style={{ marginTop: 12 }}>
              <PagoBadge metodo={recibo.financiero.metodo_pago} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// Tabla de recibos
function ReciboRow({ recibo, onVerDetalle, mostrarFecha = false, index = 0 }) {
  return (
    <tr
      className="recibo-row"
    >
      <th scope="row" className="td-folio">#{recibo.id_servicio_otorgado}</th>
      <td>{recibo.beneficiario}</td>
      <td>{recibo.servicio}</td>
      {mostrarFecha && <td>{fmtFecha(recibo.fecha)}</td>}
      <td>{recibo.hora}</td>
      <td className="text-right">{fmt(recibo.financiero?.cuota_total)}</td>
      <td className="text-right">{fmt(recibo.financiero?.monto_pagado)}</td>
      <td className="text-right">
        {(recibo.financiero?.monto_donacion ?? 0) > 0
          ? fmt(recibo.financiero.monto_donacion)
          : <span className="text-muted">—</span>}
      </td>
      <td>
        {recibo.financiero?.metodo_pago
          ? <PagoBadge metodo={recibo.financiero.metodo_pago} />
          : <span className="text-muted">—</span>}
      </td>
      <td>
        <button
          className="btn-ver"
          onClick={() => onVerDetalle(recibo)}
          aria-label={`Ver detalle del recibo ${recibo.id_servicio_otorgado}`}
        >
          Ver
        </button>
      </td>
    </tr>
  );
}

// Resumen
function ResumenCard({ label, value, sub, index = 0 }) {
  return (
    <div
      className="resumen-card"
    >
      <p className="resumen-label">{label}</p>
      <p className="resumen-value">{value}</p>
      {sub && <p className="resumen-sub">{sub}</p>}
    </div>
  );
}

// Tabla de recibos
function TablaRecibos({
  recibos,
  loading,
  error,
  onVerDetalle,
  mostrarFecha = false,
  emptyMsg,
  caption,
  animationKey,
}) {
  if (loading) return <Skeleton rows={4} />;
  if (error) return <div className="estado-msg estado-error"><AlertTriangle size={14} /> {error}</div>;
  if (!recibos.length) return <div className="estado-msg">{emptyMsg}</div>;

  return (
    <div className="table-wrap">
      <table className="recibos-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th>Folio</th>
            <th>Beneficiario</th>
            <th>Servicio</th>
            {mostrarFecha && <th>Fecha</th>}
            <th>Hora</th>
            <th className="text-right">Total</th>
            <th className="text-right">Pagado</th>
            <th className="text-right">Donación</th>
            <th>Método</th>
            <th>Detalles</th>
          </tr>
        </thead>
        <tbody key={animationKey}>
          {recibos.map((r, index) => (
            <ReciboRow
              key={`${animationKey}-${r.id_servicio_otorgado}-${index}`}
              recibo={r}
              onVerDetalle={onVerDetalle}
              mostrarFecha={mostrarFecha}
              index={index}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Página principal
export default function Recibos() {
  const fechaInputId = useId();
  const busquedaDiaInputId = useId();
  const busquedaMesInputId = useId();
  const recibosDiaHeadingId = useId();
  const recibosMesHeadingId = useId();
  const tabsHintId = useId();
  const tabDiaId = useId();
  const tabMesId = useId();
  const panelDiaId = useId();
  const panelMesId = useId();
  const tabDiaRef = useRef(null);
  const tabMesRef = useRef(null);

  const [fecha,        setFecha]        = useState(hoy());
  const [busquedaDia,  setBusquedaDia]  = useState("");
  const [busquedaMes,  setBusquedaMes]  = useState("");
  const [vistaActiva,  setVistaActiva]  = useState("dia");
 
  const [recibosDay,   setRecibosDay]   = useState([]);
  const [loadingDay,   setLoadingDay]   = useState(false);
  const [errorDay,     setErrorDay]     = useState("");
 
  const [recibosMes,   setRecibosMes]   = useState([]);
  const [loadingMes,   setLoadingMes]   = useState(false);
  const [errorMes,     setErrorMes]     = useState("");
 
  const [seleccion,    setSeleccion]    = useState(null);

  const [searchParams, setSearchParams] = useSearchParams()


  const [fechaDesde, setFechaDesde] = useState(hoy());
  const [fechaHasta, setFechaHasta] = useState(hoy());
  const [busquedaRango, setBusquedaRango] = useState("");
  const [recibosRango, setRecibosRango] = useState([]);
  const [loadingRango, setLoadingRango] = useState(false);
  const [errorRango, setErrorRango] = useState("");


  const cargarDia = useCallback(async (f) => {
    setLoadingDay(true); setErrorDay("");
    try {
      const res = await authFetch(`${API_URL}/api/recibos?fecha=${f}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();
      setRecibosDay(data);
    } catch (e) {
      if (e.name === "AbortError") return;

      setErrorDay(e.message || "No se pudo cargar.");
      setRecibosDay([]);
    } finally {
      if (!signal.aborted) {
        setLoadingDay(false);
      }
    }
  }, []);

  const cargarMes = useCallback(async (f, signal) => {
    setLoadingMes(true);
    setErrorMes("");

    try {
      const mes = f.slice(0, 7);
      const res = await authFetch(`${API_URL}/api/recibos/resumen-mes?fecha=${mes}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setRecibosMes(await res.json());
    } catch (e) {
      setErrorMes(e.message || "No se pudo cargar."); setRecibosMes([]);
    } finally { setLoadingMes(false); }
  }, []);

  const cargarRango = useCallback(async (desde, hasta) => {
    setLoadingRango(true); setErrorRango("");
    try {
      const res = await authFetch(
        `${API_URL}/api/recibos/rango-fechas?desde=${desde}&hasta=${hasta}`
      );
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setRecibosRango(await res.json());
    } catch (e) {
      setErrorRango(e.message || "No se pudo cargar."); setRecibosRango([]);
    } finally { setLoadingRango(false); }
  }, []);

  useEffect(() => {
  cargarDia(fecha);
  cargarMes(fecha);
}, [fecha, cargarDia, cargarMes]);

  useEffect(() => {
    const folioParam = searchParams.get('folio')
    if (!folioParam) return
  
    const todas = [...recibosDay, ...recibosMes]
    const encontrado = todas.find(
      (r) => String(r.id_servicio_otorgado) === String(folioParam)
    )
    if (encontrado) {
      setSeleccion(encontrado)

      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete('folio')
        return next
      })
    }
  }, [searchParams, recibosDay, recibosMes, setSearchParams])

  const normalizar = (str) =>
    (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const filtrarRecibos = (lista, q) => {
    if (!q) return lista;
    const s = normalizar(q);
    return lista.filter((r) =>
      normalizar(r.beneficiario).includes(s) ||
      normalizar(r.servicio).includes(s) ||
      normalizar(String(r.id_servicio_otorgado)).includes(s)
    );
  };

  const filtradosDia = filtrarRecibos(recibosDay, busquedaDia);
  const filtradosMes = filtrarRecibos(recibosMes, busquedaMes);

  const totalDia = filtradosDia.reduce((s, r) => s + Number(r.financiero?.cuota_total ?? 0), 0);
  const pagadoDia = filtradosDia.reduce(
    (s, r) =>
      s + Number(r.financiero?.monto_pagado ?? 0) + Number(r.financiero?.monto_donacion ?? 0),
    0
  );
  const totalMes = filtradosMes.reduce((s, r) => s + Number(r.financiero?.cuota_total ?? 0), 0);
  const pagadoMes = filtradosMes.reduce(
    (s, r) =>
      s + Number(r.financiero?.monto_pagado ?? 0) + Number(r.financiero?.monto_donacion ?? 0),
    0
  );

  const onTabsKeyDown = (event) => {
    const tabs = ["dia", "mes", "rango"];
    const currentIndex = tabs.indexOf(vistaActiva);

    if (event.key === "Home") { setVistaActiva("dia"); return; }
    if (event.key === "End") { setVistaActiva("rango"); return; }

    const nextIndex = event.key === "ArrowRight"
      ? (currentIndex + 1) % tabs.length
      : (currentIndex - 1 + tabs.length) % tabs.length;
    setVistaActiva(tabs[nextIndex]);
  };

  return (
    <main className="recibos-page" aria-labelledby="recibos-page-title">
      <header className="recibos-header page-header">
        <div className="recibos-heading">
          <h1 id="recibos-page-title" className="page-header-title">Recibos</h1>
          <p className="page-header-subtitle">Registro de servicios y cobros</p>
        </div>
        {vistaActiva !== "rango" && (
          <div className="fecha-wrap">
            <label htmlFor={fechaInputId} className="fecha-label"> Fecha </label>
            <input
              id={fechaInputId}
              className="fecha-input"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
            <button className="btn-hoy" onClick={() => setFecha(hoy())}> Hoy </button>
          </div>
        )}
      </header>

      <div className="recibos-tabs-wrap">
        <p id={tabsHintId} className="sr-only">
          Usa las flechas izquierda y derecha para cambiar entre recibos del día y del mes.
        </p>
        <div
          className="recibos-tabs"
          role="tablist"
          aria-label="Vistas de recibos"
          aria-describedby={tabsHintId}
          onKeyDown={onTabsKeyDown}
        >
          <button
            ref={tabDiaRef}
            id={tabDiaId}
            role="tab"
            type="button"
            aria-selected={vistaActiva === "dia"}
            aria-controls={panelDiaId}
            tabIndex={vistaActiva === "dia" ? 0 : -1}
            className={`recibos-tab ${vistaActiva === "dia" ? "is-active" : ""}`}
            onClick={() => setVistaActiva("dia")}
          >
            Recibos del día
          </button>
          <button
            ref={tabMesRef}
            id={tabMesId}
            role="tab"
            type="button"
            aria-selected={vistaActiva === "mes"}
            aria-controls={panelMesId}
            tabIndex={vistaActiva === "mes" ? 0 : -1}
            className={`recibos-tab ${vistaActiva === "mes" ? "is-active" : ""}`}
            onClick={() => setVistaActiva("mes")}
          >
            Recibos del mes
          </button>

          <button
            role="tab"
            type="button"
            aria-selected={vistaActiva === "rango"}
            tabIndex={vistaActiva === "rango" ? 0 : -1}
            className={`recibos-tab ${vistaActiva === "rango" ? "is-active" : ""}`}
            onClick={() => setVistaActiva("rango")}
          >
            Rango de fechas
          </button>
        </div>
      </div>

      {vistaActiva === "dia" && (
        <section
          id={panelDiaId}
          className="recibos-section"
          role="tabpanel"
          aria-labelledby={tabDiaId}
          key={`dia-${fecha}`}
        >
          <div className="section-title-row">
            <div>
              <h2 id={recibosDiaHeadingId} className="section-title">Recibos del día</h2>
              <p className="section-sub">{fmtFecha(fecha)}</p>
            </div>
            <div className="search-wrap">
              <label htmlFor={busquedaDiaInputId} className="sr-only">Buscar recibos del día</label>
              <span className="search-icon" aria-hidden="true">⌕</span>
              <input
                id={busquedaDiaInputId}
                className="search-input"
                type="text"
                placeholder="Buscar folio, beneficiario o servicio…"
                value={busquedaDia}
                onChange={(e) => setBusquedaDia(e.target.value)}
              />
            </div>
          </div>

          {!loadingDay && filtradosDia.length > 0 && (
            <div className="resumen-strip">
              <ResumenCard label="Recibos del día" value={filtradosDia.length} sub={fmtFecha(fecha)} index={0} />
              <ResumenCard label="Total facturado" value={fmt(totalDia)} index={1} />
              <ResumenCard label="Total cobrado" value={fmt(pagadoDia)} index={2} />
              <ResumenCard
                label="Diferencia"
                value={fmt(totalDia - pagadoDia)}
                sub={totalDia - pagadoDia > 0 ? "pendiente" : "al corriente"}
                index={3}
              />
            </div>
          )}

          <div className="recibos-card">
            <TablaRecibos
              recibos={filtradosDia}
              loading={loadingDay}
              error={errorDay}
              onVerDetalle={setSeleccion}
              mostrarFecha={false}
              emptyMsg="Sin recibos para esta fecha."
              caption={`Tabla de recibos del día ${fmtFecha(fecha)}`}
              animationKey={`dia-${fecha}-${busquedaDia}-${filtradosDia.length}`}
            />
            {!loadingDay && !errorDay && filtradosDia.length > 0 && (
              <p className="tabla-footer">
                Mostrando {filtradosDia.length} de {recibosDay.length} recibos · {fmtFecha(fecha)}
              </p>
            )}
          </div>
        </section>
      )}

      {vistaActiva === "mes" && (
        <section
          id={panelMesId}
          className="recibos-section"
          role="tabpanel"
          aria-labelledby={tabMesId}
          key={`mes-${fecha}`}
        >
          <div className="section-title-row">
            <div>
              <h2 id={recibosMesHeadingId} className="section-title">Recibos del mes</h2>
              <p className="section-sub">{fmtMes(fecha)}</p>
            </div>
            <div className="search-wrap">
              <label htmlFor={busquedaMesInputId} className="sr-only">Buscar recibos del mes</label>
              <span className="search-icon" aria-hidden="true">⌕</span>
              <input
                id={busquedaMesInputId}
                className="search-input"
                type="text"
                placeholder="Buscar folio, beneficiario o servicio…"
                value={busquedaMes}
                onChange={(e) => setBusquedaMes(e.target.value)}
              />
            </div>
          </div>

          {!loadingMes && filtradosMes.length > 0 && (
            <div className="resumen-strip resumen-mes">
              <ResumenCard label="Recibos del mes" value={filtradosMes.length} index={0} />
              <ResumenCard label="Total facturado" value={fmt(totalMes)} index={1} />
              <ResumenCard label="Total cobrado" value={fmt(pagadoMes)} index={2} />
              <ResumenCard
                label="Diferencia"
                value={fmt(totalMes - pagadoMes)}
                sub={totalMes - pagadoMes > 0 ? "pendiente" : "al corriente"}
                index={3}
              />
            </div>
          )}

          <div className="recibos-card">
            <TablaRecibos
              recibos={filtradosMes}
              loading={loadingMes}
              error={errorMes}
              onVerDetalle={setSeleccion}
              mostrarFecha={true}
              emptyMsg="Sin recibos para este mes."
              caption={`Tabla de recibos del mes ${fmtMes(fecha)}`}
              animationKey={`mes-${fecha}-${busquedaMes}-${filtradosMes.length}`}
            />
            {!loadingMes && !errorMes && filtradosMes.length > 0 && (
              <p className="tabla-footer">
                Mostrando {filtradosMes.length} de {recibosMes.length} recibos · {fmtMes(fecha)}
              </p>
            )}
          </div>
        </section>
      )}

      {vistaActiva === "rango" && (
        <section className="recibos-section" role="tabpanel">
          <div className="section-title-row">
            <div>
              <h2 className="section-title">Rango personalizado</h2>
              <p className="section-sub">
                {fmtFecha(fechaDesde)} — {fmtFecha(fechaHasta)}
              </p>
            </div>
            <div className="search-wrap">
              <span className="search-icon" aria-hidden="true">⌕</span>
              <input
                className="search-input"
                type="text"
                placeholder="Buscar folio, beneficiario o servicio…"
                value={busquedaRango}
                onChange={(e) => setBusquedaRango(e.target.value)}
              />
            </div>
          </div>

          <div className="fecha-wrap" style={{ marginBottom: 16 }}>
            <label className="fecha-label">Desde</label>
            <input
              className="fecha-input"
              type="date"
              value={fechaDesde}
              max={fechaHasta}
              onChange={(e) => setFechaDesde(e.target.value)}
            />
            <label className="fecha-label">Hasta</label>
            <input
              className="fecha-input"
              type="date"
              value={fechaHasta}
              min={fechaDesde}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
            <button
              className="btn-hoy"
              onClick={() => cargarRango(fechaDesde, fechaHasta)}
            >
              Buscar
            </button>
          </div>

          {!loadingRango && recibosRango.length > 0 && (() => {
            const filtrados = filtrarRecibos(recibosRango, busquedaRango);
            const total = filtrados.reduce((s, r) => s + Number(r.financiero?.cuota_total ?? 0), 0);
            const pagado = filtrados.reduce((s, r) => s + Number(r.financiero?.monto_pagado ?? 0), 0);
            return (
              <>
                <div className="resumen-strip">
                  <ResumenCard label="Recibos" value={filtrados.length} index={0} />
                  <ResumenCard label="Total facturado" value={fmt(total)} index={1} />
                  <ResumenCard label="Total cobrado" value={fmt(pagado)} index={2} />
                  <ResumenCard
                    label="Diferencia"
                    value={fmt(total - pagado)}
                    sub={total - pagado > 0 ? "pendiente" : "al corriente"}
                    index={3}
                  />
                </div>
                <div className="recibos-card">
                  <TablaRecibos
                    recibos={filtrados}
                    loading={loadingRango}
                    error={errorRango}
                    onVerDetalle={setSeleccion}
                    mostrarFecha={true}
                    emptyMsg="Sin recibos para este rango."
                    caption={`Recibos del ${fmtFecha(fechaDesde)} al ${fmtFecha(fechaHasta)}`}
                    animationKey={`rango-${fechaDesde}-${fechaHasta}-${busquedaRango}`}
                  />
                  <p className="tabla-footer">
                    Mostrando {filtrados.length} de {recibosRango.length} recibos
                  </p>
                </div>
              </>
            );
          })()}

          {loadingRango && <div className="recibos-card"><Skeleton rows={4} /></div>}
          {errorRango && <div className="estado-msg estado-error">⚠ {errorRango}</div>}
          {!loadingRango && !errorRango && recibosRango.length === 0 && (
            <div className="estado-msg">Selecciona un rango y pulsa Buscar.</div>
          )}
        </section>
      )}
      

      <ReciboDetalle recibo={seleccion} onClose={() => setSeleccion(null)} />
    </main>
  );
}