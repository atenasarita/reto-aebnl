import { Calendar, User, Stethoscope } from "lucide-react";
import "../../../pages/styles/BusquedaBeneficiarioVista.css"
import { useEffect } from "react";

import Dropdown from '../../ui/Dropdown'

export default function StepDetalles({
  fecha,
  setFecha,
  tipoServicio,
  setTipoServicio,
  medico,
  setMedico,
  tiposOptions = [],
  loadingServicios,
  medicosOptions = [],
  loadingMedicos,
}) {

      useEffect(() => {
        if (tipoServicio) {
          setMedico('');
        }
      }, [tipoServicio]);

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
            options={[
              { label: loadingServicios ? "Cargando..." : "Seleccionar", value: "" },
              ...tiposOptions
            ]}
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
              options={[
                {
                  label: loadingMedicos
                    ? "Cargando médicos..."
                    : tipoServicio
                    ? "Seleccionar"
                    : "Selecciona un servicio",
                  value: "",
                },
                ...medicosOptions
              ]}
              value={medico}
              onChange={setMedico}
              disabled={!tipoServicio}
              className='dropdown-servicios'

            />
        </div>

      </div>
    </div>
  );
}