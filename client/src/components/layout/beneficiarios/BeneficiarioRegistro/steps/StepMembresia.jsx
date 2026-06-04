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
          <label>Meses de vigencia</label>
          <input
            type="text"
            name="meses_membresia"
            value={12}
            readOnly
            disabled
          />
        </div>

        <div className="field-group">
          <label>Costo total</label>
          <input
            type="text"
            value="$150.00"
            readOnly
            disabled
          />
        </div>
      </div>

      <div className="field-group">
        <label>Método de pago</label>
        <select
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
            <label>Fecha de inicio de membresía</label>
            <div className="input-with-icon">
              <input
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
            <label>Fecha de vigencia</label>
            <input
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

export default StepMembresia;