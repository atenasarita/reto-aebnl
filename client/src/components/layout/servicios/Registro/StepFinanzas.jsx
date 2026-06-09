import PropTypes from 'prop-types';
import Dropdown from '../../../ui/Dropdown'
import SearchBar from '../../../ui/SearchBar'
import "./RegistroSteps.css";

const METODOS_PAGO = [
  { label: "Efectivo", value: "efectivo" },
  { label: "Transferencia", value: "transferencia" },
  { label: "Tarjeta (débito o crédito)", value: "tarjeta" },
  { label: "Cheque", value: "cheque" },
];

function StepFinanzas({
  total,
  totalConDescuento,
  saldo,
  saldoGlobal,
  donadores,
  fondoSeleccionado,
  setFondoSeleccionado,
  metodoPago,
  setMetodoPago,
  montoPagado,
  setMontoPagado,
  montoDonacion,
  setMontoDonacion,
  descuento,
  setDescuento,
  yaAporto,
  setYaAporto,
}){
  const subtotalNum = Number(total) || 0;
  const descuentoNum = Number(descuento) || 0;
  const pagadoNum = Number(montoPagado) || 0;
  const donacionNum = Number(montoDonacion) || 0;
  const saldoGlobalNum = Number(saldoGlobal) || 0;

  const saldoResumenClass = saldo > 0
    ? 'finanzasSaldoPendiente'
    : saldo < 0
    ? 'finanzasSaldoFavor'
    : 'finanzasSaldoCero';

  const saldoResumenLabel = saldo > 0
    ? 'Saldo pendiente'
    : saldo < 0
    ? 'Cambio'
    : 'Saldo';

  const fondoActivo = (donadores ?? []).find(
    (d) => String(d.id_fondo) === String(fondoSeleccionado)
  );
  const saldoFondoNum = fondoActivo ? Number(fondoActivo.saldo) : 0;
  const excedeFondo = donacionNum > 0 && donacionNum > saldoFondoNum + 0.001;
  const faltaFondo = donacionNum > 0 && !fondoSeleccionado;

  const metodoOptions = [
    { label: "Seleccionar...", value: "" },
    ...METODOS_PAGO.map((m) => ({ label: m.label, value: m.value })),
  ];

  const fondoOptions = [
    { label: "Seleccionar fondo de donación...", value: "" },
    ...(donadores ?? []).map((d) => {
      const tipo = d.tipo_origen === "marca" ? "Marca" : "Familia";
      return {
        label: `${d.nombre} (${tipo}) — $${Number(d.saldo).toFixed(2)}`,
        value: String(d.id_fondo),
      };
    }),
  ];

  return (
    <div className='panel'>

      <div className='field' style={{ marginBottom: 20, padding: '12px 16px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
        <p className='fieldLabel' style={{ marginBottom: 4 }}>Saldo total en fondos de donación</p>
        <span style={{ fontSize: 20, fontWeight: 700, color: '#166534' }}>
          ${saldoGlobalNum.toFixed(2)}
        </span>
      </div>

      <div className='field' style={{ marginBottom: 20 }}>

        <div className='field' style={{ maxWidth: 220, marginBottom: 20 }}>
          <label htmlFor="fin-descuento" className='fieldLabel'>Aporte de la Asociación</label>
          <SearchBar
            id="fin-descuento"
            placeholder="0.00"
            value={String(descuento ?? '')}
            onChange={(val) => setDescuento(val)}
            debounceMs={0}
            className="search-finanzas"
          />
        </div>

      <label htmlFor="fin-monto-pagado" className='fieldLabel'>Aportación de la familia</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <SearchBar
            id="fin-monto-pagado"
            placeholder="0.00"
            value={String(montoPagado ?? '')}
            onChange={(val) => setMontoPagado(val)}
            debounceMs={0}
            prefix="$"
            className="search-finanzas"
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14, color: yaAporto ? '#166534' : '#666e85', whiteSpace: 'nowrap' }}>
            <input
              type="checkbox"
              checked={yaAporto}
              onChange={(e) => setYaAporto(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: '#166534', cursor: 'pointer' }}
            />
            Ya Aportó
          </label>
        </div>
      </div>

      <div className='field' style={{ marginBottom: 20 }}>
        <label htmlFor="fin-fondo" className='fieldLabel'>Fondo de donación a utilizar</label>
        <Dropdown
          id="fin-fondo"
          options={fondoOptions}
          value={fondoSeleccionado}
          onChange={setFondoSeleccionado}
          className='dropdown-servicios'
        />
        {fondoActivo && (
          <p style={{ fontSize: 13, color: '#166534', marginTop: 6 }}>
            Saldo disponible en este fondo: ${saldoFondoNum.toFixed(2)}
          </p>
        )}
      </div>

      <div className='field' style={{ marginBottom: 20 }}>
        <label htmlFor="fin-monto-donacion" className='fieldLabel'>Monto cubierto con donación</label>
        <SearchBar
          id="fin-monto-donacion"
          placeholder="0.00"
          value={String(montoDonacion ?? '')}
          onChange={(val) => setMontoDonacion(val)}
          debounceMs={0}
          prefix="$"
          className="search-finanzas"
        />
        {faltaFondo && (
          <p style={{ color: '#dc2626', fontSize: 13, marginTop: 6 }}>
            Seleccione el fondo de donación a utilizar.
          </p>
        )}
        {excedeFondo && (
          <p style={{ color: '#dc2626', fontSize: 13, marginTop: 6 }}>
            El monto excede el saldo del fondo seleccionado (${saldoFondoNum.toFixed(2)}).
          </p>
        )}
      </div>

      <div className='field' style={{ maxWidth: 220, marginBottom: 20 }}>
        <label htmlFor="fin-metodo-pago" className='fieldLabel'>Método de pago (aportación familiar)</label>
        <Dropdown
          id="fin-metodo-pago"
          options={metodoOptions}
          value={metodoPago}
          onChange={setMetodoPago}
          className='dropdown-servicios'
        />
      </div>

        <div className='finanzasResumen'>

          <div className='finanzasResumenRow'>
            <span>Subtotal</span>
            <span>${subtotalNum.toFixed(2)}</span>
          </div>

          {descuentoNum > 0 && (
            <div className='finanzasResumenRow finanzasDescuento'>
              <span>Aporte de la Asociación</span>
              <span>- ${descuentoNum.toFixed(2)}</span>
            </div>
          )}

          <div className='finanzasResumenRow'>
            <span>Total a pagar</span>
            <span>${totalConDescuento.toFixed(2)}</span>
          </div>

          <div className='finanzasResumenRow'>
            <span>Aportación familia</span>
            <span>${pagadoNum.toFixed(2)}</span>
          </div>

          {donacionNum > 0 && (
            <div className='finanzasResumenRow'>
              <span>Donación{fondoActivo ? ` (${fondoActivo.nombre})` : ''}</span>
              <span>${donacionNum.toFixed(2)}</span>
            </div>
          )}

          <div className='finanzasResumenRow'>
            <span>Ya aportó</span>
            <span
              style={{
                color: yaAporto ? '#166534' : '#dc2626',
                fontWeight: 700,
              }}
            >
              {yaAporto ? 'Sí' : 'No'}
            </span>
          </div>

          <div className={`finanzasResumenRow ${saldoResumenClass}`}>
            <span>{saldoResumenLabel}</span>

            <span>${Math.abs(saldo).toFixed(2)}</span>
          </div>

        </div>

    </div>
  );
}

StepFinanzas.propTypes = {
  total: PropTypes.number.isRequired,
  totalConDescuento: PropTypes.number.isRequired,
  saldo: PropTypes.number.isRequired,
  saldoGlobal: PropTypes.number,
  donadores: PropTypes.arrayOf(PropTypes.shape({
    id_fondo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    nombre: PropTypes.string,
    saldo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    tipo_origen: PropTypes.string,
  })),
  fondoSeleccionado: PropTypes.string,
  setFondoSeleccionado: PropTypes.func.isRequired,
  metodoPago: PropTypes.string,
  setMetodoPago: PropTypes.func.isRequired,
  montoPagado: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setMontoPagado: PropTypes.func.isRequired,
  montoDonacion: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setMontoDonacion: PropTypes.func.isRequired,
  descuento: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setDescuento: PropTypes.func.isRequired,
  yaAporto: PropTypes.bool.isRequired,
  setYaAporto: PropTypes.func.isRequired,
};

export default StepFinanzas;
