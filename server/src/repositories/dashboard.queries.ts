export const dashboardQueries = {
  getAgendaHoy: `
    SELECT
      c.id_cita,
      TO_CHAR(c.fecha, 'YYYY-MM-DD') AS fecha,
      TO_CHAR(c.hora, 'HH24:MI') AS hora,
      c.estatus,
      c.id_beneficiario,
      i.nombres || ' ' || i.apellido_paterno || ' ' || i.apellido_materno AS nombre_completo,
      b.folio
    FROM CITAS c
    JOIN BENEFICIARIO b ON b.id_beneficiario = c.id_beneficiario
    JOIN IDENTIFICADORES i ON i.id_beneficiario = b.id_beneficiario
    WHERE TRUNC(c.fecha) = TRUNC(SYSDATE)
    ORDER BY c.fecha ASC, c.hora ASC
  `,

  getPreregistroPendientes: `
    SELECT
      p.id_preregistro,
      p.nombres,
      p.apellido_paterno,
      p.apellido_materno,
      TRIM(
        NVL(p.nombres, '') || ' ' ||
        NVL(p.apellido_paterno, '') || ' ' ||
        NVL(p.apellido_materno, '')
      ) AS nombre_completo,
      p.curp,
      p.genero,
      TO_CHAR(p.fecha_nacimiento, 'YYYY-MM-DD') AS fecha_nacimiento,
      p.estado,
      p.id_beneficiario
    FROM PREREGISTRO p
    WHERE p.estado = 'pendiente'
    ORDER BY p.id_preregistro DESC
  `,

  getPreregistroById: `
    SELECT
      p.*
    FROM PREREGISTRO p
    WHERE p.id_preregistro = :id_preregistro
  `,

  getPreregistroEspinas: `
    SELECT pe.id_espina
    FROM PREREGISTRO_ESPINA pe
    WHERE pe.id_preregistro = :id_preregistro
  `,

  updatePreregistroEstadoOnly: `
    UPDATE PREREGISTRO
    SET estado = :estado
    WHERE id_preregistro = :id_preregistro
  `,

  insertBeneficiario: `
    INSERT INTO BENEFICIARIO (folio, fecha_ingreso, genero, estado)
    VALUES (:folio, SYSDATE, :genero, 'activo')
    RETURNING id_beneficiario INTO :id_beneficiario
  `,

  updateBeneficiarioFolio: `
    UPDATE BENEFICIARIO
    SET folio = 'ASEB-' || TO_CHAR(SYSDATE, 'YY') || '-' || LPAD(:id_beneficiario, 4, '0')
    WHERE id_beneficiario = :id_beneficiario
  `,

  insertIdentificadores: `
    INSERT INTO IDENTIFICADORES (
      id_beneficiario,
      curp,
      nombres,
      apellido_paterno,
      apellido_materno,
      fecha_nacimiento,
      estado_nacimiento,
      fotografia,
      telefono,
      email
    ) VALUES (
      :id_beneficiario,
      :curp,
      :nombres,
      :apellido_paterno,
      :apellido_materno,
      :fecha_nacimiento,
      :estado_nacimiento,
      :fotografia,
      :telefono,
      :email
    )
  `,

  insertBeneficiarioEspina: `
    INSERT INTO BENEFICIARIO_ESPINA (id_beneficiario, id_espina)
    VALUES (:id_beneficiario, :id_espina)
  `,

  updatePreregistroAceptado: `
    UPDATE PREREGISTRO
    SET estado = 'aceptado',
        id_beneficiario = :id_beneficiario
    WHERE id_preregistro = :id_preregistro
  `,
};