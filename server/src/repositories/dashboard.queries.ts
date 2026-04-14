export const SELECT_AGENDA_HOY = `
  SELECT
    c.id_cita,
    TO_CHAR(c.fecha, 'YYYY-MM-DD') AS fecha,
    c.hora,
    c.estatus,
    c.motivo,
    c.notas,
    c.id_beneficiario,
    c.id_especialista,
    b.folio,
    i.nombres,
    i.apellido_paterno,
    i.apellido_materno,
    i.fotografia,
    e.nombre_completo AS especialista_nombre,
    cs.nombre AS servicio_nombre
  FROM CITAS c
  INNER JOIN BENEFICIARIO b
    ON b.id_beneficiario = c.id_beneficiario
  LEFT JOIN IDENTIFICADORES i
    ON i.id_beneficiario = b.id_beneficiario
  LEFT JOIN ESPECIALISTAS e
    ON e.id_especialista = c.id_especialista
  LEFT JOIN CATALOGO_SERVICIOS cs
    ON cs.id_catalogo_servicio = c.id_catalogo_servicio
  WHERE TRUNC(c.fecha) = TRUNC(SYSDATE)
  ORDER BY c.hora ASC
`.trim();

export const SELECT_PREREGISTRO_PENDIENTE = `
  SELECT
    p.id_preregistro,
    p.nombres,
    p.apellido_paterno,
    p.apellido_materno,
    TO_CHAR(p.fecha_nacimiento, 'YYYY-MM-DD') AS fecha_nacimiento,
    p.genero,
    p.curp,
    p.estado,
    p.id_beneficiario
  FROM PREREGISTRO p
  WHERE UPPER(TRIM(p.estado)) = 'PENDIENTE'
  ORDER BY p.id_preregistro DESC
`.trim();

export const UPDATE_PREREGISTRO_ESTADO = `
  UPDATE PREREGISTRO
  SET ESTADO = :estado
  WHERE ID_PREREGISTRO = :id_preregistro
`.trim();