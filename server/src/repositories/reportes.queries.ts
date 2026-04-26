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

  analyticsTotalesBeneficiarios: `
    SELECT
      (SELECT COUNT(*) FROM BENEFICIARIO WHERE LOWER(ESTADO) = 'activo') AS activos,
      (SELECT COUNT(*) FROM BENEFICIARIO WHERE LOWER(ESTADO) = 'inactivo') AS inactivos,
      (SELECT COUNT(*) FROM BENEFICIARIO) AS total
    FROM DUAL
  `,

  analyticsDistribucionBeneficiariosEstado: `
    SELECT
      NVL(LOWER(b.ESTADO), 'sin_estado') AS estado,
      COUNT(*) AS conteo
    FROM BENEFICIARIO b
    GROUP BY NVL(LOWER(b.ESTADO), 'sin_estado')
    ORDER BY 1
  `,

  analyticsBeneficiariosPorTipoEspina: `
    SELECT
      eb.ID_ESPINA AS id_espina,
      eb.NOMBRE AS nombre,
      COUNT(DISTINCT be.ID_BENEFICIARIO) AS conteo
    FROM ESPINA_BIFIDA eb
    LEFT JOIN BENEFICIARIO_ESPINA be ON be.ID_ESPINA = eb.ID_ESPINA
    GROUP BY eb.ID_ESPINA, eb.NOMBRE
    ORDER BY eb.ID_ESPINA
  `,

  allTimesDistribucionGenero: `
    SELECT
      NVL(LOWER(b.GENERO), 'otro') AS genero,
      COUNT(*) AS conteo
    FROM BENEFICIARIO b
    GROUP BY NVL(LOWER(b.GENERO), 'otro')
    ORDER BY 1
  `,

  allTimesDistribucionEtapaVida: `
    WITH edades AS (
      SELECT
        TRUNC(MONTHS_BETWEEN(TRUNC(SYSDATE), i.FECHA_NACIMIENTO) / 12) AS edad
      FROM IDENTIFICADORES i
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

  rangoDistribucionBeneficiariosEstado: `
    WITH atendidos AS (
      SELECT DISTINCT so.ID_BENEFICIARIO
      FROM SERVICIOS_OTORGADOS so
      WHERE TRUNC(so.FECHA) BETWEEN TO_DATE(:desde, 'YYYY-MM-DD') AND TO_DATE(:hasta, 'YYYY-MM-DD')
    )
    SELECT
      NVL(LOWER(b.ESTADO), 'sin_estado') AS estado,
      COUNT(*) AS conteo
    FROM BENEFICIARIO b
    INNER JOIN atendidos a ON a.ID_BENEFICIARIO = b.ID_BENEFICIARIO
    GROUP BY NVL(LOWER(b.ESTADO), 'sin_estado')
    ORDER BY 1
  `,

  rangoBeneficiariosPorTipoEspina: `
    WITH atendidos AS (
      SELECT DISTINCT so.ID_BENEFICIARIO
      FROM SERVICIOS_OTORGADOS so
      WHERE TRUNC(so.FECHA) BETWEEN TO_DATE(:desde, 'YYYY-MM-DD') AND TO_DATE(:hasta, 'YYYY-MM-DD')
    )
    SELECT
      eb.ID_ESPINA AS id_espina,
      eb.NOMBRE AS nombre,
      COUNT(DISTINCT be.ID_BENEFICIARIO) AS conteo
    FROM ESPINA_BIFIDA eb
    LEFT JOIN BENEFICIARIO_ESPINA be ON be.ID_ESPINA = eb.ID_ESPINA
    INNER JOIN atendidos a ON a.ID_BENEFICIARIO = be.ID_BENEFICIARIO
    GROUP BY eb.ID_ESPINA, eb.NOMBRE
    ORDER BY eb.ID_ESPINA
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
};
