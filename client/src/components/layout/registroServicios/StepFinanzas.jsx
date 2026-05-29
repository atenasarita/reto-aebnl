import Dropdown from '../../ui/Dropdown'
import SearchBar from '../../ui/SearchBar' 
import "../../../pages/styles/BusquedaBeneficiarioVista.css"

/** Valores internos; el servidor los traduce a efectivo|tarjeta|donacion para Oracle. */
const METODOS_PAGO = [
  { label: "Efectivo", value: "efectivo" },
  { label: "Transferencia", value: "transferencia" },
  { label: "Tarjeta (débito o crédito)", value: "tarjeta" },
  { label: "Cheque", value: "cheque" },
];

export default function StepFinanzas({
  total,
  saldoFondo = 0,
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
}) {
  const totalNum = parseFloat(total) || 0;
  const pagadoNum = parseFloat(montoPagado) || 0;
  const donacionNum = parseFloat(montoDonacion) || 0;
  const descuentoNum = parseFloat(descuento) || 0;
  const totalConDescuento = Math.max(0, totalNum - descuentoNum);
  const totalCubierto = pagadoNum + donacionNum;
  const saldo = totalConDescuento - totalCubierto;
  const saldoFondoNum = parseFloat(saldoFondo) || 0;
  const excedeFondo = donacionNum > saldoFondoNum;

  const metodoOptions = [
    { label: "Seleccionar...", value: "" },
    ...METODOS_PAGO.map((m) => ({ label: m.label, value: m.value })),
  ];

  return (
    <div className='panel'>

      {/* Saldo del fondo */}
      <div className='field' style={{ marginBottom: 20, padding: '12px 16px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
        <label className='fieldLabel' style={{ marginBottom: 4 }}>Saldo disponible en fondo de donaciones</label>
        <span style={{ fontSize: 20, fontWeight: 700, color: '#166534' }}>
          ${saldoFondoNum.toFixed(2)}
        </span>
      </div>

      {/* Aportación familiar */}
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

      {/* Monto con fondo de donaciones */}
      <div className='field' style={{ marginBottom: 20 }}>
        <label className='fieldLabel'>Cubierto con fondo de donaciones</label>
        <SearchBar
          placeholder="0.00"
          value={String(montoDonacion ?? '')}
          onChange={(val) => setMontoDonacion(val)}
          debounceMs={0}
          prefix="$"
          className="search-finanzas"
        />
        {excedeFondo && (
          <p style={{ color: '#dc2626', fontSize: 13, marginTop: 6 }}>
            El monto excede el saldo disponible del fondo (${saldoFondoNum.toFixed(2)}).
          </p>
        )}
      </div>

      {/* Método de pago */}
      <div className='field' style={{ maxWidth: 220, marginBottom: 20 }}>
        <label className='fieldLabel'>Método de pago (aportación familiar)</label>
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
          <span>Fondo donaciones</span>
          <span style={{ color: '#166534' }}>${donacionNum.toFixed(2)}</span>
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
