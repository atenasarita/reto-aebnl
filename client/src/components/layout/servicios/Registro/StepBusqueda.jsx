import PropTypes from 'prop-types';
import { useState } from "react";

import { User, Calendar } from "lucide-react";
import { FiSearch } from 'react-icons/fi'

import "./RegistroSteps.css";

import Button from "../../../ui/Button"
import SearchBar from '../../../ui/SearchBar'


function StepBusqueda({
  setQuery,
  query,
  resultados = [],
  loading,
  loadingCitas,
  beneficiarioSeleccionado,
  setBeneficiarioSeleccionado,
  citaSeleccionada,
  setCitaSeleccionada,
  CITAS_HOY = [],
}) {
  const [busquedaTab, setBusquedaTab] = useState("beneficiario");

  const renderResultados = () => {
    if (loading) return <p className='empty'>Buscando...</p>;
    if (resultados.length === 0 && query?.length >= 2) return <p className='empty'>Sin resultados</p>;
    if (resultados.length === 0) return <p className='empty'>Escribe al menos 2 caracteres para buscar</p>;
    return resultados.map((b) => {
      const activo = beneficiarioSeleccionado === b.folio;
      return (
        <button
          key={b.folio}
          type="button"
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
        </button>
      );
    });
  };

  const renderCitas = () => {
    if (loadingCitas) return <p className='empty'>Cargando citas...</p>;
    if (CITAS_HOY.length === 0) return <p className='empty'>No hay citas programadas para hoy.</p>;
    return CITAS_HOY.map((cita) => (
      <button
        key={cita.id}
        type="button"
        className={`resultRow ${citaSeleccionada === cita.id ? "resultRowActive" : ""}`}
        onClick={() => setCitaSeleccionada(cita.id)}
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
      </button>
    ));
  };

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
            onChange={(value) => setQuery(value)}
          />
          <div className='resultList'>
            {renderResultados()}
          </div>
        </>
      )}

      {busquedaTab === "citas" && (
        <div className='resultList'>
          {renderCitas()}
        </div>
      )}
    </div>
  );
}

StepBusqueda.propTypes = {
  setQuery: PropTypes.func.isRequired,
  query: PropTypes.string,
  resultados: PropTypes.arrayOf(PropTypes.shape({
    folio: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    nombre: PropTypes.string,
    curp: PropTypes.string,
  })),
  loading: PropTypes.bool,
  loadingCitas: PropTypes.bool,
  beneficiarioSeleccionado: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setBeneficiarioSeleccionado: PropTypes.func.isRequired,
  citaSeleccionada: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setCitaSeleccionada: PropTypes.func.isRequired,
  CITAS_HOY: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    beneficiario: PropTypes.string,
    hora: PropTypes.string,
    tipo: PropTypes.string,
    medico: PropTypes.string,
  })),
};

export default StepBusqueda;
