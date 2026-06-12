import PropTypes from 'prop-types';
import { estadosMexico } from '../../../../../utils/beneficiarioConstants';

function StepDomicilio({ formData, fieldErrors, handleInputChange, handleBlur }) {
  return (
    <div className="section-block">
      <h2>Domicilio</h2>

      <div className="field-group full">
        <label htmlFor="dom-calle">Calle</label>
        <input
          id="dom-calle"
          type="text"
          name="domicilio_calle"
          value={formData.domicilio_calle}
          onChange={handleInputChange}
        />
        {fieldErrors.domicilio_calle && (
              <small className="field-error">{fieldErrors.domicilio_calle}</small>
            )}
      </div>

      <div className="row">
        <div className="field-group">
          <label htmlFor="dom-estado">Estado</label>
          <select
            id="dom-estado"
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
          {fieldErrors.domicilio_estado && (
              <small className="field-error">{fieldErrors.domicilio_estado}</small>
            )}
        </div>

        <div className="field-group">
          <label htmlFor="dom-ciudad">Ciudad</label>
          <input
            id="dom-ciudad"
            type="text"
            name="domicilio_ciudad"
            value={formData.domicilio_ciudad}
            onChange={handleInputChange}
          />
          {fieldErrors.domicilio_ciudad && (
              <small className="field-error">{fieldErrors.domicilio_ciudad}</small>
            )}
        </div>

        <div className="field-group">
          <label htmlFor="dom-cp">Código Postal</label>
          <input
            id="dom-cp"
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

StepDomicilio.propTypes = {
  formData: PropTypes.shape({
    domicilio_calle: PropTypes.string,
    domicilio_estado: PropTypes.string,
    domicilio_ciudad: PropTypes.string,
    domicilio_cp: PropTypes.string,
  }).isRequired,
  fieldErrors: PropTypes.shape({
    domicilio_calle: PropTypes.string,
    domicilio_estado: PropTypes.string,
    domicilio_ciudad: PropTypes.string,
    domicilio_cp: PropTypes.string,
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleBlur: PropTypes.func.isRequired,
};

export default StepDomicilio;