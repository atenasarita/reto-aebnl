import { useState } from "react";
import {
  Search,
  ClipboardList,
  Package,
  Wallet,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  CreditCard,
  CheckCircle2,
} from "lucide-react";

import styles from "../styles/BusquedaBeneficiarioVista.module.css"

import StepBusqueda from "./StepBusqueda";
import StepDetalles from "./StepDetalles";
import StepInsumos from "./StepInsumos";
import StepFinanzas from "./StepFinanzas";



const PASOS = [
  { id: 1, tab: "Búsqueda", Icon: Search },
  { id: 2, tab: "Detalles", Icon: ClipboardList },
  { id: 3, tab: "Insumos", Icon: Package },
  { id: 4, tab: "Finanzas", Icon: Wallet },
];

const METODOS_PAGO = ["Efectivo", "Transferencia", "Tarjeta débito", "Tarjeta crédito", "Cheque"];

const PRODUCTOS_MOCK = [
  { id: 1, nombre: "Sonda vesical Fr14", precio: 85 },
  { id: 2, nombre: "Catéter intermitente", precio: 120 },
  { id: 3, nombre: "Bolsa colectora 2L", precio: 45 },
  { id: 4, nombre: "Gasas estériles x10", precio: 30 },
  { id: 5, nombre: "Guantes látex M x100", precio: 90 },
];

const BENEFICIARIOS_MOCK = [
  { folio: "BEN-001", nombre: "Ana Martínez Flores", curp: "MAFA001012MNLRLN01", membresia: "Activa" },
  { folio: "BEN-002", nombre: "Carlos Ruiz Sánchez", curp: "RUSC990305HNLLRR02", membresia: "Activa" },
];

const CITAS_HOY = [
  { id: "CITA-041", beneficiario: "Ana Martínez Flores", hora: "09:00", tipo: "Fisioterapia", medico: "Dr. García" },
  { id: "CITA-042", beneficiario: "Carlos Ruiz Sánchez", hora: "10:30", tipo: "Neurología", medico: "Dra. López" },
];

export default function BusquedaBeneficiarioVista() {
  const [pasoActual, setPasoActual] = useState(1);
  const [query, setQuery] = useState("");
  const [beneficiarioSeleccionado, setBeneficiarioSeleccionado] = useState(null);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  const [fecha, setFecha] = useState("");
  const [tipoServicio, setTipoServicio] = useState("");
  const [medico, setMedico] = useState("");

  const [insumos, setInsumos] = useState([]);
  const [productoSelec, setProductoSelec] = useState("");
  const [cantidadProducto, setCantidadProducto] = useState(1);

  const [metodoPago, setMetodoPago] = useState("");
  const [montoPagado, setMontoPagado] = useState("");
  const [descuento, setDescuento] = useState(0);
  const [guardado, setGuardado] = useState(false);

  const totalPasos = PASOS.length;
  const progresoPct = (pasoActual / totalPasos) * 100;

  const subtotalInsumos = insumos.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  const totalConDescuento = subtotalInsumos - descuento;
  const saldoRestante = totalConDescuento - (parseFloat(montoPagado) || 0);

  const resultados = query.length >= 2
  ? BENEFICIARIOS_MOCK.filter(
      (b) =>
        b.nombre.toLowerCase().includes(query.toLowerCase()) ||
        b.folio.toLowerCase().includes(query.toLowerCase()) ||
        b.curp.toLowerCase().includes(query.toLowerCase())
    )
  : [];

  const agregarInsumo = () => {
    if (!productoSelec) return;
    const prod = PRODUCTOS_MOCK.find((p) => p.id === parseInt(productoSelec));
    if (!prod) return;

    const existe = insumos.find((i) => i.id === prod.id);
    if (existe) {
      setInsumos(insumos.map((i) =>
        i.id === prod.id ? { ...i, cantidad: i.cantidad + cantidadProducto } : i
      ));
    } else {
      setInsumos([...insumos, { ...prod, cantidad: cantidadProducto }]);
    }
  };

  const puedeAvanzar = () => {
    if (pasoActual === 1) return !!(beneficiarioSeleccionado || citaSeleccionada);
    if (pasoActual === 2) return !!(fecha && tipoServicio && medico);
    if (pasoActual === 4) return !!(metodoPago && montoPagado);
    return true;
  };

  if (guardado) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.main}>
            <CheckCircle2 size={64} color="#0f766e" />
            <h2>Servicio registrado</h2>
            <button className={styles.btnPrimary} onClick={() => setGuardado(false)}>
              Nuevo servicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
        <div className={styles.description}>
          <h1 className={styles.title}>Registrar Nuevo Servicio</h1>
          <h2 className={styles.subtitle}>Complete los datos para dar de alta un nuevo servicio medico.</h2>
        </div>
      <div className={styles.inner}>

        {/* Tabs */}
        <nav className={styles.tabsWrap}>
          {PASOS.map((paso) => {
            const activo = pasoActual === paso.id;
            const completado = pasoActual > paso.id;
            const { Icon } = paso;

            return (
              <div
                key={paso.id}
                className={`${styles.tab} ${activo ? styles.tabActive : ""} ${completado ? styles.tabDone : ""}`}
              >
                <Icon size={16} />
                <span>{paso.tab}</span>
              </div>
            );
          })}
        </nav>

        <div className={styles.grid}>

          {/* MAIN */}
          <main className={styles.main}>

          {/* MAIN */}

          {pasoActual === 1 && (
            <StepBusqueda
              query={query}
              setQuery={setQuery}
              resultados={resultados}
              beneficiarioSeleccionado={beneficiarioSeleccionado}
              setBeneficiarioSeleccionado={setBeneficiarioSeleccionado}
              citaSeleccionada={citaSeleccionada}
              setCitaSeleccionada={setCitaSeleccionada}
              CITAS_HOY={CITAS_HOY}
            />
          )}
            

            {pasoActual === 2 && (
              <StepDetalles
                key="step-detalles" 
                fecha={fecha}
                setFecha={setFecha}
                tipoServicio={tipoServicio}
                setTipoServicio={setTipoServicio}
                medico={medico}
                setMedico={setMedico}
              />
            )}  

            {pasoActual === 3 && (
              <StepInsumos insumos={insumos} setInsumos={setInsumos} />
            )}

            {pasoActual === 4 && (
              <StepFinanzas
                total={subtotalInsumos}
                metodoPago={metodoPago}
                setMetodoPago={setMetodoPago}
                montoPagado={montoPagado}
                setMontoPagado={setMontoPagado}
                descuento={descuento}
                setDescuento={setDescuento}
              />
            )}

            {/* NAV */}
            <div className={styles.navRow}>
              {pasoActual > 1 && (
                <button
                  className={styles.btnSecondary}
                  onClick={() => setPasoActual(pasoActual - 1)}
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
              )}

              <div style={{ flex: 1 }} />

              {pasoActual < totalPasos ? (
                <button
                  className={styles.btnPrimary}
                  style={{
                    opacity: puedeAvanzar() ? 1 : 0.2,
                  }}
                  onClick={() => puedeAvanzar() && setPasoActual(pasoActual + 1)}
                >
                  Continuar <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  className={styles.btnPrimary}
                  onClick={() => setGuardado(true)}
                >
                  Guardar <CheckCircle2 size={16} />
                </button>
              )}
            </div>

          </main>

          {/* ASIDE */}
          <aside className={styles.aside}>
            <div className={styles.track}>
              <div
                className={styles.fill}
                style={{ width: `${progresoPct}%` }}
              />
            </div>

            <p>Total: ${totalConDescuento.toFixed(2)}</p>
            <p>Saldo: ${saldoRestante.toFixed(2)}</p>
          </aside>

        </div>
      </div>
    </div>
  );
}