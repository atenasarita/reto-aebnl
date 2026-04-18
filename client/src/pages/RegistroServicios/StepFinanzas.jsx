import Dropdown from '../../components/ui/Dropdown'
import SearchBar from '../../components/ui/SearchBar' 


import "../styles/BusquedaBeneficiarioVista.css";

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
}) {
  const totalNum = parseFloat(total) || 0;
  const pagadoNum = parseFloat(montoPagado) || 0;
  const descuentoNum = parseFloat(descuento) || 0;
  const totalConDescuento = Math.max(0, totalNum - descuentoNum);
  const saldo = totalConDescuento - pagadoNum;

  const metodoOptions = [{ label: "Seleccionar...", value: "" }, ...METODOS_PAGO.map(m => ({ label: m, value: m }))];

  return (
    <div className='panel'>

      {/* Fila principal: Total · Pagado · Método */}
      <div className='finanzasRow'>
        <div className='field'>
          <label className='fieldLabel'>Total</label>
          <SearchBar
            type="text"
            value={totalConDescuento.toFixed(2)}
            readOnly
            prefix="$"
            className="search-finanzas"
          />
        </div>

        <div className='field'>
          <label className='fieldLabel'>Pagado</label>
          <SearchBar
            placeholder="0.00"
            value={String(montoPagado ?? '')}
            onChange={(val) => setMontoPagado(val)}
            debounceMs={0} // actualizar inmediatamente
            className="search-finanzas"
          />
        </div>

        <div className='field'>
          <label className='fieldLabel'>Método</label>
          <Dropdown
            options={metodoOptions}
            value={metodoPago}
            onChange={setMetodoPago}
            className='dropdown-servicios'
          />
        </div>
      </div>

      {/* Descuento */}
      <div className='field' style={{ maxWidth: 220 }}>
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
          <div className={`finanzasResumenRow finanzasDescuento`}>
            <span>Descuento</span>
            <span>- ${descuentoNum.toFixed(2)}</span>
          </div>
        )}
        <div className='finanzasResumenRow'>
          <span>Total a pagar</span>
          <span>${totalConDescuento.toFixed(2)}</span>
        </div>
        <div className='finanzasResumenRow'>
          <span>Pagado</span>
          <span>${pagadoNum.toFixed(2)}</span>
        </div>
        <div
          className={`finanzasResumenRow finanzasSaldo {
            saldo > 0
              ? finanzasSaldoPendiente
              : saldo < 0
              ? finanzasSaldoFavor
              : finanzasSaldoCero
          }`}
        >
          <span>{saldo > 0 ? "Saldo pendiente" : saldo < 0 ? "Cambio" : "Saldo"}</span>
          <span>${Math.abs(saldo).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}