import { Calendar, User, Stethoscope } from "lucide-react";
import styles from "../styles/BusquedaBeneficiarioVista.module.css";

const TIPOS_SERVICIO = [
  "Consulta general",
  "Fisioterapia",
  "Neurología",
  "Ortopedia",
];

const MEDICOS = [
  "Dr. García",
  "Dra. López",
  "Dr. Ramírez",
];

export default function StepDetalles({
  fecha,
  setFecha,
  tipoServicio,
  setTipoServicio,
  medico,
  setMedico,
}) {
  return (
    <div className={styles.panel}>
      <div className={styles.formGrid3}>
        
        {/* Fecha */}
        <div className={styles.field}>
          <label htmlFor="fecha" className={styles.fieldLabel}>
            <Calendar size={14} style={{ marginRight: 6 }} />
            Fecha
          </label>
          <input
            id="fecha"
            type="date"
            className={styles.input}
            value={fecha}
            onChange={(e) => {
              console.log("onChange fecha:", e.target.value);
              setFecha(e.target.value);
            }}
            onBlur={() => console.log("onBlur fecha")}
            onFocus={() => console.log("onFocus fecha")}
          />
        </div>

        {/* Tipo servicio */}
        <div className={styles.field}>
          <label className={styles.fieldLabel}>
            <Stethoscope size={14} style={{ marginRight: 6 }} />
            Servicio
          </label>
          <select
            className={styles.select}
            value={tipoServicio}
            onChange={(e) => setTipoServicio(e.target.value)}
          >
            <option value="">Seleccionar</option>
            {TIPOS_SERVICIO.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Médico */}
        <div className={styles.field}>
          <label className={styles.fieldLabel}>
            <User size={14} style={{ marginRight: 6 }} />
            Médico
          </label>
          <select
            className={styles.select}
            value={medico}
            onChange={(e) => setMedico(e.target.value)}
          >
            <option value="">Seleccionar</option>
            {MEDICOS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>

      </div>
    </div>
  );
}