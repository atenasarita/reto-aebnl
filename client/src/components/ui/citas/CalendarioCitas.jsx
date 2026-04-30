import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from '@fullcalendar/timegrid';
import { useEffect, useState } from "react";

export default function CalendarioCitas() {
  const [eventos, setEventos] = useState([]);

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin]}
      initialView="dayGridMonth"
      locale='es'
      height= "100%"
      expandRows={true}

      customButtons={{
        nuevaCita: {
          text: "+ Nueva Cita",
          click: () => {
            console.log("Abrir nueva cita");
          },
        },
      }}
      headerToolbar={{
        left: "title",
        center: "dayGridMonth timeGridWeek timeGridDay",
        right: "prev today next nuevaCita",
      }
    }
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
      } 
      }
    />
  );
}