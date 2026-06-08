//  Cada objeto relaciona un especialista con un color visual para mostrarlo en la agenda/calendario.
// El ID se usa como referencia principal porque es más confiable que el nombre.
const ESPECIALISTA_COLOR_MAP = [
  { id: 26, name: "laura", color: "pink" },
  { id: 27, name: "carlos", color: "purple" },
  { id: 28, name: "ana", color: "green" },
  { id: 29, name: "roberto", color: "orange" },
  { id: 1, name: "luis", color: "teal" },
  { id: 2, name: "luis", color: "teal" },
  { id: 4, name: "luis", color: "teal" },
  { id: 3, name: "sofia", color: "red" },
  { id: 5, name: "sofia", color: "red" },
];

// Normaliza texto para evitar problemas con mayúsculas, minúsculas o acentos.
function normalizarTexto(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Regresa la clase de color que debe usar una cita en la agenda o calendario.
// Primero intenta encontrar al especialista por ID
// Si no encuentra coincidencia por ID, usa el nombre como respaldo.
export function getAgendaTagClass(item) {
  const especialistaId = Number(
    item.id_especialista ??
    item.idEspecialista ??
    item.ID_ESPECIALISTA ??
    item.extendedProps?.id_especialista ??
    item.extendedProps?.idEspecialista
  );

  const matchById = ESPECIALISTA_COLOR_MAP.find(
    (e) => e.id === especialistaId
  );

  if (matchById) {
    return matchById.color;
  }

  const especialistaNombre = normalizarTexto(
    item.especialista_nombre ??
    item.especialistaNombre ??
    item.especialista ??
    item.ESPECIALISTA_NOMBRE ??
    item.extendedProps?.especialista_nombre ??
    item.extendedProps?.especialistaNombre ??
    item.extendedProps?.especialista
  );

  const matchByName = ESPECIALISTA_COLOR_MAP.find(
    (e) => especialistaNombre.includes(e.name)
  );

  // Si no encuentra coincidencia, usa azul como color por defecto.
  return matchByName?.color ?? "blue";
}