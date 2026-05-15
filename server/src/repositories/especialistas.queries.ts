export const SELECT_ESPECIALISTA_BY_ESPECIALIDAD = `
  SELECT
    id_especialista,
    nombre_completo,
    especialidad
  FROM especialistas
  WHERE especialidad = :id_especialidad
`;