import { useState } from "react";
import "./Prerregistro.css";

const espinaBifidaOptions = [
  { value: 1, label: "Encefalocele" },
  { value: 2, label: "Espina Bífida Oculta" },
  { value: 3, label: "Hidrocefalia Congénita" },
  { value: 4, label: "Lipo-Mielomeningocele" },
  { value: 5, label: "Lipocele" },
  { value: 6, label: "Médula Anclada" },
  { value: 7, label: "Meningocele" },
  { value: 8, label: "Mielomeningocele" },
  { value: 9, label: "Otros" },
];

const STEPS = ["Identidad", "Datos Demográficos", "Diagnóstico"];
const soloLetras = (v) => v.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, "");

// Indicador de la sección en que se encuentra
function StepIndicator({ currentStep, completedSteps, onGoTo }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">ASEB</div>
        <span>Prerregistro</span>
      </div>
      <nav className="step-nav">
        {STEPS.map((label, i) => {
          const state = completedSteps.includes(i)
            ? "completed"
            : currentStep === i
              ? "active"
              : "pending";
          const clickable = completedSteps.includes(i) && currentStep !== i;
          return (
            <div
              key={i}
              className={`step-item step-${state} ${clickable ? "step-clickable" : ""}`}
              onClick={() => clickable && onGoTo(i)}
              title={clickable ? `Editar: ${label}` : undefined}
            >
              <div className="step-dot">
                {state === "completed" ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span className="step-label">{label}</span>
              {clickable && <span className="step-edit-hint">editar</span>}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

// Componentes compartidos
function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="section-header">
      <div className="section-icon">{icon}</div>
      <div>
        <h2>{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="field">
      <label className="field-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      {children}
    </div>
  );
}

// Sección de identidad del usuario
function StepIdentidad({ savedData, onComplete }) {
  const d = savedData || {};
  const [nombre, setNombre] = useState(d.nombre || "");
  const [segundoNombre, setSegundoNombre] = useState(d.segundoNombre || "");
  const [tieneSegundo, setTieneSegundo] = useState(!!(d.segundoNombre));
  const [paterno, setPaterno] = useState(d.paterno || "");
  const [materno, setMaterno] = useState(d.materno || "");

  const valid =
    nombre.trim() && paterno.trim() && materno.trim() &&
    (!tieneSegundo || segundoNombre.trim());

  const handleSubmit = () => {
    if (!valid) return;
    onComplete({ nombre, segundoNombre: tieneSegundo ? segundoNombre : "", paterno, materno });
  };

  return (
    <div className="step-content">
      <SectionHeader title="Identidad" subtitle="Ingresa el nombre completo del beneficiario." />
      <div className="fields-grid">
        <Field label="Nombre(s)" required>
          <input
            type="text"
            placeholder="Ej. Aldo"
            value={nombre}
            onChange={(e) => setNombre(soloLetras(e.target.value))}
          />
        </Field>

        <div className="inline-check">
          <input
            type="checkbox"
            id="segundo"
            checked={tieneSegundo}
            onChange={(e) => {
              setTieneSegundo(e.target.checked);
              if (!e.target.checked) setSegundoNombre("");
            }}
          />
          <label htmlFor="segundo">¿Tiene segundo nombre?</label>
        </div>

        {tieneSegundo && (
          <Field label="Segundo nombre">
            <input
              type="text"
              placeholder="Ej. Pablo"
              value={segundoNombre}
              onChange={(e) => setSegundoNombre(soloLetras(e.target.value))}
            />
          </Field>
        )}

        <div className="row-2">
          <Field label="Apellido Paterno" required>
            <input
              type="text"
              placeholder="Ej. Flores"
              value={paterno}
              onChange={(e) => setPaterno(soloLetras(e.target.value))}
            />
          </Field>
          <Field label="Apellido Materno" required>
            <input
              type="text"
              placeholder="Ej. González"
              value={materno}
              onChange={(e) => setMaterno(soloLetras(e.target.value))}
            />
          </Field>
        </div>
      </div>
      <div className="step-actions">
        <button className="btn-primary" onClick={handleSubmit} disabled={!valid}>
          Continuar →
        </button>
      </div>
    </div>
  );
}

// Sección de demografía
function StepDemografia({ savedData, onComplete, onBack }) {
  const d = savedData || {};
  const [fecha, setFecha] = useState(d.fecha || "");
  const [genero, setGenero] = useState(d.genero || "");
  const [curp, setCurp] = useState(d.curp || "");

  const valid = fecha && genero && curp.trim().length === 18;

  return (
    <div className="step-content">
      <SectionHeader title="Datos Demográficos" subtitle="Información de identificación oficial." />
      <div className="fields-grid">
        <div className="row-2">
          <Field label="Fecha de nacimiento" required>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </Field>
          <Field label="Género" required>
            <select value={genero} onChange={(e) => setGenero(e.target.value)}>
              <option value="">Seleccionar género...</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
          </Field>
        </div>
        <Field label="CURP" required>
          <input
            type="text"
            placeholder="XXXX000000XXXXXX00"
            maxLength={18}
            value={curp}
            onChange={(e) => setCurp(e.target.value.toUpperCase())}
          />
          <span className="field-hint">{curp.length}/18 caracteres</span>
        </Field>
      </div>
      <div className="step-actions">
        <button className="btn-secondary" onClick={onBack}>← Anterior</button>
        <button
          className="btn-primary"
          onClick={() => valid && onComplete({ fecha, genero, curp })}
          disabled={!valid}
        >
          Continuar →
        </button>
      </div>
    </div>
  );
}

// Sección de diagnostico
function StepDiagnostico({ savedData, onComplete, onBack, isSubmitting, submitError }) {
  const d = savedData || {};
  const [selected, setSelected] = useState(d.espinaBifida || []);
  const [otrosTexto, setOtrosTexto] = useState(d.otrosTexto || "");

  const toggle = (value) =>
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );

  const tieneOtros = selected.includes(9);
  const valid = selected.length > 0 && (!tieneOtros || otrosTexto.trim());

  return (
    <div className="step-content">
      <SectionHeader title="Diagnóstico" subtitle="Selecciona uno o más tipos de Espina Bífida que apliquen." />

      <div className="checkbox-grid">
        {espinaBifidaOptions.map((opt) => (
          <label key={opt.value} className={`checkbox-card ${selected.includes(opt.value) ? "checked" : ""}`}>
            <input type="checkbox" checked={selected.includes(opt.value)} onChange={() => toggle(opt.value)} />
            <div className="checkbox-card-mark" />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>

      {tieneOtros && (
        <div className="otros-field">
          <Field label="Especifica el diagnóstico" required>
            <textarea
              rows={3}
              placeholder="Describe el diagnóstico aquí..."
              value={otrosTexto}
              onChange={(e) => setOtrosTexto(e.target.value)}
            />
          </Field>
        </div>
      )}

      {submitError && <p className="submit-error">{submitError}</p>}

      <div className="step-actions">
        <button className="btn-secondary" onClick={onBack} disabled={isSubmitting}>← Anterior</button>
        <button
          className="btn-primary"
          onClick={() => valid && onComplete({ espinaBifida: selected, otrosTexto: tieneOtros ? otrosTexto : "" })}
          disabled={!valid || isSubmitting}
        >
          {isSubmitting ? "Guardando..." : "Registrarse ✓"}
        </button>
      </div>
    </div>
  );
}

// Validación que se envio correctamente
function StepSuccess({ data }) {
  return (
    <div className="step-content success-screen">
      <div className="success-icon">✓</div>
      <h2>¡Prerregistro completado!</h2>
      <p>
        Los datos de{" "}
        <strong>{data.identidad.nombre} {data.identidad.paterno}</strong>{" "}
        han sido enviados correctamente.
      </p>
      <button className="btn-primary" onClick={() => window.location.reload()}>
        Nuevo registro
      </button>
    </div>
  );
}

// Flujo de Prerregistro
const API_BASE = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) || "http://localhost:3000";

export default function Prerregistro() {
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isDone, setIsDone] = useState(false);

  const advance = (stepData, key) => {
    setFormData((prev) => ({ ...prev, [key]: stepData }));
    setCompleted((prev) => [...new Set([...prev, step])]);
    setStep((s) => s + 1);
  };


  const goTo = (targetStep) => setStep(targetStep);
  const back = () => setStep((s) => s - 1);

  const handleFinalSubmit = async (diagnosticoData) => {
    const updated = { ...formData, diagnostico: diagnosticoData };
    setFormData(updated);
    setIsSubmitting(true);
    setSubmitError("");

    const { identidad, demografia, diagnostico } = updated;

    const nombres = [identidad.nombre, identidad.segundoNombre]
      .filter(Boolean).join(" ").trim();

    const payload = {
      nombres,
      apellido_paterno: identidad.paterno,
      apellido_materno: identidad.materno,
      fecha_nacimiento: demografia.fecha,
      genero: demografia.genero,
      curp: demografia.curp,
      espinaBifida: diagnostico.espinaBifida,
      diagnostico_otro: diagnostico.otrosTexto || null,
    };

    try {
      const res = await fetch(`${API_BASE}/api/preregistros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Error ${res.status}`);
      }

      setCompleted((prev) => [...new Set([...prev, 2])]);
      setIsDone(true);
    } catch (err) {
      setSubmitError(err.message || "No se pudo conectar con el servidor. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="prerregistro-container">
      <StepIndicator currentStep={step} completedSteps={completed} onGoTo={goTo} />
      <main className="main-content">
        <div className="card">
          {isDone ? (
            <StepSuccess data={formData} />
          ) : step === 0 ? (
            <StepIdentidad
              savedData={formData.identidad}
              onComplete={(d) => advance(d, "identidad")}
            />
          ) : step === 1 ? (
            <StepDemografia
              savedData={formData.demografia}
              onComplete={(d) => advance(d, "demografia")}
              onBack={back}
            />
          ) : (
            <StepDiagnostico
              savedData={formData.diagnostico}
              onComplete={handleFinalSubmit}
              onBack={back}
              isSubmitting={isSubmitting}
              submitError={submitError}
            />
          )}
        </div>
      </main>
    </div>
  );
}