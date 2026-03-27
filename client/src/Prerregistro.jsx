import { useState } from "react";
import "./Prerregistro.css";

const espinaBifidaOptions = [
  { value: "encefalocele", label: "Encefalocele" },
  { value: "oculta", label: "Espina Bífida Oculta" },
  { value: "hidrocefalia-congenita", label: "Hidrocefalia Congénita" },
  { value: "lipo-mielomeningocele", label: "Lipo-Mielomeningocele" },
  { value: "lipocele", label: "Lipocele" },
  { value: "medula-anclada", label: "Médula Anclada" },
  { value: "meningocele", label: "Meningocele" },
  { value: "mielomeningocele", label: "Mielomeningocele" },
  { value: "otros", label: "Otros" },
];

const STEPS = ["Identidad", "Datos Demográficos", "Diagnóstico"];
const soloLetras = (value) => value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, "");

function StepIndicator({ currentStep, completedSteps }) {
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
          return (
            <div key={i} className={`step-item step-${state}`}>
              <div className="step-dot">
                {state === "completed" ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span className="step-label">{label}</span>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

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

// Seccion de identidad del usuario
function StepIdentidad({ onComplete }) {
  const [nombre, setNombre] = useState("");
  const [segundoNombre, setSegundoNombre] = useState("");
  const [tieneSegundo, setTieneSegundo] = useState(false);
  const [paterno, setPaterno] = useState("");
  const [materno, setMaterno] = useState("");

  const valid = nombre.trim() && paterno.trim() && materno.trim() &&
    (!tieneSegundo || segundoNombre.trim());

  const handleSubmit = () => {
    if (!valid) return;
    onComplete({ nombre, segundoNombre: tieneSegundo ? segundoNombre : "", paterno, materno });
  };

  return (
    <div className="step-content">
      <SectionHeader
        title="Identidad"
        subtitle="Ingresa el nombre completo del beneficiario."
      />
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
            onChange={(e) => setTieneSegundo(e.target.checked)}
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

// Seccion de demografia
function StepDemografia({ onComplete, onBack }) {
  const [fecha, setFecha] = useState("");
  const [genero, setGenero] = useState("");
  const [curp, setCurp] = useState("");

  const valid = fecha && genero && curp.trim().length === 18;

  const handleSubmit = () => {
    if (!valid) return;
    onComplete({ fecha, genero, curp });
  };

  return (
    <div className="step-content">
      <SectionHeader
        title="Datos Demográficos"
        subtitle="Información de identificación oficial."
      />
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
        <button className="btn-primary" onClick={handleSubmit} disabled={!valid}>
          Continuar →
        </button>
      </div>
    </div>
  );
}

// Seccion de diagnostico
function StepDiagnostico({ onComplete, onBack }) {
  const [selected, setSelected] = useState([]);
  const [otrosTexto, setOtrosTexto] = useState("");

  const toggle = (value) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const tieneOtros = selected.includes("otros");
  const valid = selected.length > 0 && (!tieneOtros || otrosTexto.trim());

  const handleSubmit = () => {
    if (!valid) return;
    onComplete({ espinaBifida: selected, otrosTexto: tieneOtros ? otrosTexto : "" });
  };

  return (
    <div className="step-content">
      <SectionHeader
        title="Diagnóstico"
        subtitle="Selecciona uno o más tipos de Espina Bífida que apliquen."
      />
      <div className="checkbox-grid">
        {espinaBifidaOptions.map((opt) => (
          <label key={opt.value} className={`checkbox-card ${selected.includes(opt.value) ? "checked" : ""}`}>
            <input
              type="checkbox"
              checked={selected.includes(opt.value)}
              onChange={() => toggle(opt.value)}
            />
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
      <div className="step-actions">
        <button className="btn-secondary" onClick={onBack}>← Anterior</button>
        <button className="btn-primary" onClick={handleSubmit} disabled={!valid}>
          Registrarse ✓
        </button>
      </div>
    </div>
  );
}

// Validacion que se envio correctamente
function StepSuccess({ data }) {
  return (
    <div className="step-content success-screen">
      <div className="success-icon">✓</div>
      <h2>¡Prerregistro completado!</h2>
      <p>Los datos de <strong>{data.identidad.nombre} {data.identidad.paterno}</strong> han sido enviados correctamente.</p>
      <button className="btn-primary" onClick={() => window.location.reload()}>
        Nuevo registro
      </button>
    </div>
  );
}

// Flujo de Prreregistro
export default function Prerregistro() {
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [formData, setFormData] = useState({});

  const advance = (stepData, key) => {
    setFormData((prev) => ({ ...prev, [key]: stepData }));
    setCompleted((prev) => [...new Set([...prev, step])]);
    setStep((s) => s + 1);
  };

  const back = () => setStep((s) => s - 1);

  const isDone = step >= STEPS.length;

  return (
    <div className="prerregistro-container">
      <StepIndicator currentStep={step} completedSteps={completed} />
      <main className="main-content">
        <div className="card">
          {isDone ? (
            <StepSuccess data={formData} />
          ) : step === 0 ? (
            <StepIdentidad onComplete={(d) => advance(d, "identidad")} />
          ) : step === 1 ? (
            <StepDemografia onComplete={(d) => advance(d, "demografia")} onBack={back} />
          ) : (
            <StepDiagnostico onComplete={(d) => advance(d, "diagnostico")} onBack={back} />
          )}
        </div>
      </main>
    </div>
  );
}