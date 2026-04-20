import { Calendar, User, Stethoscope } from "lucide-react";
import "../../../pages/styles/BusquedaBeneficiarioVista.css"

import Dropdown from '../../ui/Dropdown'



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

  const tiposOptions = TIPOS_SERVICIO.map(t => ({ label: t, value: t }))
  const medicosOptions = MEDICOS.map(m => ({ label: m, value: m }))

  return (
    <div className='panel'>
      <div className='formGrid3'>
        
        {/* Fecha */}
        <div className='field'>
          <label htmlFor="fecha" className='fieldLabel'>
            <Calendar size={14} style={{ marginRight: 6 }} />
            Fecha
          </label>
          <input
            id="fecha"
            type="date"
            className='input'
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
        <div className='field'>
          <label className='fieldLabel'>
            <Stethoscope size={14} style={{ marginRight: 6 }} />
            Servicio
          </label>
          <Dropdown
            options={[{ label: 'Seleccionar', value: '' }, ...tiposOptions]}
            value={tipoServicio}
            onChange={setTipoServicio}
            className='dropdown-servicios'
          />
        </div>

        {/* Médico */}
        <div className='field'>
          <label className='fieldLabel'>
            <User size={14} style={{ marginRight: 6 }} />
            Médico
          </label>
          <Dropdown
            options={[{ label: 'Seleccionar', value: '' }, ...medicosOptions]}
            value={medico}
            onChange={setMedico}
            className='dropdown-servicios'
          />
        </div>

      </div>
    </div>
  );
}