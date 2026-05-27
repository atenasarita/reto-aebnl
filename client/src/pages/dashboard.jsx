import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../utils/config";
import { getStoredUser, getValidToken, handleUnauthorizedResponse } from "../utils/auth";
import { getAgendaTagClass } from "../utils/agendaUtils";
import { todayDate } from "../utils/dateTime";

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

const actions = [
  {
    title: "Registrar Servicio",
    subtitle: "Documentar nueva atención",
    icon: ClipboardPlus,
    variant: "primary",
    to: "/registro_servicios",
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
    to: "/citas",
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

function ActionCard({ title, subtitle, icon, variant, fullRow, to }) {
  const Icon = icon;
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => to && navigate(to)}
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
  const diffHours = (citaDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffHours < 0) return "past";
  if (diffHours <= 2) return "soon";
  return "future";
}

function AgendaCard({ agendaItems }) {
  if (!agendaItems.length) {
    return (
      <section className="agenda-panel fade-in-panel">
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
    <section className="agenda-panel fade-in-panel">
      <div className="panel-header">
        <h2>Agenda del Día</h2>
        <p>Gestión de citas y flujo de pacientes para hoy.</p>
      </div>

      <div className="agenda-timeline">
        {agendaItems.map((item, index) => (
          <div
            className="agenda-row fade-in-up"
            key={item.id_cita}
            style={{ animationDelay: `${index * 0.06}s` }}
          >
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

function PreregistroCard({ preregistroItems, onAceptar, onRechazar }) {
  const [openId, setOpenId] = useState(null);

  const toggleItem = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="preregistro-panel fade-in-panel">
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
          preregistroItems.map((item, index) => {
            const isOpen = openId === item.id_preregistro;

            return (
              <div
                className={`preregistro-card-wrapper ${isOpen ? "open" : ""} fade-in-up`}
                key={item.id_preregistro}
                style={{ animationDelay: `${index * 0.06}s` }}
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
                      aria-label="Aceptar preregistro"
                      onClick={() => onAceptar(item)}
                    >
                      <Check />
                    </button>

                    <button
                      type="button"
                      className="icon-btn reject"
                      aria-label="Rechazar preregistro"
                      onClick={() => onRechazar(item.id_preregistro)}
                    >
                      <X />
                    </button>

                    <button
                      type="button"
                      className={`icon-btn expand ${isOpen ? "open" : ""}`}
                      aria-label="Expandir detalles"
                      onClick={() => toggleItem(item.id_preregistro)}
                    >
                      <ChevronDown />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="preregistro-details">
                    <div><strong>CURP:</strong> {item.curp || "No registrada"}</div>
                    <div><strong>Género:</strong> {item.genero || "No registrado"}</div>
                    <div><strong>Fecha de nacimiento:</strong> {item.fecha_nacimiento || "No registrada"}</div>
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

function PerfilIncompletoModal({ open, onClose, onEditarAhora, nombre }) {
  if (!open) return null;

  return (
    <div className="custom-modal-overlay" onClick={onClose}>
      <div className="custom-modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>Perfil incompleto</h3>
        <p>
          {nombre
            ? `El preregistro de ${nombre} fue aceptado correctamente.`
            : "El preregistro fue aceptado correctamente."}
        </p>
        <p>
          El perfil todavía tiene información pendiente por completar. ¿Te gustaría editarlo ahora?
        </p>

        <div className="custom-modal-actions">
          <button type="button" className="btn-secondary-modal" onClick={onClose}>
            Dejarlo por ahora
          </button>
          <button type="button" className="btn-primary-modal" onClick={onEditarAhora}>
            Editar ahora
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [agendaItems, setAgendaItems] = useState([]);
  const [preregistroItems, setPreregistroItems] = useState([]);
  const [error, setError] = useState("");

  const [perfilModalOpen, setPerfilModalOpen] = useState(false);
  const [nuevoBeneficiarioId, setNuevoBeneficiarioId] = useState(null);
  const [nuevoBeneficiarioNombre, setNuevoBeneficiarioNombre] = useState("");

  const token = getValidToken();
  const storedUser = getStoredUser();

  const isAdministrador = storedUser?.rol === "administrador";

  const visibleActions = useMemo(() => {
    if (isAdministrador) return actions;
    return actions.filter((action) => action.title !== "Recibos");
  }, [isAdministrador]);

  const fetchAgenda = async () => {

    const hoyFrontend = todayDate();

    const res = await fetch(`${API_URL}/api/dashboard/agenda-hoy?fecha=${hoyFrontend}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (handleUnauthorizedResponse(res)) return;

    const data = await res.json();

    // console.log("API_URL:", API_URL);
    // console.log("Agenda response:", data);
    // console.log("Es arreglo:", Array.isArray(data));
    // console.log("Total citas:", Array.isArray(data) ? data.length : "No es arreglo");

    // console.log("Fecha enviada desde el front:", hoyFrontend);
    // console.log("URL agenda:", `${API_URL}/api/dashboard/agenda-hoy?fecha=${hoyFrontend}`);

    if (!res.ok) {
      throw new Error(data.message || "Error al cargar agenda");
    }

    setAgendaItems(data);
  };

  const fetchPreregistros = async () => {
    const res = await fetch(`${API_URL}/api/dashboard/preregistro-pendientes`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (handleUnauthorizedResponse(res)) return;

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Error al cargar preregistros");
    }

    setPreregistroItems(data);
  };

  const aceptarPreregistro = async (preregistro) => {
    try {
      const res = await fetch(`${API_URL}/api/dashboard/preregistro/${preregistro.id_preregistro}/estado`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: "aceptado" }),
      });

      if (handleUnauthorizedResponse(res)) return;

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al aceptar preregistro");
      }

      await fetchPreregistros();

      setNuevoBeneficiarioId(data.id_beneficiario ?? null);
      setNuevoBeneficiarioNombre(preregistro?.nombre_completo ?? "");
      setPerfilModalOpen(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const rechazarPreregistro = async (idPreregistro) => {
    try {
      const res = await fetch(`${API_URL}/api/dashboard/preregistro/${idPreregistro}/estado`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: "rechazado" }),
      });

      if (handleUnauthorizedResponse(res)) return;

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al rechazar preregistro");
      }

      await fetchPreregistros();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditarAhora = () => {
    setPerfilModalOpen(false);

    if (nuevoBeneficiarioId) {
      navigate(`/beneficiarios?edit=${nuevoBeneficiarioId}`);
      return;
    }

    navigate("/beneficiarios");
  };

  const handleCerrarModalPerfil = () => {
    setPerfilModalOpen(false);
    setNuevoBeneficiarioId(null);
    setNuevoBeneficiarioNombre("");
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
        <section className="dashboard-actions fade-in-panel">
          {visibleActions.map((action) => (
            <ActionCard key={action.title} {...action} />
          ))}
        </section>

        <section className="dashboard-lower-grid">
          {error ? (
            <section className="agenda-panel fade-in-panel">
              <div className="empty-panel-state">
                <p>{error}</p>
              </div>
            </section>
          ) : (
            <>
              <AgendaCard agendaItems={agendaItems} />
              <PreregistroCard
                preregistroItems={preregistroItems}
                onAceptar={aceptarPreregistro}
                onRechazar={rechazarPreregistro}
              />
            </>
          )}
        </section>
      </main>

      <PerfilIncompletoModal
        open={perfilModalOpen}
        onClose={handleCerrarModalPerfil}
        onEditarAhora={handleEditarAhora}
        nombre={nuevoBeneficiarioNombre}
      />
    </div>
  );
} 