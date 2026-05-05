import "./detalleCita.css"
export default function DetalleCita({cita, onClose}){
    if (!cita) return null;

    return (
        <div className="detalle-cita-overlay">
            <div className="detalle-cita-modal">
                <button className="detalle-cita-close" onClick={onClose}>
                    x
                </button>
                <h2>Detalle de cita</h2>

                <p><strong>Motivo:</strong>{cita.title}</p>
                <p><strong>Fecha y Hora:</strong>{cita.start?.toLocaleString()}</p>
                <p><strong>Beneficiario:</strong>{cita.extendedProps?.idBeneficiario}</p>
                <p><strong>Especialista:</strong>{cita.extendedProps?.especialista}</p>
                <p><strong>Servicio:</strong>{cita.extendedProps?.idServicio}</p>
                <p><strong>Estatus:</strong>{cita.extendedProps?.estatus}</p>
                <p><strong>Notas:</strong>{cita.extendedProps?.notas || "Sin notas"}</p>

                <button className="modificar-cita-btn">
                    Modificar cita
                </button>
            </div>
        </div>
    );
}