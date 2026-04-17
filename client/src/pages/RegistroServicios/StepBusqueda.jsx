import { useState } from "react";
import { Search, User, Calendar } from "lucide-react";
import "../styles/BusquedaBeneficiarioVista.css";
import SearchBar from '../../components/ui/SearchBar'
import { FiUserPlus, FiSearch } from 'react-icons/fi'




import Button from "../../components/ui/Button"

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
    <div className='panel'>
      <p className='hint'>
        Selecciona por beneficiario activo o toma una cita programada para hoy.
      </p>

      <div className='segmented'>
        <Button
          className={`segBtn2 ${busquedaTab === "beneficiario" ? "segBtnActive2" : ""}`}
          onClick={() => { setBusquedaTab("beneficiario"); setCitaSeleccionada(null); }}
        >
          Por beneficiario
        </Button>
        <button
          className={`segBtn2 ${busquedaTab === "citas" ? "segBtnActive2" : ""}`}
          onClick={() => { setBusquedaTab("citas"); setBeneficiarioSeleccionado(null); setQuery(""); }}
        >
          Citas del día
        </button>
      </div>

      {busquedaTab === "beneficiario" && (
        <>
            <span className='fieldLabel'>Buscar beneficiario</span>
              <SearchBar
                icon={<FiSearch />}
                placeholder="Nombre, folio o CURP..."
                className='search-beneficiario-servicio'    
                onSearch={setQuery}
              />

          <div className='resultList'>
            {resultados.length === 0 ? (
              <p className='empty'>Sin resultados</p>
            ) : (
              resultados.map((b) => {
                const activo = beneficiarioSeleccionado === b.folio;
                return (
                  <div
                    key={b.folio}
                    className={`resultRow ${activo ? "resultRowActive" : ""}`}
                    onClick={() => { setBeneficiarioSeleccionado(b.folio); setCitaSeleccionada(null); }}
                  >
                    <div className='avatarCircle'>
                      <User size={16} color="#1e3b8a" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: 16, color: "#121317" }}>{b.nombre}</strong>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#666e85" }}>
                        {b.folio} · {b.curp}
                      </p>
                    </div>
                    <span style={{
                      fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
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
        <div className='resultList'>

          {CITAS_HOY.map((cita) => (
            <div
              key={cita.id}
              onClick={() => setCitaSeleccionada(cita.id)}
              className={`resultRow ${citaSeleccionada === cita.id ? "resultRowActive" : ""}`}
            >
              <div className='avatarCircle' style={{ background: "#fef3c7" }}>
                <Calendar size={16} color="#d97706" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: "#121317" }}>
                  {cita.beneficiario}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#666e85" }}>
                  {cita.hora} · {cita.tipo} · {cita.medico}
                </p>
              </div>
              <span style={{
                fontSize: 12, fontWeight: 700, padding: "3px 10px",
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