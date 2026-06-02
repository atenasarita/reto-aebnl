import { useState } from "react";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import "../styles/Preregistro.css";

import { API_URL } from "../../utils/config";
import { espinaBifidaOptions } from "../../utils/espinaBifidaTypes";
import { limpiarSoloLetras, validarCURP } from "../../utils/validator";
import { todayDate } from "../../utils/dateTime";

const STEPS = [
  { key: "identidad", label: "Identidad" },
  { key: "datos", label: "Datos" },
  { key: "diagnostico", label: "Diagnóstico" },
];


function StepIndicator({ currentStep }) {
  const progress =
    STEPS.length > 1 ? (currentStep / (STEPS.length - 1)) * 100 : 0;

  return (
    <div className="preregistro-steps" aria-label="Pasos del formulario">
      <div className="preregistro-steps-header">
        <span className="preregistro-steps-eyebrow">
          Paso {currentStep + 1} de {STEPS.length}
        </span>
        <span className="preregistro-steps-title">{STEPS[currentStep].label}</span>
      </div>

      <div
        className="preregistro-steps-bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-label={`Progreso del formulario: paso ${currentStep + 1} de ${STEPS.length}`}
      >
        <div
          className="preregistro-steps-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function Field({ label, required, children, className = "" }) {
  return (
    <div className={`preregistro-field ${className}`.trim()}>
      <label className="preregistro-label">
        {label}
        {required && <span className="preregistro-required">*</span>}
      </label>
      {children}
    </div>
  );
}

function StepIntro({ title, subtitle }) {
  return (
    <div className="preregistro-form-intro">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}

function StepIdentidad({ savedData, onComplete }) {
  const d = savedData || {};
  const [nombre, setNombre] = useState(d.nombre || "");
  const [segundoNombre, setSegundoNombre] = useState(d.segundoNombre || "");
  const [tieneSegundo, setTieneSegundo] = useState(!!d.segundoNombre);
  const [paterno, setPaterno] = useState(d.paterno || "");
  const [materno, setMaterno] = useState(d.materno || "");

  const valid =
    nombre.trim() &&
    paterno.trim() &&
    materno.trim() &&
    (!tieneSegundo || segundoNombre.trim());

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!valid) return;
    onComplete({
      nombre,
      segundoNombre: tieneSegundo ? segundoNombre : "",
      paterno,
      materno,
    });
  };

  return (
    <form className="preregistro-step-form" onSubmit={handleSubmit} noValidate>
      <StepIntro
        title="Información del Paciente"
        subtitle="Ingresa el nombre completo de la persona que deseas registrar."
      />

      <div className="preregistro-form-grid">
        <Field
          label={
            <span className="preregistro-label-row">
              Nombre(s)<span className="preregistro-required">*</span>
              <label className="preregistro-inline-check preregistro-inline-check--sm">
                <input
                  type="checkbox"
                  checked={tieneSegundo}
                  onChange={(e) => {
                    setTieneSegundo(e.target.checked);
                    if (!e.target.checked) setSegundoNombre("");
                  }}
                />
                <span>+ Segundo nombre</span>
              </label>
            </span>
          }
          className={tieneSegundo ? "" : "preregistro-field--full"}
        >
          <input
            type="text"
            placeholder="Ej. Juan"
            value={nombre}
            onChange={(e) => setNombre(limpiarSoloLetras(e.target.value))}
          />
        </Field>

        {tieneSegundo && (
          <Field label="Segundo nombre">
            <input
              type="text"
              placeholder="Ej. Pablo"
              value={segundoNombre}
              onChange={(e) => setSegundoNombre(limpiarSoloLetras(e.target.value))}
            />
          </Field>
        )}

        <Field label="Apellido Paterno" required>
          <input
            type="text"
            placeholder="Primer apellido"
            value={paterno}
            onChange={(e) => setPaterno(limpiarSoloLetras(e.target.value))}
          />
        </Field>

        <Field label="Apellido Materno" required>
          <input
            type="text"
            placeholder="Segundo apellido"
            value={materno}
            onChange={(e) => setMaterno(limpiarSoloLetras(e.target.value))}
          />
        </Field>
      </div>

      <div className="preregistro-step-actions">
        <button type="submit" className="preregistro-submit-btn" disabled={!valid}>
          Continuar
          <ArrowRight size={20} />
        </button>
      </div>
    </form>
  );
}

function StepDemografia({ savedData, onComplete, onBack }) {
  const d = savedData || {};
  const [fecha, setFecha] = useState(d.fecha || "");
  const [genero, setGenero] = useState(d.genero || "");
  const [curp, setCurp] = useState(d.curp || "");
  const today = todayDate();

  const valid = fecha && genero && validarCURP(curp);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!valid) return;
    onComplete({ fecha, genero, curp });
  };

  return (
    <form className="preregistro-step-form" onSubmit={handleSubmit} noValidate>
      <StepIntro
        title="Datos de Identificación"
        subtitle="Necesitamos estos datos para confirmar la identidad oficial del beneficiario."
      />

      <div className="preregistro-form-grid">
        <Field label="Fecha de Nacimiento" required>
          <input
            type="date"
            value={fecha}
            max={today}
            onChange={(e) => setFecha(e.target.value)}
          />
        </Field>

        <Field label="Género" required>
          <div className="preregistro-radio-group">
            {[
              { value: "masculino", label: "Masculino" },
              { value: "femenino", label: "Femenino" },
              { value: "otro", label: "Otro" },
            ].map((opt) => (
              <label key={opt.value} className="preregistro-radio">
                <input
                  type="radio"
                  name="genero"
                  value={opt.value}
                  checked={genero === opt.value}
                  onChange={() => setGenero(opt.value)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </Field>

        <Field label="CURP" required className="preregistro-field--full">
          <input
            type="text"
            placeholder="Clave Única de Registro de Población"
            maxLength={18}
            value={curp}
            onChange={(e) => setCurp(e.target.value.toUpperCase().slice(0, 18))}
            className="preregistro-input-curp"
          />
          <span className="preregistro-hint">{curp.length}/18 caracteres</span>
        </Field>
      </div>

      <div className="preregistro-step-actions preregistro-step-actions--split">
        <button type="button" className="preregistro-secondary-btn" onClick={onBack}>
          <ArrowLeft size={18} />
          Anterior
        </button>
        <button type="submit" className="preregistro-submit-btn" disabled={!valid}>
          Continuar
          <ArrowRight size={20} />
        </button>
      </div>
    </form>
  );
}

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

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!valid || isSubmitting) return;
    onComplete({
      espinaBifida: selected,
      otrosTexto: tieneOtros ? otrosTexto : "",
    });
  };

  return (
    <form className="preregistro-step-form" onSubmit={handleSubmit} noValidate>
      <StepIntro
        title="Diagnóstico Médico"
        subtitle="Selecciona uno o más tipos de Espina Bífida que apliquen al beneficiario."
      />

      <div className="preregistro-form-grid">
        <div className="preregistro-field preregistro-field--full">
          <span className="preregistro-label">
            Tipo de Espina Bífida<span className="preregistro-required">*</span>
          </span>
          <div className="preregistro-checkbox-grid">
            {espinaBifidaOptions.map((opt) => {
              const checked = selected.includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className={`preregistro-checkbox-card${checked ? " is-checked" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(opt.value)}
                  />
                  <span className="preregistro-checkbox-mark" aria-hidden="true">
                    {checked && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="white"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {tieneOtros && (
          <Field label="Especifica el diagnóstico" required className="preregistro-field--full">
            <textarea
              rows={3}
              placeholder="Describe el diagnóstico aquí..."
              value={otrosTexto}
              onChange={(e) => setOtrosTexto(e.target.value)}
            />
          </Field>
        )}
      </div>

      {submitError && <p className="preregistro-error">{submitError}</p>}

      <div className="preregistro-cta">
        <div className="preregistro-step-actions preregistro-step-actions--split">
          <button
            type="button"
            className="preregistro-secondary-btn"
            onClick={onBack}
            disabled={isSubmitting}
          >
            <ArrowLeft size={18} />
            Anterior
          </button>
          <button
            type="submit"
            className="preregistro-submit-btn"
            disabled={!valid || isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Enviar Preregistro"}
            <Send size={20} />
          </button>
        </div>
        <p className="preregistro-privacy">
          Al enviar, usted acepta que la asociación trate sus datos bajo nuestro
          Aviso de Privacidad.
        </p>
      </div>
    </form>
  );
}

function SuccessScreen({ data, onReset }) {
  const nombreCompleto = [
    data.identidad?.nombre,
    data.identidad?.segundoNombre,
    data.identidad?.paterno,
    data.identidad?.materno,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="preregistro-success">
      <div className="preregistro-success-icon" aria-hidden="true">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 13l4 4L19 7"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h2>¡Preregistro completado!</h2>
      <p className="preregistro-success-name">{nombreCompleto}</p>
      <p className="preregistro-success-msg">
        Tus datos han sido enviados correctamente.
      </p>
      <button type="button" className="preregistro-submit-btn" onClick={onReset}>
        Registrar otra persona
        <ArrowRight size={20} />
      </button>
    </div>
  );
}

export default function Preregistro() {
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

  const back = () => setStep((s) => s - 1);

  const resetForm = () => {
    setStep(0);
    setCompleted([]);
    setFormData({});
    setSubmitError("");
    setIsDone(false);
    setIsSubmitting(false);
  };

  const handleFinalSubmit = async (diagnosticoData) => {
    const updated = { ...formData, diagnostico: diagnosticoData };
    setFormData(updated);
    setIsSubmitting(true);
    setSubmitError("");

    const { identidad, demografia, diagnostico } = updated;

    const nombres = [identidad.nombre, identidad.segundoNombre]
      .filter(Boolean)
      .join(" ")
      .trim();

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
      setSubmitError(
        err.message || "No se pudo conectar con el servidor. Intenta de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formBody = (
    <>
      {!isDone && <StepIndicator currentStep={step} />}
      <div className="preregistro-form">
        {isDone ? (
          <SuccessScreen data={formData} onReset={resetForm} />
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
    </>
  );

  return (
    <div className="preregistro-page preregistro-page--landing">
      <div className="preregistro-landing-card">{formBody}</div>
    </div>
  );
}
