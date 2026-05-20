import { useState } from "react";
import "../styles/Prerregistro.css";

import { API_URL } from '../../utils/config';
import {espinaBifidaOptions} from '../../utils/espinaBifidaTypes';


const STEPS = ["Identidad", "Datos Demográficos", "Diagnóstico"];
const soloLetras = (v) => v.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, "");

// Indicador de la sección en que se encuentra
function StepIndicator({ currentStep, completedSteps, onGoTo }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">ASEB</div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">Asociación Espina Bífida</span>
          <span className="sidebar-brand-sub">Prerregistro</span>
        </div>
      </div>

      <div className="sidebar-welcome">
        <p>Completa los 3 pasos para registrar a tu familiar o beneficiario.</p>
      </div>

      <nav className="step-nav" aria-label="Pasos del formulario">
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
              role={clickable ? "button" : undefined}
              tabIndex={clickable ? 0 : undefined}
              onKeyDown={clickable ? (e) => e.key === "Enter" && onGoTo(i) : undefined}
              aria-label={clickable ? `Editar paso ${i + 1}: ${label}` : undefined}
              aria-current={state === "active" ? "step" : undefined}
            >
              <div className="step-dot">
                {state === "completed" ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span aria-hidden="true">{i + 1}</span>
                )}
              </div>
              <div className="step-info">
                <span className="step-label">{label}</span>
                {state === "completed" && <span className="step-done-badge">Completado</span>}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <p>¿Tienes dudas? Comunícate con nosotros antes de continuar.</p>
      </div>
    </aside>
  );
}

// Indicador de progreso horizontal para móvil
function MobileStepBar({ currentStep, completedSteps }) {
  return (
    <div className="mobile-steps" aria-label="Progreso del formulario">
      {STEPS.map((label, i) => {
        const state = completedSteps.includes(i)
          ? "completed"
          : currentStep === i
            ? "active"
            : "pending";
        return (
          <div key={i} className={`mobile-step mobile-step--${state}`}>
            <div className="mobile-step-dot">
              {state === "completed" ? (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span aria-hidden="true">{i + 1}</span>
              )}
            </div>
            <span className="mobile-step-label">{label}</span>
            {i < STEPS.length - 1 && <div className="mobile-step-line" />}
          </div>
        );
      })}
    </div>
  );
}

// Componentes compartidos
function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="section-header">
      {icon ? <div className="section-icon">{icon}</div> : null}
      <div className="section-header-copy">
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
      <SectionHeader title="Paso 1 — Identidad" subtitle="Ingresa el nombre completo de la persona que deseas registrar." />
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
      <SectionHeader title="Paso 2 — Datos de identificación" subtitle="Necesitamos estos datos para confirmar la identidad oficial del beneficiario." />
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
      <SectionHeader title="Paso 3 — Diagnóstico médico" subtitle="Selecciona uno o más tipos de Espina Bífida que apliquen al beneficiario. Puedes elegir varias opciones." />

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
          {isSubmitting ? "Guardando..." : "Registrarse"}
        </button>
      </div>
    </div>
  );
}

// Validación que se envio correctamente
function StepSuccess({ data }) {
  return (
    <div className="step-content success-screen">
      <div className="success-icon" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2>¡Prerregistro completado!</h2>
      <p className="success-name">
        {data.identidad.nombre} {data.identidad.segundoNombre ? `${data.identidad.segundoNombre} ` : ""}{data.identidad.paterno} {data.identidad.materno}
      </p>
      <p className="success-msg">
        Tus datos han sido enviados correctamente. El personal de la asociación se comunicará contigo para completar el proceso de registro.
      </p>
      <div className="success-note">
        <p>Guarda o toma captura de este mensaje como confirmación de tu prerregistro.</p>
      </div>
      <button className="btn-primary" onClick={() => window.location.reload()}>
        Registrar otra persona
      </button>
    </div>
  );
}


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
      const res = await fetch(`${API_URL}/api/preregistros`, {
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
        <section className="prerregistro-shell">
          <header className="prerregistro-header">
            <h1>Prerregistro de Beneficiario</h1>
            <p>Completa la información en los 3 pasos para enviar la solicitud.</p>
          </header>

          <MobileStepBar currentStep={step} completedSteps={completed} />

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
        </section>
      </main>
    </div>
  );
}