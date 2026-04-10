import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardPlus,
  Info,
  Plus,
  Receipt,
  User,
  UserPlus,
  X,
} from "lucide-react";
import "./styles/dashboard.css";

const API_URL = "http://localhost:3000/api";

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
    subtitle: "Control de pagos y comprobantes",
    icon: Receipt,
    variant: "success",
    fullRow: true,
  },
];

function getAgendaTagClass(item) {
  const especialistaId = Number(item.id_especialista);

  if (especialistaId === 1) return "blue";
  if (especialistaId === 2) return "purple";
  if (especialistaId === 3) return "green";
  if (especialistaId === 4) return "orange";
  if (especialistaId === 5) return "red";

  return "blue";
}

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

function formatHora12(hora) {
  if (!hora) return "";

  const [rawHours, rawMinutes] = hora.split(":");
  const hours = Number(rawHours);
  const minutes = rawMinutes ?? "00";

  if (Number.isNaN(hours)) return hora;

  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;

  return `${String(hour12).padStart(2, "0")}:${minutes} ${suffix}`;
}

function getTimelineStatusClass(item) {
  if (!item?.fecha || !item?.hora) return "future";

  const citaDate = new Date(`${item.fecha}T${item.hora}:00`);
  const now = new Date();
  const diffMs = citaDate.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 0) return "past";
  if (diffHours <= 2) return "soon";

  return "future";
}

function AgendaCard({ agendaItems }) {
  if (!agendaItems.length) {
    return (
      <section className="agenda-panel">
        <div className="panel-header">
          <h2>Agenda del Día</h2>
          <p>Gestión de citas y flujo de pacientes para hoy.</p>
        </div>

        <div className="empty-panel-state">
          <CalendarDays size={42} />
          <h3>Sin citas para hoy</h3>
          <p>No hay registros de agenda para la fecha actual.</p>
        </div>
      </section>

      
    );
  }

  return (
    <section className="agenda-panel">
      <div className="panel-header">
        <h2>Agenda del Día</h2>
        <p>Gestión de citas y flujo de pacientes para hoy.</p>
      </div>

      <div className="agenda-timeline">
  {agendaItems.map((item) => (
    <div className="agenda-row" key={item.id_cita}>
      <div className={`timeline-line ${getTimelineStatusClass(item)}`}>
        <div className={`timeline-dot ${getTimelineStatusClass(item)}`}></div>
      </div>

      <div className="agenda-item-card">
        <div className="agenda-item-top">
          <div className="agenda-profile">
            {item.fotografia ? (
              <img
                src={item.fotografia}
                alt={item.nombre_completo}
                className="agenda-avatar"
              />
            ) : (
              <div className="agenda-avatar placeholder">
                <User size={34} />
              </div>
            )}

            <div className="agenda-profile-text">
              <div className={`agenda-tag ${getAgendaTagClass(item)}`}>
                {formatHora12(item.hora)} • {item.servicio_nombre || "Servicio"}
              </div>

              <h3>{item.nombre_completo || "Beneficiario sin nombre"}</h3>
              <p>
                {item.especialista_nombre || "Especialista"} • {item.folio || "Sin folio"}
              </p>
            </div>
          </div>

          <div className="agenda-actions">
            <button className={`agenda-btn ${getTimelineStatusClass(item) === "past" ? "muted" : "primary"}`}>
              {item.estatus || "Pendiente"}
            </button>
            <button className="agenda-btn secondary">Ver Historial</button>
          </div>
        </div>

        <div className="agenda-item-bottom">
          <div className="agenda-note-left">
            {item.motivo ? (
              <>
                <Info size={16} />
                <span>{item.motivo}</span>
              </>
            ) : (
              <span>Sin motivo registrado</span>
            )}
          </div>

          <div className="agenda-note-right">
            {item.notas ? <span>{item.notas}</span> : <span>Sin notas</span>}
          </div>
        </div>
      </div>
    </div>
  ))}
</div>
    </section>
  );
}

function PreregistroCard({ preregistroItems, onUpdateEstado }) {
  const [openId, setOpenId] = useState(null);

  const toggleItem = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="preregistro-panel">
      <div className="preregistro-header">
        <h2>PERSONAS EN PRE-REGISTRO</h2>
        <div className="pending-badge">{preregistroItems.length} Pendientes</div>
      </div>

      <div className="preregistro-list">
        {!preregistroItems.length ? (
          <div className="empty-side-state">
            <User size={40} />
            <h3>Sin pendientes</h3>
            <p>No hay personas en pre-registro por ahora.</p>
          </div>
        ) : (
          preregistroItems.map((item) => {
            const isOpen = openId === item.id_preregistro;

            return (
              <div
                className={`preregistro-card-wrapper ${isOpen ? "open" : ""}`}
                key={item.id_preregistro}
              >
                <div
                  className="preregistro-item"
                  onClick={() => toggleItem(item.id_preregistro)}
                >
                  <div className="preregistro-left">
                    <div className="preregistro-avatar">
                      <User size={24} />
                    </div>

                    <div className="preregistro-text">
                      <h3>{item.nombre_completo || "Sin nombre"}</h3>
                      <p>{item.estado || "pendiente"}</p>
                    </div>
                  </div>

                  <div
                    className="preregistro-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="preregistro-actions">
                      <button
                        className="mini-btn approve"
                        onClick={() => onUpdateEstado(item.id_preregistro, "aceptado")}
                      >
                        <Check size={26} />
                      </button>
                      <button
                        className="mini-btn reject"
                        onClick={() => onUpdateEstado(item.id_preregistro, "rechazado")}
                      >
                        <X size={26} />
                      </button>
                    </div>

                    <button
                      className={`expand-btn ${isOpen ? "open" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleItem(item.id_preregistro);
                      }}
                    >
                      ▼
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="preregistro-details">
                    <div className="preregistro-detail-grid">
                      <div className="detail-box">
                        <span className="detail-label">Nombre completo</span>
                        <span className="detail-value">
                          {item.nombre_completo || "No disponible"}
                        </span>
                      </div>

                      <div className="detail-box">
                        <span className="detail-label">CURP</span>
                        <span className="detail-value">
                          {item.curp || "No disponible"}
                        </span>
                      </div>

                      <div className="detail-box">
                        <span className="detail-label">Género</span>
                        <span className="detail-value">
                          {item.genero || "No disponible"}
                        </span>
                      </div>

                      <div className="detail-box">
                        <span className="detail-label">Fecha de nacimiento</span>
                        <span className="detail-value">
                          {item.fecha_nacimiento || "No disponible"}
                        </span>
                      </div>

                      <div className="detail-box">
                        <span className="detail-label">Estado</span>
                        <span className="detail-value">
                          {item.estado || "No disponible"}
                        </span>
                      </div>

                      <div className="detail-box">
                        <span className="detail-label">ID beneficiario</span>
                        <span className="detail-value">
                          {item.id_beneficiario ?? "Sin asignar"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default function Dashboard() {
  const [agendaItems, setAgendaItems] = useState([]);
  const [preregistroItems, setPreregistroItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    const token = localStorage.getItem("token");

    try {
      setLoading(true);
      setError("");

      const [agendaRes, preregistroRes] = await Promise.all([
        fetch(`${API_URL}/dashboard/agenda-hoy`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_URL}/dashboard/preregistro-pendientes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const agendaData = await agendaRes.json();
      const preregistroData = await preregistroRes.json();

      if (!agendaRes.ok) {
        throw new Error(agendaData.message || "No se pudo cargar la agenda");
      }

      if (!preregistroRes.ok) {
        throw new Error(preregistroData.message || "No se pudo cargar el pre-registro");
      }

      setAgendaItems(Array.isArray(agendaData) ? agendaData : []);
      setPreregistroItems(Array.isArray(preregistroData) ? preregistroData : []);
    } catch (err) {
      setError(err.message || "Error al cargar dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const updatePreregistroEstado = async (idPreregistro, nuevoEstado) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${API_URL}/dashboard/preregistro/${idPreregistro}/estado`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo actualizar el estado");
      }

      setPreregistroItems((prev) =>
        prev.filter((item) => item.id_preregistro !== idPreregistro)
      );
    } catch (err) {
      alert(err.message || "Error al actualizar preregistro");
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <main className="dashboard-main">
          <div className="loading-state">Cargando dashboard...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <main className="dashboard-main">
          <div className="error-state">{error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <main className="dashboard-main">
        <section className="dashboard-actions">
          {actions.map((action) => (
            <ActionCard key={action.title} {...action} />
          ))}
        </section>

        <section className="dashboard-lower-grid">
          <AgendaCard agendaItems={agendaItems} />
          <PreregistroCard
            preregistroItems={preregistroItems}
            onUpdateEstado={updatePreregistroEstado}
          />
        </section>
      </main>
    </div>
  );
}