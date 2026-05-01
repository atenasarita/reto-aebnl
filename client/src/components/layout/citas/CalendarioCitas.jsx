import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from '@fullcalendar/timegrid';
import { useEffect, useState } from "react";
import DetalleCita from "./DetalleCita";

export default function CalendarioCitas() {
  const [eventos, setEventos] = useState([]);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  useEffect(() => {
    obtenerCitas();
  }, []);

  function getAgendaTagClass(item) {
  const especialistaId = Number(item.id_especialista);

  if (especialistaId === 1) return "blue";
  if (especialistaId === 2) return "purple";
  if (especialistaId === 3) return "green";
  if (especialistaId === 4) return "orange";
  if (especialistaId === 5) return "red";

  return "blue";
  }

  const obtenerCitas = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/citas");
      const data = await response.json();

      const eventosporID = data.map((item) => ({
      ...item,
      classNames: [getAgendaTagClass(item)]
      }));
      setEventos(eventosporID);
    } catch(error){
      console.error("Error: ", error);
    }
  }



  return (
    <>
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin]}
      initialView="dayGridMonth"
      locale='es'
      height= "100%"
      expandRows={true}
      events={eventos}
      dayMaxEvents={3}
      moreLinkText={(num) => `+ ${num} más`}
      eventContent={(eventInfo) => {
        const clase = eventInfo.event.classNames?.[0] || "blue";
        return (
          <div className={`custom-event-card ${clase}`}>
            <div className="custom-event-time">
              {eventInfo.timeText}
            </div>
            <div className="custom-event-title">
              {eventInfo.event.title}
            </div>
          </div>
        )
      }}
      eventClick={(info) => {
        setCitaSeleccionada(info.event);
      }}

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
    <DetalleCita
      cita={citaSeleccionada}
      onClose={() => setCitaSeleccionada(null)}
    />
    </>
  );
}