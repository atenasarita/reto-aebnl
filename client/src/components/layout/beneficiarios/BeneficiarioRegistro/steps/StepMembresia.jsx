import { FaCalendar } from 'react-icons/fa';

function StepMembresia({
  formData,
  fechaMembresiaRef,
  handleInputChange,
  calculateFechaVigencia
}) {
  console.log('fecha_inicio_membresia enviada:', formData.fecha_inicio_membresia);
  console.log('fecha vigencia calculada:', calculateFechaVigencia());
  return (
    <div className="section-block">
      <h2>Membresía</h2>

      <div className="field-group">
        <label>Meses de vigencia</label>
        <input
          type="number"
          name="meses_membresia"
          value={formData.meses_membresia}
          min={1}
          max={36}
          onChange={handleInputChange}
        />
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