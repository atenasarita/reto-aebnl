import { Calendar, Clock, Stethoscope, FileText, Hash, Tag } from "lucide-react";
import "../../../pages/styles/BusquedaBeneficiarioVista.css"
import Dropdown from '../../ui/Dropdown'

export default function StepDetalles({
  fecha,
  setFecha,
  hora,
  setHora,
  categoriaServicio,
  setCategoriaServicio,
  tipoServicio,
  setTipoServicio,
  categoriasOptions = [],
  tiposOptions = [],
  loadingServicios,
}) {

  return (
    <div className='panel'>
      <div className='formGrid2'>

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
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>

        {/* Hora */}
        <div className='field'>
          <label htmlFor="hora" className='fieldLabel'>
            <Clock size={14} style={{ marginRight: 6 }} />
            Hora de cita
          </label>
          <input
            id="hora"
            type="time"
            className='input'
            value={hora}
            onChange={(e) => setHora(e.target.value)}
          />
        </div>

        {/* Categoría */}
        <div className='field'>
          <label className='fieldLabel'>
            <Tag size={14} style={{ marginRight: 6 }} />
            Categoría
          </label>
          <Dropdown
            options={loadingServicios
              ? [{ label: "Cargando...", value: "" }]
              : categoriasOptions
            }
            value={categoriaServicio}
            onChange={setCategoriaServicio}
            className='dropdown-servicios'
          />
        </div>

        {/* Servicio */}
        <div className='field'>
          <label className='fieldLabel'>
            <Stethoscope size={14} style={{ marginRight: 6 }} />
            Servicio
          </label>
          <Dropdown
            options={[
              {
                label: categoriaServicio
                  ? "Seleccionar servicio"
                  : "Selecciona una categoría",
                value: ""
              },
              ...tiposOptions
            ]}
            value={tipoServicio}
            onChange={setTipoServicio}
            disabled={!categoriaServicio}
            className='dropdown-servicios'
          />
        </div>

      </div>

    </div>
  );
}