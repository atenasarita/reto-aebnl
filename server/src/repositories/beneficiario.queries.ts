export const SELECT_BENEFICIARIO_DETALLE_BASE = `
  SELECT b.id_beneficiario,
         b.folio,
         TO_CHAR(b.fecha_ingreso, 'YYYY-MM-DD') AS fecha_ingreso,
         b.genero,
         b.estado,
         i.CURP,
         i.nombres,
         i.apellido_paterno,
         i.apellido_materno,
         TO_CHAR(i.fecha_nacimiento, 'YYYY-MM-DD') AS fecha_nacimiento,
         i.estado_nacimiento,
         i.fotografia,
         i.telefono,
         i.email,
         dm.contacto_nombre,
         dm.contacto_telefono,
         dm.contacto_parentesco,
         dm.alergias,
         dm.tipo_sanguineo,
         d.domicilio_calle,
         d.domicilio_cp,
         d.domicilio_ciudad,
         d.domicilio_estado,
         m.id_membresia,
         m.precio,
         TO_CHAR(m.fecha_inicio, 'YYYY-MM-DD') AS fecha_inicio,
         TO_CHAR(m.fecha_fin, 'YYYY-MM-DD') AS fecha_fin,
         m.estado AS membresia_estado,
         m.metodo_pago,
         TRUNC(m.fecha_fin - SYSDATE) AS dias_para_vencer
  FROM Beneficiario b
  LEFT JOIN Membresias m ON m.id_beneficiario = b.id_beneficiario
  LEFT JOIN Identificadores i ON i.id_beneficiario = b.id_beneficiario
  LEFT JOIN Datos_medicos dm ON dm.id_beneficiario = b.id_beneficiario
  LEFT JOIN Direccion d ON d.id_beneficiario = b.id_beneficiario
`.trim();

export const SELECT_BENEFICIARIOS_WITH_MEMBRESIAS_ENDING_SOON = `${SELECT_BENEFICIARIO_DETALLE_BASE}
WHERE m.estado = 'activa'
  AND m.fecha_fin BETWEEN SYSDATE AND SYSDATE + 7`;

export const SELECT_BENEFICIARIOS = `${SELECT_BENEFICIARIO_DETALLE_BASE}
ORDER BY b.id_beneficiario ASC`;

export const SELECT_BENEFICIARIO_BY_ID = `${SELECT_BENEFICIARIO_DETALLE_BASE}
WHERE b.id_beneficiario = :id_beneficiario`;

export const SELECT_BENEFICIARIO_BY_FOLIO = `${SELECT_BENEFICIARIO_DETALLE_BASE}
WHERE b.folio = :folio`;

export function selectTipoEspinasByBeneficiarioIds(placeholders: string): string {
  return `
    SELECT be.id_beneficiario,
           be.id_espina,
           eb.nombre
    FROM Beneficiario_espina be
    INNER JOIN Espina_bidifa eb ON eb.id_espina = be.id_espina
    WHERE be.id_beneficiario IN (${placeholders})
    ORDER BY be.id_beneficiario, be.id_espina
  `.trim();
}

export const INSERT_BENEFICIARIO = `
  INSERT INTO Beneficiario (folio, fecha_ingreso, genero, estado)
  VALUES (:folio, :fecha_ingreso, :genero, :estado)
  RETURNING id_beneficiario INTO :id_beneficiario
`.trim();

export const INSERT_BENEFICIARIO_ESPINA = `
  INSERT INTO Beneficiario_espina (id_beneficiario, id_espina)
  VALUES (:id_beneficiario, :id_espina)
`.trim();

export const INSERT_IDENTIFICADORES_RETURNING = `
  INSERT INTO Identificadores (
      id_beneficiario,
      CURP,
      nombres,
      apellido_paterno,
      apellido_materno,
      fecha_nacimiento,
      estado_nacimiento,
      fotografia,
      telefono,
      email
  )
  VALUES (
      :id_beneficiario,
      :CURP,
      :nombres,
      :apellido_paterno,
      :apellido_materno,
      :fecha_nacimiento,
      :estado_nacimiento,
      :fotografia,
      :telefono,
      :email
  )
  RETURNING id_identificadores INTO :id_identificadores
`.trim();

export const INSERT_DATOS_MEDICOS_RETURNING = `
  INSERT INTO Datos_medicos (
      id_beneficiario,
      contacto_nombre,
      contacto_telefono,
      contacto_parentesco,
      alergias,
      tipo_sanguineo
  )
  VALUES (
      :id_beneficiario,
      :contacto_nombre,
      :contacto_telefono,
      :contacto_parentesco,
      :alergias,
      :tipo_sanguineo
  )
  RETURNING id_datos_medicos INTO :id_datos_medicos
`.trim();

export const INSERT_DIRECCION_RETURNING = `
  INSERT INTO Direccion (
      id_beneficiario,
      domicilio_calle,
      domicilio_cp,
      domicilio_ciudad,
      domicilio_estado
  )
  VALUES (
      :id_beneficiario,
      :domicilio_calle,
      :domicilio_cp,
      :domicilio_ciudad,
      :domicilio_estado
  )
  RETURNING id_direccion INTO :id_direccion
`.trim();

export const INSERT_MEMBRESIA = `
  INSERT INTO Membresias (id_beneficiario, precio, fecha_inicio, fecha_fin, estado, metodo_pago)
  VALUES (:id_beneficiario, :precio, :fecha_inicio, :fecha_fin, :estado, :metodo_pago)
`.trim();

export const UPDATE_BENEFICIARIO_ESTADO = `
  UPDATE Beneficiario
  SET estado = :estado
  WHERE id_beneficiario = :id_beneficiario
`.trim();
