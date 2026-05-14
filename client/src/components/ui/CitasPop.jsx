import { useState, useEffect, useCallback } from "react";
import "./styles/CitasPop.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const HORARIOS = [
  { label: "09:00 AM - 10:00 AM", hora: "09:00" },
  { label: "10:00 AM - 11:00 AM", hora: "10:00" },
  { label: "11:00 AM - 12:00 PM", hora: "11:00" },
  { label: "12:00 PM - 01:00 PM", hora: "12:00" },
  { label: "01:00 PM - 02:00 PM", hora: "13:00" },
  { label: "03:00 PM - 04:00 PM", hora: "15:00" },
  { label: "04:00 PM - 05:00 PM", hora: "16:00" },
];

const ESTADOS = ["programada", "completada", "cancelada"];

const hoy = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};

// Componentes compartidos
function Field({ label, required, hint, children }) {
  return (
    <div className="cp-field">
      <label className="cp-label">
        {label}
        {required && <span className="cp-required">*</span>}
      </label>
      {children}
      {hint && <p className="cp-hint">{hint}</p>}
    </div>
  );
}

function InfoChip({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="cp-chip">
      <span className="cp-chip-icon">{icon}</span>
      <div>
        <p className="cp-chip-label">{label}</p>
        <p className="cp-chip-value">{value}</p>
      </div>
    </div>
  );
}

// Buscador de beneficiario
function BuscadorBeneficiario({ value, onChange }) {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [abierto, setAbierto] = useState(false);

  const buscar = useCallback(async (q) => {
    if (q.length < 2) { setResultados([]); setAbierto(false); return; }
    setBuscando(true);
    try {
      const res = await fetch(`${API_BASE}/api/beneficiarios?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      // [{ id_beneficiario, nombres, apellido_paterno, folio, telefono, email }]
      setResultados(data);
      setAbierto(data.length > 0);
    } catch {
      setResultados([]);
      setAbierto(false);
    } finally {
      setBuscando(false);
    }
  }, []);

  useEffect(() => {
    if (!query || value) return;
    const t = setTimeout(() => buscar(query), 300);
    return () => clearTimeout(t);
  }, [query, value, buscar]);

  const handleChange = (e) => {
    setQuery(e.target.value);
    if (!e.target.value) { onChange(null); setAbierto(false); }
  };

  const seleccionar = (b) => {
    onChange(b);
    setQuery("");
    setAbierto(false);
  };

  const displayValue = value
    ? `${value.nombres} ${value.apellido_paterno}`
    : query;

  return (
    <div className="cp-buscador">
      <div className="cp-search-wrap">
        <span className="cp-search-icon">⌕</span>
        <input
          className="cp-input cp-search-input"
          type="text"
          placeholder="Buscar por nombre o número de folio…"
          value={displayValue}
          onChange={handleChange}
          onFocus={() => { if (value) { onChange(null); setQuery(""); } }}
          autoComplete="off"
        />
        {buscando && <span className="cp-spinner" />}
        {value && (
          <button
            className="cp-clear"
            onClick={() => { onChange(null); setQuery(""); }}
            type="button"
          >✕</button>
        )}
      </div>
      {abierto && (
        <ul className="cp-dropdown">
          {resultados.map((b) => (
            <li
              key={b.id_beneficiario}
              className="cp-dropdown-item"
              onClick={() => seleccionar(b)}
            >
              <div className="cp-dropdown-nombre">
                {b.nombres} {b.apellido_paterno}
              </div>
              <div className="cp-dropdown-folio">{b.folio}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Estado
function EstadoPicker({ value, onChange }) {
  return (
    <div className="cp-estado-wrap">
      {ESTADOS.map((e) => (
        <button
          key={e}
          type="button"
          className={`cp-estado-btn ${value === e ? `cp-estado-${e} active` : ""}`}
          onClick={() => onChange(e)}
        >
          {e.charAt(0).toUpperCase() + e.slice(1)}
        </button>
      ))}
    </div>
  );
}

// Formulario
function CitasForm({ onClose, onSuccess, cita, modo }) {
  const [beneficiario, setBeneficiario] = useState(null);
  const [fecha, setFecha] = useState(
    cita?.start
      ? new Date(cita.start).toISOString().split("T")[0]
      : hoy()
  );
  const [horario, setHorario] = useState(
    cita?.start
      ? new Date(cita.start).toTimeString().slice(0, 5)
      : HORARIOS[0].hora
  );
  const [especialista, setEspecialista] = useState(
    cita?.extendedProps?.id_especialista
      ? String(cita.extendedProps.id_especialista)
      : ""
  );
  const [servicio, setServicio] = useState(
    cita?.extendedProps?.idServicio
      ? String(cita.extendedProps.idServicio)
      : ""
  );
  const [estado, setEstado] = useState(
    cita?.extendedProps?.estatus || "programada"
  );
  const [motivo, setMotivo] = useState(
    cita?.title || ""
  );
  const [notas, setNotas] = useState(
    cita?.extendedProps?.notas || ""
  );

  const [especialistas, setEspecialistas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [cargandoCat, setCargandoCat] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // Catalogo
  useEffect(() => {
    const cargar = async () => {
      setCargandoCat(true);
      try {
        const [resEsp, resSer] = await Promise.all([
          fetch(`${API_BASE}/api/especialistas`),
          fetch(`${API_BASE}/api/catalogo-servicios`),
        ]);

        if (resEsp.ok) {
          const espData = await resEsp.json();
          // [{ id_especialista, nombre_completo, especialidad? }]
          setEspecialistas(espData);
          if (espData.length > 0) setEspecialista(String(espData[0].id_especialista));
        }

        if (resSer.ok) {
          const serData = await resSer.json();
          // [{ id_catalogo_servicio, nombre }]
          setServicios(serData);
          if (serData.length > 0) setServicio(String(serData[0].id_catalogo_servicio));
        }
      } catch {
        setError("No se pudieron cargar los catálogos. Recarga la página.");
      } finally {
        setCargandoCat(false);
      }
    };
    cargar();
  }, []);

  useEffect(() => {
    const cargarBeneficiario = async () => {
      if (!cita?.extendedProps?.idBeneficiario) return;
      try {
        const res = await fetch(
          `${API_BASE}/api/beneficiarios/${cita.extendedProps.idBeneficiario}`
        );
        if (!res.ok) throw new Error();
        const data = await res.json();

        setBeneficiario({
          id_beneficiario: data.id_beneficiario,
          folio: data.folio,
          nombres: data.identificadores?.nombres ?? "",
          apellido_paterno: data.identificadores?.apellido_paterno ?? "",
          apellido_materno: data.identificadores?.apellido_materno ?? "",
          telefono: data.identificadores?.telefono ?? null,
          email: data.identificadores?.email ?? null,
        });
      } catch (e) {
        console.error("Error cargando beneficiario", e);
      }
    };

    if (modo === "editar") {
      cargarBeneficiario();
    }
  }, [cita, modo]);

  const valido = beneficiario && fecha && horario && especialista && servicio;

  // Se guardan los datos
  const handleGuardar = async () => {
    if (!valido) return;

    setGuardando(true);
    setError("");

    const payload = {
      id_beneficiario: beneficiario.id_beneficiario,
      id_especialista: Number(especialista),
      id_catalogo_servicio: Number(servicio),
      fecha,
      hora: horario,
      motivo: motivo || null,
      notas: notas || null,
      estatus: estado,
    };

    try {

      const url =
        modo === "editar"
          ? `${API_BASE}/api/citas/${cita.id}`
          : `${API_BASE}/api/citas`;

      const method =
        modo === "editar"
          ? "PUT"
          : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Error ${res.status}`);
      }

      const data = await res.json();

      onSuccess?.(data);
      onClose();

    } catch (e) {

      setError(
        e.message || "No se pudo guardar la cita."
      );

    } finally {

      setGuardando(false);

    }
  };

  return (
    <div className="cp-body">

      {/* Seccion de Beneficiario*/}
      <section className="cp-section">
        <div className="cp-section-title">
          <span className="cp-section-icon">👤</span>
          Selección de Beneficiario
        </div>
        <Field label="Buscar beneficiario" required>
          <BuscadorBeneficiario value={beneficiario} onChange={setBeneficiario} />
        </Field>
        {beneficiario && (
          <div className="cp-chips-row">
            <InfoChip
              icon="📞"
              label="Teléfono de contacto"
              value={beneficiario.telefono ? `+52 ${beneficiario.telefono}` : null}
            />
            <InfoChip
              icon="✉️"
              label="Correo electrónico"
              value={beneficiario.email}
            />
          </div>
        )}
      </section>

      {/* Seccion de horario y servicio */}
      <section className="cp-section">
        <div className="cp-section-title">
          <span className="cp-section-icon">🕐</span>
          Horario y Servicio
        </div>
        <div className="cp-grid-2">
          <Field label="Fecha de la Cita" required>
            <input
              className="cp-input"
              type="date"
              value={fecha}
              min={hoy()}
              onChange={(e) => setFecha(e.target.value)}
            />
          </Field>

          <Field label="Horario" required>
            <select
              className="cp-select"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
            >
              {HORARIOS.map((h) => (
                <option key={h.hora} value={h.hora}>{h.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Especialista" required>
            <select
              className="cp-select"
              value={especialista}
              onChange={(e) => setEspecialista(e.target.value)}
              disabled={cargandoCat}
            >
              {cargandoCat
                ? <option>Cargando…</option>
                : especialistas.map((e) => (
                  <option key={e.id_especialista} value={e.id_especialista}>
                    {e.nombre_completo}
                  </option>
                ))
              }
            </select>
          </Field>

          <Field label="Tipo de Servicio" required>
            <select
              className="cp-select"
              value={servicio}
              onChange={(e) => setServicio(e.target.value)}
              disabled={cargandoCat}
            >
              {cargandoCat
                ? <option>Cargando…</option>
                : servicios.map((s) => (
                  <option key={s.id_catalogo_servicio} value={s.id_catalogo_servicio}>
                    {s.nombre}
                  </option>
                ))
              }
            </select>
          </Field>
        </div>

        <Field label="Motivo">
          <input
            className="cp-input"
            type="text"
            placeholder="Ej. Control mensual, revisión de ortesis…"
            value={motivo}
            maxLength={200}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </Field>
      </section>

      {/* Seccion de estado y observaciones */}
      <section className="cp-section">
        <div className="cp-section-title">
          <span className="cp-section-icon">📋</span>
          Estado y Observaciones
        </div>
        <Field label="Estado de la Cita">
          <EstadoPicker value={estado} onChange={setEstado} />
        </Field>
        <Field label="Notas Adicionales" hint="Máx. 200 caracteres">
          <textarea
            className="cp-textarea"
            placeholder="Ingrese cualquier requerimiento específico u observaciones médicas…"
            value={notas}
            maxLength={200}
            rows={3}
            onChange={(e) => setNotas(e.target.value)}
          />
        </Field>
      </section>

      {error && <p className="cp-error">⚠ {error}</p>}

      <footer className="cp-footer">
        <button
          className="cp-btn-secondary"
          onClick={onClose}
          disabled={guardando}
          type="button"
        >
          Descartar Cambios
        </button>
        <button
          className="cp-btn-primary"
          onClick={handleGuardar}
          disabled={!valido || guardando}
          type="button"
        >
          {guardando
            ? <><span className="cp-spinner-sm" /> Guardando…</>
            : <><span>✓</span> Confirmar Cita</>
          }
        </button>
      </footer>
    </div>
  );
}

// Componente principal del popup
export default function CitasPop({ open, onClose, onSuccess, cita = null, modo = "crear" }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="cp-overlay" onClick={onClose}>
      <div
        className="cp-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Nueva cita"
      >
        <div className="cp-header">
          <div className="cp-header-left">
            <div className="cp-header-icon">📅</div>
            <h2 className="cp-title">
              {modo === "editar"
                ? "Modificar cita"
                : "Nueva cita"}
            </h2>
          </div>
          <button className="cp-header-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        <CitasForm onClose={onClose} onSuccess={onSuccess} cita={cita} modo={modo} />
      </div>
    </div>
  );
}