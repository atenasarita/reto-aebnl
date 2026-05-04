import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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
    to: "/registro_beneficiario",
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
    to: "/recibos",
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

function ActionCard({ title, subtitle, icon, variant, fullRow, to }) {
  const Icon = icon;
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`action-card action-card-${variant} ${fullRow ? "action-card-full" : ""}`}
      style={{ cursor: to ? "pointer" : "default" }}
    >
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
                  <button
                    type="button"
                    className={`agenda-btn ${getTimelineStatusClass(item) === "past" ? "muted" : "primary"}`}
                  >
                    {item.estatus || "Pendiente"}
                  </button>
                  <button type="button" className="agenda-btn secondary">
                    Ver Historial
                  </button>
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
                      <p>{item.estado || "Pendiente"}</p>
                    </div>
                  </div>

                  <div
                    className="preregistro-actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="icon-btn accept"
                      onClick={() => onUpdateEstado(item.id_preregistro, "aceptado")}
                    >
                      <Check size={24} />
                    </button>

                    <button
                      type="button"
                      className="icon-btn reject"
                      onClick={() => onUpdateEstado(item.id_preregistro, "rechazado")}
                    >
                      <X size={24} />
                    </button>

                    <button
                      type="button"
                      className={`icon-btn expand ${isOpen ? "open" : ""}`}
                      onClick={() => toggleItem(item.id_preregistro)}
                    >
                      <ChevronDown size={24} />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="preregistro-details">
                    <div>
                      <strong>CURP:</strong> {item.curp || "No registrada"}
                    </div>
                    <div>
                      <strong>Género:</strong> {item.genero || "No registrado"}
                    </div>
                    <div>
                      <strong>Fecha de nacimiento:</strong>{" "}
                      {item.fecha_nacimiento || "No registrada"}
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
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  let storedUser = null;
  try {
    storedUser = JSON.parse(localStorage.getItem("user") || "null");
  } catch (error) {
    storedUser = null;
  }

  const isAdministrador = storedUser?.rol === "administrador";

  const visibleActions = useMemo(() => {
    if (isAdministrador) return actions;
    return actions.filter((action) => action.title !== "Recibos");
  }, [isAdministrador]);

  const fetchAgenda = async () => {
    const res = await fetch(`${API_URL}/dashboard/agenda-hoy`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Error al cargar agenda");
    }

    setAgendaItems(data);
  };

  const fetchPreregistros = async () => {
    const res = await fetch(`${API_URL}/dashboard/preregistro-pendientes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Error al cargar preregistros");
    }

    setPreregistroItems(data);
  };

  const onUpdateEstado = async (id, estado) => {
    try {
      const res = await fetch(`${API_URL}/dashboard/preregistro/${id}/estado`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al actualizar preregistro");
      }

      await fetchPreregistros();
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setError("");
        await Promise.all([fetchAgenda(), fetchPreregistros()]);
      } catch (err) {
        setError(err.message || "Error al cargar dashboard");
      }
    };

    loadData();
  }, []);

  return (
    <div className="dashboard-page">
      <main className="dashboard-main">
        <section className="dashboard-actions">
          {visibleActions.map((action) => (
            <ActionCard key={action.title} {...action} />
          ))}
        </section>

        <section className="dashboard-lower-grid">
          {error ? (
            <section className="agenda-panel">
              <div className="empty-panel-state">
                <p>{error}</p>
              </div>
            </section>
          ) : (
            <>
              <AgendaCard agendaItems={agendaItems} />
              <PreregistroCard
                preregistroItems={preregistroItems}
                onUpdateEstado={onUpdateEstado}
              />
            </>
          )}
        </section>
      </main>
    </div>
  );
}