import PropTypes from 'prop-types';
import FotoPerfilInput from '../../beneficiarios/FotoPerfilInput';

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
          <label htmlFor="top-info-folio">FOLIO DE BENEFICIARIO</label>
          <input
            id="top-info-folio"
            type="text"
            value={folio}
            readOnly
            className="readonly-field"
          />
        </div>

        <div className="field-group">
          <label htmlFor="top-info-fecha">FECHA DE REGISTRO</label>
          <input
            id="top-info-fecha"
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

RegistroTopInfo.propTypes = {
  folio: PropTypes.string,
  fechaRegistro: PropTypes.string,
  fotografia: PropTypes.string,
  onFotoChange: PropTypes.func.isRequired,
  onFotoError: PropTypes.func.isRequired,
};

export default RegistroTopInfo;