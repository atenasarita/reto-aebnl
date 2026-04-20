import { FaCalendar } from 'react-icons/fa';
import { estadosMexico } from '../../../../utils/beneficiarioConstants';

function StepDatosPersonales({
  formData,
  fieldErrors,
  fechaNacimiento,
  fechaNacimientoRef,
  setFechaNacimiento,
  handleInputChange
}) {
  return (
    <>
      <div className="section-block">
        <h2>Identidad</h2>

        <div className="row">
          <div className="field-group full">
            <label>Correo Electronico</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            {fieldErrors.email && <small className="field-error">{fieldErrors.email}</small>}
          </div>

          <div className="field-group full">
            <label>Nombres</label>
            <input
              type="text"
              name="nombres"
              value={formData.nombres}
              onChange={handleInputChange}
            />
            {fieldErrors.nombres && <small className="field-error">{fieldErrors.nombres}</small>}
          </div>
        </div>

        <div className="row">
          <div className="field-group">
            <label>Apellido Paterno</label>
            <input
              type="text"
              name="apellido_paterno"
              value={formData.apellido_paterno}
              onChange={handleInputChange}
            />
            {fieldErrors.apellido_paterno && (
              <small className="field-error">{fieldErrors.apellido_paterno}</small>
            )}
          </div>

          <div className="field-group">
            <label>Apellido Materno</label>
            <input
              type="text"
              name="apellido_materno"
              value={formData.apellido_materno}
              onChange={handleInputChange}
            />
            {fieldErrors.apellido_materno && (
              <small className="field-error">{fieldErrors.apellido_materno}</small>
            )}
          </div>
        </div>
      </div>

      <div className="section-block">
        <h2>Datos Demográficos</h2>

        <div className="row">
          <div className="field-group">
            <label>Fecha de Nacimiento</label>
            <div className="input-with-icon">
              <input
                ref={fechaNacimientoRef}
                type="date"
                name="fecha_nacimiento"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
              />
              <FaCalendar
                className="icon"
                onClick={() => fechaNacimientoRef.current?.showPicker()}
              />
            </div>
          </div>

          <div className="field-group">
            <label>CURP</label>
            <input
              type="text"
              name="CURP"
              value={formData.CURP}
              maxLength={18}
              onChange={handleInputChange}
              placeholder="XXXX000000XXXXXX00"
            />
            {fieldErrors.CURP && <small className="field-error">{fieldErrors.CURP}</small>}
          </div>
        </div>

        <div className="row">
          <div className="field-group">
            <label>Género</label>
            <select name="genero" value={formData.genero} onChange={handleInputChange}>
              <option value="">Seleccionar género...</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div className="field-group">
            <label>Lugar de Nacimiento</label>
            <select
              name="estado_nacimiento"
              value={formData.estado_nacimiento}
              onChange={handleInputChange}
            >
              <option value="">Seleccionar estado...</option>
              {estadosMexico.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </>
  );
}

export default StepDatosPersonales;