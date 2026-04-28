import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import CalendarioCitas from '../../components/ui/citas/CalendarioCitas';
import "../styles/agendaCitas.css";

export default function AgendaCalendar() {
    const [titulo, setTitulo] = useState("");
    return (
        <main className='agenda-page'>
            <section className='agenda-header'>

                <button className='new-appointment-btn'>
                    + Nueva Cita
                </button>
            </section>
        

        <CalendarioCitas setTitulo={setTitulo} />
    </main>
  );
}
 