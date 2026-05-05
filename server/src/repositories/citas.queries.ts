export const citasQueries ={
    getCitas: `
        SELECT 
            c.id_cita AS "id",
            c.motivo AS "title",
            TO_CHAR(c.fecha, 'YYYY-MM-DD') || 'T' ||
            CASE 
                WHEN LENGTH(c.hora) = 5 THEN c.hora || ':00'
                ELSE c.hora
            END AS "start",
            c.id_beneficiario AS "idBeneficiario",
            c.id_especialista AS "id_especialista",
            e.nombre_completo AS "especialista",
            c.id_catalogo_servicio AS "idServicio",
            c.notas AS "notas",
            c.estatus AS "estatus"
        FROM citas c
        JOIN especialistas e 
            ON c.id_especialista = e.id_especialista
        ORDER BY c.fecha DESC, c.hora DESC;
    `.trim(),

    insertCita: `
    INSERT INTO citas (
    id_beneficiario,
    fecha,
    hora,
    id_especialista,
    id_catalogo_servicio,
    motivo,
    notas,
    estatus
    ) VALUES (
     :id_beneficiario,
     :fecha,
     :hora,
     :id_especialista,
     :id_catalogo_servicio,
     :motivo,
     :notas,
     :estatus
     )
    `.trim()     
}