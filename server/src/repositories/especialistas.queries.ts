
export const especialistasQueries = {
 // Obtiene a los especialistas
  getEspecialistas: `
    SELECT
      e.id_especialista,
      e.nombre_completo,
      t.nombre AS especialidad
    FROM especialistas e
    LEFT JOIN tipo_especialidad t ON t.id_especialidad = e.especialidad
    ORDER BY e.nombre_completo ASC
  `.trim(),

 // Obtiene los servicios
  getCatalogoServicios: `
    SELECT
      id_catalogo_servicio,
      nombre,
      categoria,
      precio
    FROM catalogo_servicios
    ORDER BY nombre ASC
  `.trim(),

  // Busca beneficiarios por nombre o folio
  searchBeneficiarios: `
    SELECT
      b.id_beneficiario,
      b.folio,
      i.nombres,
      i.apellido_paterno,
      i.apellido_materno,
      i.telefono,
      i.email
    FROM beneficiario b
    JOIN identificadores i ON i.id_beneficiario = b.id_beneficiario
    WHERE b.estado = 'activo'
      AND (
        UPPER(i.nombres || ' ' || i.apellido_paterno || ' ' || i.apellido_materno)
          LIKE UPPER('%' || :q || '%')
        OR UPPER(b.folio) LIKE UPPER('%' || :q || '%')
      )
    ORDER BY i.apellido_paterno, i.nombres
    FETCH FIRST 10 ROWS ONLY
  `.trim(),

  // Actualizar una cita existente
  updateCita: `
    UPDATE citas SET
      fecha                = :fecha,
      hora                 = :hora,
      id_especialista      = :id_especialista,
      id_catalogo_servicio = :id_catalogo_servicio,
      motivo               = :motivo,
      notas                = :notas,
      estatus              = :estatus
    WHERE id_cita = :id_cita
  `.trim(),

};