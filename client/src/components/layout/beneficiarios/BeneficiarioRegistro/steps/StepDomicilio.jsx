import { estadosMexico } from '../../../../../utils/beneficiarioConstants';

function StepDomicilio({ formData, fieldErrors, handleInputChange, handleBlur }) {
  return (
    <div className="section-block">
      <h2>Domicilio</h2>

      <div className="field-group full">
        <label>Calle</label>
        <input
          type="text"
          name="domicilio_calle"
          value={formData.domicilio_calle}
          onChange={handleInputChange}
        />
      </div>

      <div className="row">
        <div className="field-group">
          <label>Estado</label>
          <select
            name="domicilio_estado"
            value={formData.domicilio_estado}
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

        <div className="field-group">
          <label>Ciudad</label>
          <input
            type="text"
            name="domicilio_ciudad"
            value={formData.domicilio_ciudad}
            onChange={handleInputChange}
          />
        </div>

        <div className="field-group">
          <label>Código Postal</label>
          <input
            type="text"
            name="domicilio_cp"
            value={formData.domicilio_cp}
            maxLength={5}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />
          {fieldErrors.domicilio_cp && (
            <small className="field-error">{fieldErrors.domicilio_cp}</small>
          )}
        </div>
      </div>
    </div>
  );
}

export default StepDomicilio;