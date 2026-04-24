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

      <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#1a3b5c', borderBottom: '1px solid #e0e0e0', paddingBottom: '0.5rem' }}>
          Datos de Diagnóstico
        </h3>
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

      <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#1a3b5c', borderBottom: '1px solid #e0e0e0', paddingBottom: '0.5rem' }}>
          Información de los Padres (Opcional)
        </h3>
      </div>
      
      {/* Datos del Padre */}
      <h4 style={{ fontSize: '1rem', color: '#666', marginBottom: '0.5rem' }}>Datos del Padre</h4>
      <div className="row">
        <div className="field-group">
          <label>Nombre del Padre</label>
          <input
            type="text"
            name="padre_nombre"
            value={formData.padre_nombre}
            onChange={handleInputChange}
          />
        </div>
        <div className="field-group">
          <label>Fecha de Nacimiento</label>
          <input
            type="date"
            name="padre_fecha_nacimiento"
            value={formData.padre_fecha_nacimiento}
            onChange={handleInputChange}
          />
        </div>
      </div>
      <div className="row">
        <div className="field-group">
          <label>Email</label>
          <input
            type="email"
            name="padre_email"
            value={formData.padre_email}
            onChange={handleInputChange}
          />
        </div>
        <div className="field-group">
          <label>Teléfono (Móvil)</label>
          <input
            type="text"
            name="padre_telefono"
            maxLength={10}
            value={formData.padre_telefono}
            onChange={handleInputChange}
          />
        </div>
      </div>
      <div className="row">
        <div className="field-group">
          <label>Teléfono (Casa)</label>
          <input
            type="text"
            name="padre_telefono_casa"
            maxLength={10}
            value={formData.padre_telefono_casa}
            onChange={handleInputChange}
          />
        </div>
        <div className="field-group">
          <label>Teléfono (Trabajo)</label>
          <input
            type="text"
            name="padre_telefono_trabajo"
            maxLength={10}
            value={formData.padre_telefono_trabajo}
            onChange={handleInputChange}
          />
        </div>
      </div>

      {/* Datos de la Madre */}
      <h4 style={{ fontSize: '1rem', color: '#666', marginBottom: '0.5rem', marginTop: '1.5rem' }}>Datos de la Madre</h4>
      <div className="row">
        <div className="field-group">
          <label>Nombre de la Madre</label>
          <input
            type="text"
            name="madre_nombre"
            value={formData.madre_nombre}
            onChange={handleInputChange}
          />
        </div>
        <div className="field-group">
          <label>Fecha de Nacimiento</label>
          <input
            type="date"
            name="madre_fecha_nacimiento"
            value={formData.madre_fecha_nacimiento}
            onChange={handleInputChange}
          />
        </div>
      </div>
      <div className="row">
        <div className="field-group">
          <label>Email</label>
          <input
            type="email"
            name="madre_email"
            value={formData.madre_email}
            onChange={handleInputChange}
          />
        </div>
        <div className="field-group">
          <label>Teléfono (Móvil)</label>
          <input
            type="text"
            name="madre_telefono"
            maxLength={10}
            value={formData.madre_telefono}
            onChange={handleInputChange}
          />
        </div>
      </div>
      <div className="row">
        <div className="field-group">
          <label>Teléfono (Casa)</label>
          <input
            type="text"
            name="madre_telefono_casa"
            maxLength={10}
            value={formData.madre_telefono_casa}
            onChange={handleInputChange}
          />
        </div>
        <div className="field-group">
          <label>Teléfono (Trabajo)</label>
          <input
            type="text"
            name="madre_telefono_trabajo"
            maxLength={10}
            value={formData.madre_telefono_trabajo}
            onChange={handleInputChange}
          />
        </div>
      </div>
      
    </div>
  );
}

export default StepInformacionMedica;