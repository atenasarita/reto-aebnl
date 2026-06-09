import PropTypes from 'prop-types';
import "./detalleCita.css"
import { useState } from "react";
import CitasPop from "../../ui/CitasPop";

function DetalleCita({cita, onClose, onRefresh}){
    const [popupAbierto, setPopupAbierto] = useState(false);
    if (!cita) return null;

    return (
        <>
        <div className="detalle-cita-overlay">
            <div className="detalle-cita-modal">
                <button className="detalle-cita-close" onClick={onClose}>
                    x
                </button>
                <h2>Detalle de cita</h2>

                <div className="detalle-cita-grid">
                    <p><strong>Motivo:</strong>{cita.title}</p>
                    <p><strong>Fecha y Hora:</strong>{cita.start?.toLocaleString()}</p>

                    <p><strong>Beneficiario:</strong>{cita.extendedProps?.beneficiario}</p>
                    <p><strong>Especialista:</strong>{cita.extendedProps?.especialista}</p>

                    <p><strong>Servicio:</strong>{cita.extendedProps?.servicio}</p>
                    <p><strong>Estatus:</strong>{cita.extendedProps?.estatus}</p>
                    <p className="detalle-cita-notas">
                        <strong>Notas:</strong>{cita.extendedProps?.notas || "Sin notas"}
                    </p>
                </div>
                
                <button className="modificar-cita-btn"
                    onClick={() => {
                        setPopupAbierto(true);
                    }}
                >
                    Modificar cita
                </button>
            </div>
            </div>

            <CitasPop
                open={popupAbierto}
                modo="editar"
                cita={cita}
                onClose={() => setPopupAbierto(false)}
                onSuccess={() => {
                    setPopupAbierto(false);
                    onRefresh?.();
                    onClose?.();
                }}
            />
        </>
    );
}

DetalleCita.propTypes = {
  cita: PropTypes.shape({
    title: PropTypes.string,
    start: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
    extendedProps: PropTypes.shape({
      beneficiario: PropTypes.string,
      especialista: PropTypes.string,
      servicio: PropTypes.string,
      estatus: PropTypes.string,
      notas: PropTypes.string,
    }),
  }),
  onClose: PropTypes.func,
  onRefresh: PropTypes.func,
};

export default DetalleCita;