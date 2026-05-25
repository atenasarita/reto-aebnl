const ESPECIALISTA_COLOR_MAP = [
  { id: 26, name: "laura",   color: "blue"   },
  { id: 27, name: "carlos",  color: "purple" },
  { id: 28, name: "roberto", color: "green"  },
  { id: 29, name: "luis",    color: "orange" },
  { id: 30, name: "sofia",   color: "red"    },
];

export function getAgendaTagClass(item) {
  const especialistaId = Number(item.id_especialista);
  const especialistaNombre = String(item.especialista_nombre || "").toLowerCase();

  const match = ESPECIALISTA_COLOR_MAP.find(
    (e) => e.id === especialistaId || especialistaNombre.includes(e.name)
  );

  return match?.color ?? "blue";
}