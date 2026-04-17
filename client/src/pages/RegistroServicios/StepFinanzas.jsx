import styles from "../styles/BusquedaBeneficiarioVista.module.css";

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
  const totalConDescuento = totalNum - descuentoNum;
  const saldo = totalConDescuento - pagadoNum;

  return (
    <div className={styles.panel}>
      {/* Fila principal: Total · Pagado · Método */}
      <div className={styles.finanzasRow}>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Total</label>
          <input
            type="text"
            className={styles.input}
            readOnly
            value={totalConDescuento.toFixed(2)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Pagado</label>
          <input
            type="number"
            className={styles.input}
            min={0}
            step={0.01}
            placeholder="0.00"
            value={montoPagado}
            onChange={(e) => setMontoPagado(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Método</label>
          <select
            className={styles.select}
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
          >
            <option value="">Seleccionar...</option>
            {METODOS_PAGO.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Descuento */}
      <div className={styles.field} style={{ maxWidth: 220 }}>
        <label className={styles.fieldLabel}>Descuento ($)</label>
        <input
          type="number"
          className={styles.input}
          min={0}
          step={0.01}
          placeholder="0.00"
          value={descuento}
          onChange={(e) => setDescuento(e.target.value)}
        />
      </div>

      {/* Resumen */}
      <div className={styles.finanzasResumen}>
        <div className={styles.finanzasResumenRow}>
          <span>Subtotal</span>
          <span>${totalNum.toFixed(2)}</span>
        </div>
        {descuentoNum > 0 && (
          <div className={`${styles.finanzasResumenRow} ${styles.finanzasDescuento}`}>
            <span>Descuento</span>
            <span>- ${descuentoNum.toFixed(2)}</span>
          </div>
        )}
        <div className={styles.finanzasResumenRow}>
          <span>Total a pagar</span>
          <span>${totalConDescuento.toFixed(2)}</span>
        </div>
        <div className={styles.finanzasResumenRow}>
          <span>Pagado</span>
          <span>${pagadoNum.toFixed(2)}</span>
        </div>
        <div
          className={`${styles.finanzasResumenRow} ${styles.finanzasSaldo} ${
            saldo > 0
              ? styles.finanzasSaldoPendiente
              : saldo < 0
              ? styles.finanzasSaldoFavor
              : styles.finanzasSaldoCero
          }`}
        >
          <span>{saldo > 0 ? "Saldo pendiente" : saldo < 0 ? "Cambio" : "Saldado"}</span>
          <span>${Math.abs(saldo).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}