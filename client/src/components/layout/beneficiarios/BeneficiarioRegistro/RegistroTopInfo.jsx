import FotoPerfilInput from '../../../components/layout/beneficiarios/FotoPerfilInput';

function RegistroTopInfo({ folio, fechaRegistro, fotografia, onFotoChange, onFotoError }) {
  return (
    <div className="top-info">
      <FotoPerfilInput
        value={fotografia}
        onChange={onFotoChange}
        onError={onFotoError}
      />

      <div className="meta-fields">
        <div className="field-group">
          <label>FOLIO DE BENEFICIARIO</label>
          <input
            type="text"
            value={folio}
            readOnly
            className="readonly-field"
          />
        </div>

        <div className="field-group">
          <label>FECHA DE REGISTRO</label>
          <input
            type="date"
            value={fechaRegistro}
            readOnly
            className="readonly-field"
          />
        </div>
      </div>
    </div>
  );
}

export default RegistroTopInfo;