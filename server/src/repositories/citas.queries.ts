export const citasQueries ={
    getCitas: `
    SELECT 
        id_cita,
        id_beneficiario,
        fecha,
        hora,
        id_especialista,
        id_catalogo_servicio,
        motivo,
        notas,
        estatus
    FROM citas
    ORDER BY fecha DESC, hora DESC
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