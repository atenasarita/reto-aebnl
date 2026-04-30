import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import CalendarioCitas from '../../components/ui/citas/CalendarioCitas';
import "../styles/agendaCitas.css";

export default function AgendaCalendar() {
    return (
    <main className='agenda-page'>
        <CalendarioCitas />
    </main>
  );
}
 