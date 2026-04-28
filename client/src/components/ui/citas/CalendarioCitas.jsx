import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from '@fullcalendar/timegrid';

export default function CalendarioCitas({setTitulo}) {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin]}
      initialView="dayGridMonth"
      locale='es'
      headerToolbar={{
        left: "prev today next",
        center: "title",
        right: "dayGridMonth timeGridWeek timeGridDay",
      }}
      buttonText={{
        today: "Hoy",
        month: "Mes",
        week: "Semana",
        day: "Día",
      }}
      datesSet={(arg) =>{const fecha = arg.view.currentStart; //Inicio del mes
        const titulo = fecha.toLocaleDateString("es-MX", {
            month: "long",
            year: "numeric",
        });

        setTitulo(
            titulo.charAt(0).toUpperCase() + titulo.slice(1)
        );
      }
        
      }
    />
  );
}