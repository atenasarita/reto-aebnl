export const SELECT_TIPOS_SERVICIO = `
    SELECT id_catalogo_servicio, nombre, categoria, precio
    FROM catalogo_servicios
    ORDER BY categoria, nombre
`;