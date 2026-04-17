import { useState } from "react";
import { Search, User, Calendar } from "lucide-react";
import styles from "../styles/BusquedaBeneficiarioVista.module.css";

export default function StepBusqueda({
  query,
  setQuery,
  resultados = [],
  beneficiarioSeleccionado,
  setBeneficiarioSeleccionado,
  citaSeleccionada,
  setCitaSeleccionada,
  CITAS_HOY = [],
}) {
  const [busquedaTab, setBusquedaTab] = useState("beneficiario");

  return (
    <div className={styles.panel}>
      <p className={styles.hint}>
        Selecciona por beneficiario activo o toma una cita programada para hoy.
      </p>

      <div className={styles.segmented}>
        <button
          className={`${styles.segBtn} ${busquedaTab === "beneficiario" ? styles.segBtnActive : ""}`}
          onClick={() => { setBusquedaTab("beneficiario"); setCitaSeleccionada(null); }}
        >
          Por beneficiario
        </button>
        <button
          className={`${styles.segBtn} ${busquedaTab === "citas" ? styles.segBtnActive : ""}`}
          onClick={() => { setBusquedaTab("citas"); setBeneficiarioSeleccionado(null); setQuery(""); }}
        >
          Citas del día
        </button>
      </div>

      {busquedaTab === "beneficiario" && (
        <>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Buscar beneficiario</span>
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                color="#9ca3af"
                style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                className={styles.input}
                style={{ paddingLeft: 44 }}
                placeholder="Nombre, folio o CURP..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setBeneficiarioSeleccionado(null); }}
              />
            </div>
          </div>

          <div className={styles.resultList}>
            {resultados.length === 0 ? (
              <p className={styles.empty}>Sin resultados</p>
            ) : (
              resultados.map((b) => {
                const activo = beneficiarioSeleccionado === b.folio;
                return (
                  <div
                    key={b.folio}
                    className={`${styles.resultRow} ${activo ? styles.resultRowActive : ""}`}
                    onClick={() => { setBeneficiarioSeleccionado(b.folio); setCitaSeleccionada(null); }}
                  >
                    <div className={styles.avatarCircle}>
                      <User size={16} color="#1e3b8a" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: 14, color: "#121317" }}>{b.nombre}</strong>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#666e85" }}>
                        {b.folio} · {b.curp}
                      </p>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
                      background: b.membresia === "Activa" ? "#dcfce7" : "#fee2e2",
                      color: b.membresia === "Activa" ? "#166534" : "#991b1b",
                    }}>
                      {b.membresia}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {busquedaTab === "citas" && (
        <div className={styles.resultList}>

          {CITAS_HOY.map((cita) => (
            <div
              key={cita.id}
              onClick={() => setCitaSeleccionada(cita.id)}
              className={`${styles.resultRow} ${citaSeleccionada === cita.id ? styles.resultRowActive : ""}`}
            >
              <div className={styles.avatarCircle} style={{ background: "#fef3c7" }}>
                <Calendar size={16} color="#d97706" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#121317" }}>
                  {cita.beneficiario}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#666e85" }}>
                  {cita.hora} · {cita.tipo} · {cita.medico}
                </p>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "3px 10px",
                borderRadius: 999, background: "#dbeafe", color: "#1e40af",
              }}>
                {cita.id}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}