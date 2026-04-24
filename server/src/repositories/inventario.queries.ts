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
`.trim();

export const SELECT_OBJETO_CATEGORIAS = `
SELECT
    oc.ID_CATEGORIA,
    oc.DESCRIPCION
FROM Objeto_categoria oc
ORDER BY oc.ID_CATEGORIA
`.trim();

export const INSERT_INVENTARIO = `
INSERT INTO Inventario (
    clave,
    nombre,
    id_categoria,
    unidad_medida,
    precio,
    cantidad,
    activo
)
VALUES (
    :clave,
    :nombre,
    :id_categoria,
    :unidad_medida,
    :precio,
    :cantidad,
    :activo
)
RETURNING id_inventario INTO :id_inventario
`.trim();

export const SELECT_CANTIDAD_INVENTARIO_FOR_UPDATE = `
SELECT cantidad
FROM Inventario
WHERE id_inventario = :id_inventario
FOR UPDATE
`.trim();

export const INSERT_MOVIMIENTO_INVENTARIO = `
INSERT INTO Movimientos_inventario (
    id_inventario,
    tipo_movimiento,
    cantidad,
    fecha,
    cant_anterior,
    cant_nueva,
    id_servicio_otorgado,
    id_usuario,
    motivo
)
VALUES (
    :id_inventario,
    :tipo_movimiento,
    :cantidad,
    :fecha,
    :cant_anterior,
    :cant_nueva,
    :id_servicio_otorgado,
    :id_usuario,
    :motivo
)
RETURNING id_movimiento INTO :id_movimiento
`.trim();

export const UPDATE_INVENTARIO_CANTIDAD = `
UPDATE Inventario
SET cantidad = :cantidad
WHERE id_inventario = :id_inventario
`.trim();

export const SELECT_PRODUCTOS_ESCASOS = `
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
WHERE i.CANTIDAD <= 10
  AND i.ACTIVO = 1
ORDER BY i.CANTIDAD ASC, i.NOMBRE ASC
`.trim();