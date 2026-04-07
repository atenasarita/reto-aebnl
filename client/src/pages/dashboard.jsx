import {
    ArrowRight,
    CalendarDays,
    Check,
    ClipboardPlus,
    Clock3,
    Cog,
    Info,
    Plus,
    Receipt,
    User,
    UserPlus,
    X,
  } from "lucide-react";
  import "./styles/dashboard.css";
  
  const actions = [
    {
      title: "Registrar Servicio",
      subtitle: "Documentar nueva atención",
      icon: ClipboardPlus,
      variant: "primary",
    },
    {
      title: "Nuevo Beneficiario",
      subtitle: "Alta manual de beneficiario",
      icon: UserPlus,
      variant: "light",
    },
    {
      title: "Agendar Cita",
      subtitle: "Gestionar horario médico",
      icon: CalendarDays,
      variant: "accent",
    },
    {
      title: "Recibos",
      subtitle: "Consultar y registrar pagos",
      icon: Receipt,
      variant: "success",
      fullRow: true,
    },
  ];
  
  const agendaItems = [
    {
      time: "10:00 AM",
      type: "Chequeo General",
      name: "María González",
      doctor: "Dr. Martínez",
      place: "Consultorio A-12",
      status: "Confirmar Asistencia",
      note: "Última visita: 15 Sept (Fisioterapia)",
      priority: "Requiere atención prioritaria",
      active: true,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=60",
    },
    {
      time: "02:30 PM",
      type: "Terapia Física",
      name: "Sofía Ramírez",
      doctor: "Gimnasio A",
      place: "Fisioterapeuta Especialista",
      status: "Esperando Arribo",
      note: "",
      priority: "",
      active: false,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&auto=format&fit=crop&q=60",
    },
  ];
  
  const preregistroItems = [
    {
      name: "Carlos Méndez",
      detail: "Registro Online • Hace 15m",
    },
    {
      name: "Elena Ruiz",
      detail: "Registro Online • Hace 15m",
    },
  ];
  
  function ActionCard({ title, subtitle, icon: Icon, variant, fullRow }) {
    return (
      <button className={`action-card action-card-${variant} ${fullRow ? "action-card-full" : ""}`}>
        <div className={`action-card-icon action-card-icon-${variant}`}>
          <Icon size={30} />
        </div>
  
        <div className="action-card-text">
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
  
        <div className="action-card-arrow">
          {variant === "light" ? <Plus size={28} /> : <ArrowRight size={28} />}
        </div>
      </button>
    );
  }
  function AgendaCard() {
    return (
      <section className="agenda-panel">
        <div className="panel-header">
          <h2>Agenda del Día</h2>
          <p>Gestión de citas y flujo de pacientes para hoy.</p>
        </div>
  
        <div className="agenda-timeline">
          {agendaItems.map((item, index) => (
            <div className="agenda-row" key={item.name}>
              <div className={`timeline-line ${item.active ? "active" : ""}`}>
                <div className={`timeline-dot ${item.active ? "active" : ""}`}></div>
              </div>
  
              <div className="agenda-item-card">
                <div className="agenda-item-top">
                  <div className="agenda-profile">
                    <img src={item.image} alt={item.name} className="agenda-avatar" />
  
                    <div className="agenda-profile-text">
                      <div className={`agenda-tag ${index === 0 ? "blue" : "purple"}`}>
                        {item.time} • {item.type}
                      </div>
  
                      <h3>{item.name}</h3>
                      <p>
                        {item.doctor} • {item.place}
                      </p>
                    </div>
                  </div>
  
                  <div className="agenda-actions">
                    <button className={`agenda-btn ${item.active ? "primary" : "muted"}`}>
                      {item.status}
                    </button>
                    <button className="agenda-btn secondary">Ver Historial</button>
                  </div>
                </div>
  
                <div className="agenda-item-bottom">
                  <div className="agenda-note-left">
                    {item.note && (
                      <>
                        <Info size={16} />
                        <span>{item.note}</span>
                      </>
                    )}
                  </div>
  
                  <div className="agenda-note-right">
                    {item.priority && (
                      <>
                        <span className="priority-asterisk">*</span>
                        <span>{item.priority}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }
  
  function PreregistroCard() {
    return (
      <section className="preregistro-panel">
        <div className="preregistro-header">
          <h2>PERSONAS EN PRE-REGISTRO</h2>
          <div className="pending-badge">4 Pendientes</div>
        </div>
  
        <div className="preregistro-list">
          {preregistroItems.map((item) => (
            <div className="preregistro-item" key={item.name}>
              <div className="preregistro-left">
                <div className="preregistro-avatar">
                  <User size={24} />
                </div>
  
                <div className="preregistro-text">
                  <h3>{item.name}</h3>
                  <p>{item.detail}</p>
                </div>
              </div>
  
              <div className="preregistro-actions">
                <button className="mini-btn approve">
                  <Check size={28} />
                </button>
                <button className="mini-btn reject">
                  <X size={28} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }
  
  export default function Dashboard() {
    return (
      <div className="dashboard-page">
        <main className="dashboard-main">
          <section className="dashboard-actions">
            {actions.map((action) => (
              <ActionCard key={action.title} {...action} />
            ))}
          </section>
  
          <section className="dashboard-lower-grid">
            <AgendaCard />
            <PreregistroCard />
          </section>
        </main>
      </div>
    );
  }