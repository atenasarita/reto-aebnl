import PropTypes from 'prop-types';
import { FaCalendar } from 'react-icons/fa';

function StepMembresia({
  formData,
  fechaMembresiaRef,
  handleInputChange,
  calculateFechaVigencia
}) {
  
  return (
    <div className="section-block">
      <h2>Membresía</h2>

      <div className="row">
        <div className="field-group">
          <label htmlFor="meses-membresia">Meses de vigencia</label>
          <input
            id="meses-membresia"
            type="text"
            name="meses_membresia"
            value={12}
            readOnly
            disabled
          />
        </div>

        <div className="field-group">
          <label htmlFor="costo-total">Costo total</label>
          <input
            id="costo-total"
            type="text"
            value="$150.00"
            readOnly
            disabled
          />
        </div>
      </div>

      <div className="field-group">
        <label htmlFor="metodo-pago">Método de pago</label>
        <select
          id="metodo-pago"
          name="metodo_pago"
          value={formData.metodo_pago ?? 'efectivo'}
          onChange={handleInputChange}
        >
          <option value="efectivo">Efectivo</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="donacion">Donación</option>
        </select>
      </div>

      <div className="section-block">
        <h2>Vigencia</h2>

        <div className="row">
          <div className="field-group">
            <label htmlFor="fecha-inicio-membresia">Fecha de inicio de membresía</label>
            <div className="input-with-icon">
              <input
                id="fecha-inicio-membresia"
                ref={fechaMembresiaRef}
                type="date"
                name="fecha_inicio_membresia"
                value={formData.fecha_inicio_membresia}
                onChange={handleInputChange}
              />
              <FaCalendar
                className="icon"
                onClick={() => fechaMembresiaRef.current?.showPicker()}
              />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="fecha-vigencia">Fecha de vigencia</label>
            <input
              id="fecha-vigencia"
              type="date"
              value={calculateFechaVigencia()}
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
}

StepMembresia.propTypes = {
  formData: PropTypes.shape({
    metodo_pago: PropTypes.string,
    fecha_inicio_membresia: PropTypes.string,
  }).isRequired,
  fechaMembresiaRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  calculateFechaVigencia: PropTypes.func.isRequired,
};

export default StepMembresia;