import PropTypes from 'prop-types';

export const fmtMontoFondo = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n ?? 0);

export function MontoCell({ tipo, monto }) {
  const egreso = tipo === "egreso";
  return (
    <td className="donaciones-col-numeric">
      <span className={`donaciones-money donaciones-money--${tipo}`}>
        <span className="donaciones-money__sign" aria-hidden="true">
          {egreso ? "−" : "+"}
        </span>
        <span className="donaciones-money__value">{fmtMontoFondo(monto)}</span>
      </span>
    </td>
  );
}

MontoCell.propTypes = {
  tipo: PropTypes.string.isRequired,
  monto: PropTypes.number,
};

export function SaldoCell({ value, variant = "balance" }) {
  return (
    <td className={`donaciones-col-numeric donaciones-balance donaciones-balance--${variant}`}>
      <span className="donaciones-money__value">{fmtMontoFondo(value)}</span>
    </td>
  );
}

SaldoCell.propTypes = {
  value: PropTypes.number,
  variant: PropTypes.string,
};

export function formatOrigenMovimiento(m) {
  if (m.tipo_movimiento?.toLowerCase() === "egreso") {
    if (m.donador_nombre) return `Fondo: ${m.donador_nombre}`;
    const folio = m.folio_servicio ?? m.id_servicio_otorgado;
    return folio ? `Servicio #${folio}` : "Servicio";
  }
  if (m.origen_tipo) {
    const label = m.origen_tipo === "marca" ? "Marca" : "Familia";
    return `${label}: ${m.origen_nombre ?? m.donador_nombre ?? "—"}`;
  }
  if (m.donador_nombre) return m.donador_nombre;
  return "—";
}

export function formatConceptoMovimiento(m) {
  if (m.tipo_movimiento?.toLowerCase() === "egreso") {
    const folio = m.folio_servicio ?? m.id_servicio_otorgado;
    const nombre = m.servicio_nombre?.trim();
    if (folio && nombre) return `Folio #${folio} · ${nombre}`;
    if (folio) return `Folio #${folio}`;
  }
  return m.concepto || m.motivo || "—";
}
