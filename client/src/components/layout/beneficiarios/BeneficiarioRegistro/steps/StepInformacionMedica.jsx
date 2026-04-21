import { espinaBifidaOptions } from '../../../../../utils/espinaBifidaTypes';

function StepInformacionMedica({
  formData,
  fieldErrors,
  handleInputChange,
  handleBlur,
  handleTipoEspinasChange
}) {
  return (
    <div className="section-block">
      <h2>Información Médica</h2>

      <div className="row">
        <div className="field-group">
          <label>Nombre de Contacto de Emergencia</label>
          <input
            type="text"
            name="contacto_nombre"
            value={formData.contacto_nombre}
            onChange={handleInputChange}
          />
          {fieldErrors.contacto_nombre && (
            <small className="field-error">{fieldErrors.contacto_nombre}</small>
          )}
        </div>

        <div className="field-group">
          <label>Teléfono de Contacto de Emergencia</label>
          <input
            type="text"
            name="contacto_telefono"
            value={formData.contacto_telefono}
            onBlur={handleBlur}
            onChange={handleInputChange}
            maxLength={10}
          />
          {fieldErrors?.contacto_telefono && (
            <small className="field-error">{fieldErrors.contacto_telefono}</small>
          )}
        </div>
      </div>

      <div className="row">
        <div className="field-group">
          <label>Parentesco</label>
          <input
            type="text"
            name="contacto_parentesco"
            value={formData.contacto_parentesco}
            onChange={handleInputChange}
          />
        </div>

        <div className="field-group">
          <label>Tipo Sanguíneo</label>
          <select
            name="tipo_sanguineo"
            value={formData.tipo_sanguineo}
            onChange={handleInputChange}
          >
            <option value="">Seleccionar...</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
      </div>

      <div className="field-group full">
        <label>Tipo de Espina Bífida</label>
        <div className="checkbox-group">
          {espinaBifidaOptions.map(type => (
            <label
              key={type.value}
              className={`checkbox-card ${formData.tipo_espinas.includes(type.value) ? 'checked' : ''}`}
            >
              <input
                type="checkbox"
                value={type.value}
                checked={formData.tipo_espinas.includes(type.value)}
                onChange={handleTipoEspinasChange}
              />
              <div className="checkbox-card-mark"></div>
              <span>{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="row">
        <div className="field-group full">
          <label>Válvula</label>
          <select
            name="valvula"
            value={String(formData.valvula)}
            onChange={handleInputChange}
          >
            <option value="false">No</option>
            <option value="true">Sí</option>
          </select>
        </div>

        <div className="field-group full">
          <label>Hospital</label>
          <input
            type="text"
            name="hospital"
            value={formData.hospital}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="field-group full">
        <label>Alergias</label>
        <textarea
          name="alergias"
          value={formData.alergias}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
}

export default StepInformacionMedica;