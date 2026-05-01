export const citasQueries ={
    getCitas: `
    SELECT 
    id_cita AS "id",
    motivo AS "title",
    TO_CHAR(fecha, 'YYYY-MM-DD') || 'T' ||
    CASE 
        WHEN LENGTH(hora) = 5 THEN hora || ':00'
        ELSE hora
    END AS "start",
    id_beneficiario AS "idBeneficiario",
    id_especialista AS "id_especialista",
    id_catalogo_servicio AS "idServicio",
    notas AS "notas",
    estatus AS "estatus"
FROM citas
ORDER BY fecha DESC, hora DESC;
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