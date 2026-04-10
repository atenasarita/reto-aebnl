/** Consultas SQL del módulo inventario (Oracle). */

export const SELECT_INVENTARIO = `
SELECT
    i.ID_INVENTARIO,
    i.CLAVE,
    i.NOMBRE,
    i.ID_CATEGORIA,
    i.UNIDAD_MEDIDA,
    i.PRECIO,
    i.CANTIDAD,
    i.ACTIVO,
    c.DESCRIPCION AS DESCRIPCION_CATEGORIA
FROM Inventario i
LEFT JOIN Objeto_categoria c ON c.ID_CATEGORIA = i.ID_CATEGORIA
`.trim()
