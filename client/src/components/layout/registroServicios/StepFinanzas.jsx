import Dropdown from '../../ui/Dropdown'
import SearchBar from '../../ui/SearchBar' 
import "../../../pages/styles/BusquedaBeneficiarioVista.css"

const METODOS_PAGO = [
  "Efectivo",
  "Transferencia",
  "Tarjeta débito",
  "Tarjeta crédito",
  "Cheque",
];

export default function StepFinanzas({
  total,
  metodoPago,
  setMetodoPago,
  montoPagado,
  setMontoPagado,
  descuento,
  setDescuento,
  yaAporto,
  setYaAporto,
}) {
  const totalNum = parseFloat(total) || 0;
  const pagadoNum = parseFloat(montoPagado) || 0;
  const descuentoNum = parseFloat(descuento) || 0;
  const totalConDescuento = Math.max(0, totalNum - descuentoNum);
  const saldo = totalConDescuento - pagadoNum;

  const metodoOptions = [
    { label: "Seleccionar...", value: "" },
    ...METODOS_PAGO.map(m => ({ label: m, value: m }))
  ];

  return (
    <div className='panel'>

      {/* Aportación */}
      <div className='field' style={{ marginBottom: 20 }}>
        <label className='fieldLabel'>Aportación de la familia</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <SearchBar
            placeholder="0.00"
            value={String(montoPagado ?? '')}
            onChange={(val) => setMontoPagado(val)}
            debounceMs={0}
            prefix="$"
            className="search-finanzas"
          />
          {/* Ya Aportó */}
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

      {/* Método de pago */}
      <div className='field' style={{ maxWidth: 220, marginBottom: 20 }}>
        <label className='fieldLabel'>Método de pago</label>
        <Dropdown
          options={metodoOptions}
          value={metodoPago}
          onChange={setMetodoPago}
          className='dropdown-servicios'
        />
      </div>

      {/* Descuento */}
      <div className='field' style={{ maxWidth: 220, marginBottom: 20 }}>
        <label className='fieldLabel'>Descuento ($)</label>
        <SearchBar
          placeholder="0.00"
          value={String(descuento ?? '')}
          onChange={(val) => setDescuento(val)}
          debounceMs={0}
          className="search-finanzas"
        />
      </div>

      {/* Resumen */}
      <div className='finanzasResumen'>
        <div className='finanzasResumenRow'>
          <span>Subtotal</span>
          <span>${totalNum.toFixed(2)}</span>
        </div>
        {descuentoNum > 0 && (
          <div className='finanzasResumenRow finanzasDescuento'>
            <span>Descuento</span>
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
        <div className='finanzasResumenRow'>
          <span>Ya aportó</span>
          <span style={{ color: yaAporto ? '#166534' : '#dc2626', fontWeight: 700 }}>
            {yaAporto ? 'Sí' : 'No'}
          </span>
        </div>
        <div
          className={`finanzasResumenRow ${
            saldo > 0
              ? 'finanzasSaldoPendiente'
              : saldo < 0
              ? 'finanzasSaldoFavor'
              : 'finanzasSaldoCero'
          }`}
        >
          <span>{saldo > 0 ? "Saldo pendiente" : saldo < 0 ? "Cambio" : "Saldo"}</span>
          <span>${Math.abs(saldo).toFixed(2)}</span>
        </div>
      </div>

    </div>
  );
}