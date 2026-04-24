export const reportesQueries = {
  resumen: `
    SELECT
      (SELECT COUNT(*) FROM BENEFICIARIO WHERE estado = 'activo') AS beneficiarios_activos,
      (SELECT COUNT(*) FROM BENEFICIARIO WHERE estado = 'inactivo') AS beneficiarios_inactivos,
      (SELECT COUNT(*) FROM PREREGISTRO WHERE estado = 'pendiente') AS preregistros_pendientes,
      (SELECT COUNT(*) FROM PREREGISTRO WHERE estado = 'aceptado') AS preregistros_aceptados,
      (SELECT COUNT(*) FROM PREREGISTRO WHERE estado = 'rechazado') AS preregistros_rechazados,
      (SELECT COUNT(*) FROM MEMBRESIAS WHERE estado = 'activa') AS membresias_activas,
      (SELECT COUNT(*) FROM MEMBRESIAS WHERE estado = 'vencida') AS membresias_vencidas,
      (SELECT COUNT(*) FROM INVENTARIO WHERE ACTIVO = 1 AND CANTIDAD <= 10) AS inventario_bajo_stock,
      (SELECT COUNT(*) FROM INVENTARIO WHERE ACTIVO = 1) AS inventario_articulos_activos,
      (SELECT COUNT(*) FROM CITAS WHERE TRUNC(fecha, 'MM') = TRUNC(SYSDATE, 'MM')) AS citas_mes_actual,
      (SELECT COUNT(*) FROM SERVICIOS_OTORGADOS WHERE TRUNC(FECHA, 'MM') = TRUNC(SYSDATE, 'MM')) AS servicios_mes_actual
    FROM DUAL
  `,

  financieroMesTotales: `
    SELECT
      COUNT(DISTINCT so.ID_SERVICIO_OTORGADO) AS num_servicios,
      NVL(SUM(sf.MONTO_SERVICIO), 0) AS total_monto_servicio,
      NVL(SUM(sf.MONTO_INVENTARIO), 0) AS total_monto_inventario,
      NVL(SUM(sf.DESCUENTO), 0) AS total_descuentos,
      NVL(SUM(sf.CUOTA_TOTAL), 0) AS total_cuota,
      NVL(SUM(sf.MONTO_PAGADO), 0) AS total_pagado
    FROM SERVICIOS_OTORGADOS so
    LEFT JOIN SERVICIOS_FINANCIEROS sf ON sf.ID_SERVICIO_OTORGADO = so.ID_SERVICIO_OTORGADO
    WHERE TRUNC(so.FECHA, 'MM') = TRUNC(TO_DATE(:mes, 'YYYY-MM'), 'MM')
  `,

  financieroMesPorMetodoPago: `
    SELECT
      NVL(sf.METODO_PAGO, 'sin_definir') AS metodo_pago,
      COUNT(*) AS num_recibos,
      NVL(SUM(sf.CUOTA_TOTAL), 0) AS total_cuota,
      NVL(SUM(sf.MONTO_PAGADO), 0) AS total_pagado
    FROM SERVICIOS_OTORGADOS so
    INNER JOIN SERVICIOS_FINANCIEROS sf ON sf.ID_SERVICIO_OTORGADO = so.ID_SERVICIO_OTORGADO
    WHERE TRUNC(so.FECHA, 'MM') = TRUNC(TO_DATE(:mes, 'YYYY-MM'), 'MM')
    GROUP BY NVL(sf.METODO_PAGO, 'sin_definir')
    ORDER BY 1
  `,

  beneficiariosPorIngreso: `
    SELECT
      b.ID_BENEFICIARIO,
      b.FOLIO,
      TRIM(
        NVL(i.NOMBRES, '') || ' ' ||
        NVL(i.APELLIDO_PATERNO, '') || ' ' ||
        NVL(i.APELLIDO_MATERNO, '')
      ) AS nombre_completo,
      TO_CHAR(b.FECHA_INGRESO, 'YYYY-MM-DD') AS fecha_ingreso,
      b.ESTADO
    FROM BENEFICIARIO b
    INNER JOIN IDENTIFICADORES i ON i.ID_BENEFICIARIO = b.ID_BENEFICIARIO
    WHERE TRUNC(b.FECHA_INGRESO) BETWEEN TO_DATE(:desde, 'YYYY-MM-DD') AND TO_DATE(:hasta, 'YYYY-MM-DD')
    ORDER BY b.FECHA_INGRESO DESC, b.ID_BENEFICIARIO
  `,

  citasPorPeriodo: `
    SELECT
      c.ID_CITA,
      TO_CHAR(c.FECHA, 'YYYY-MM-DD') AS fecha,
      c.HORA,
      c.ESTATUS,
      b.FOLIO,
      TRIM(
        NVL(i.NOMBRES, '') || ' ' ||
        NVL(i.APELLIDO_PATERNO, '') || ' ' ||
        NVL(i.APELLIDO_MATERNO, '')
      ) AS nombre_beneficiario,
      cs.NOMBRE AS servicio_nombre,
      e.NOMBRE_COMPLETO AS especialista_nombre
    FROM CITAS c
    INNER JOIN BENEFICIARIO b ON b.ID_BENEFICIARIO = c.ID_BENEFICIARIO
    INNER JOIN IDENTIFICADORES i ON i.ID_BENEFICIARIO = b.ID_BENEFICIARIO
    LEFT JOIN ESPECIALISTAS e ON e.ID_ESPECIALISTA = c.ID_ESPECIALISTA
    LEFT JOIN CATALOGO_SERVICIOS cs ON cs.ID_CATALOGO_SERVICIO = c.ID_CATALOGO_SERVICIO
    WHERE TRUNC(c.FECHA) BETWEEN TO_DATE(:desde, 'YYYY-MM-DD') AND TO_DATE(:hasta, 'YYYY-MM-DD')
    ORDER BY c.FECHA, c.HORA
  `,

  analyticsTarjetas: `
    SELECT
      (SELECT COUNT(DISTINCT so.ID_BENEFICIARIO)
       FROM SERVICIOS_OTORGADOS so
       WHERE TRUNC(so.FECHA) BETWEEN TO_DATE(:desde, 'YYYY-MM-DD') AND TO_DATE(:hasta, 'YYYY-MM-DD')
      ) AS total_atendidos,
      (SELECT COUNT(*)
       FROM BENEFICIARIO b
       WHERE TRUNC(b.FECHA_INGRESO) BETWEEN TO_DATE(:desde, 'YYYY-MM-DD') AND TO_DATE(:hasta, 'YYYY-MM-DD')
      ) AS nuevos_registros,
      (SELECT COUNT(DISTINCT so.ID_CATALOGO_SERVICIO)
       FROM SERVICIOS_OTORGADOS so
       WHERE TRUNC(so.FECHA) BETWEEN TO_DATE(:desde, 'YYYY-MM-DD') AND TO_DATE(:hasta, 'YYYY-MM-DD')
      ) AS servicios_activos,
      (SELECT COUNT(*)
       FROM CITAS c
       WHERE TRUNC(c.FECHA) BETWEEN TO_DATE(:desde, 'YYYY-MM-DD') AND TO_DATE(:hasta, 'YYYY-MM-DD')
      ) AS citas_periodo,
      (SELECT COUNT(*)
       FROM SERVICIOS_OTORGADOS so
       WHERE TRUNC(so.FECHA) BETWEEN TO_DATE(:desde, 'YYYY-MM-DD') AND TO_DATE(:hasta, 'YYYY-MM-DD')
      ) AS servicios_otorgados_periodo
    FROM DUAL
  `,

  analyticsPersonasAtendidasPorMes: `
    SELECT
      TO_CHAR(TRUNC(so.FECHA, 'MM'), 'YYYY-MM') AS mes,
      COUNT(DISTINCT so.ID_BENEFICIARIO) AS cantidad
    FROM SERVICIOS_OTORGADOS so
    WHERE TRUNC(so.FECHA) BETWEEN TO_DATE(:desde, 'YYYY-MM-DD') AND TO_DATE(:hasta, 'YYYY-MM-DD')
    GROUP BY TRUNC(so.FECHA, 'MM')
    ORDER BY TRUNC(so.FECHA, 'MM')
  `,

  analyticsDistribucionGenero: `
    WITH atendidos AS (
      SELECT DISTINCT so.ID_BENEFICIARIO
      FROM SERVICIOS_OTORGADOS so
      WHERE TRUNC(so.FECHA) BETWEEN TO_DATE(:desde, 'YYYY-MM-DD') AND TO_DATE(:hasta, 'YYYY-MM-DD')
    )
    SELECT
      NVL(LOWER(b.GENERO), 'otro') AS genero,
      COUNT(*) AS conteo
    FROM BENEFICIARIO b
    INNER JOIN atendidos a ON a.ID_BENEFICIARIO = b.ID_BENEFICIARIO
    GROUP BY NVL(LOWER(b.GENERO), 'otro')
    ORDER BY 1
  `,

  analyticsDistribucionEtapaVida: `
    WITH atendidos AS (
      SELECT DISTINCT so.ID_BENEFICIARIO
      FROM SERVICIOS_OTORGADOS so
      WHERE TRUNC(so.FECHA) BETWEEN TO_DATE(:desde, 'YYYY-MM-DD') AND TO_DATE(:hasta, 'YYYY-MM-DD')
    ),
    edades AS (
      SELECT
        TRUNC(MONTHS_BETWEEN(TRUNC(SYSDATE), i.FECHA_NACIMIENTO) / 12) AS edad
      FROM IDENTIFICADORES i
      INNER JOIN atendidos a ON a.ID_BENEFICIARIO = i.ID_BENEFICIARIO
      WHERE i.FECHA_NACIMIENTO IS NOT NULL
    )
    SELECT
      CASE
        WHEN edad BETWEEN 0 AND 12 THEN 'infancia_0_12'
        WHEN edad BETWEEN 13 AND 17 THEN 'adolescencia_13_17'
        WHEN edad BETWEEN 18 AND 59 THEN 'adultez_18_59'
        ELSE 'adulto_mayor_60_mas'
      END AS codigo,
      COUNT(*) AS conteo
    FROM edades
    GROUP BY
      CASE
        WHEN edad BETWEEN 0 AND 12 THEN 'infancia_0_12'
        WHEN edad BETWEEN 13 AND 17 THEN 'adolescencia_13_17'
        WHEN edad BETWEEN 18 AND 59 THEN 'adultez_18_59'
        ELSE 'adulto_mayor_60_mas'
      END
    ORDER BY 1
  `,

  analyticsDesgloseServiciosPorMes: `
    SELECT
      TO_CHAR(TRUNC(so.FECHA, 'MM'), 'YYYY-MM') AS mes,
      SUM(CASE WHEN UPPER(cs.NOMBRE) LIKE '%CONSULTA%' THEN 1 ELSE 0 END) AS consultas,
      SUM(CASE WHEN UPPER(cs.NOMBRE) LIKE '%TERAP%' THEN 1 ELSE 0 END) AS terapias,
      SUM(CASE WHEN UPPER(cs.NOMBRE) LIKE '%APOYO%' THEN 1 ELSE 0 END) AS apoyo_social
    FROM SERVICIOS_OTORGADOS so
    LEFT JOIN CATALOGO_SERVICIOS cs ON cs.ID_CATALOGO_SERVICIO = so.ID_CATALOGO_SERVICIO
    WHERE TRUNC(so.FECHA) BETWEEN TO_DATE(:desde, 'YYYY-MM-DD') AND TO_DATE(:hasta, 'YYYY-MM-DD')
    GROUP BY TRUNC(so.FECHA, 'MM')
    ORDER BY TRUNC(so.FECHA, 'MM')
  `,
};
