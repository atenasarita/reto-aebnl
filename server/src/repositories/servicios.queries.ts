export const SELECT_TIPOS_SERVICIO = `
    SELECT id_catalogo_servicio, nombre, categoria, precio
    FROM catalogo_servicios
    ORDER BY categoria, nombre
`;

export const INSERT_SERVICIO_OTORGADO = `
  INSERT INTO SERVICIOS_OTORGADOS 
    (ID_BENEFICIARIO, ID_CATALOGO_SERVICIO, FECHA, HORA, ID_CITA, CANTIDAD, NOTAS)
  VALUES 
    (:id_beneficiario, :id_catalogo_servicio, TO_DATE(:fecha, 'YYYY-MM-DD'), :hora, :id_cita, :cantidad, :notas)
  RETURNING ID_SERVICIO_OTORGADO INTO :id_servicio_otorgado
`;

export const INSERT_VENTA_INVENTARIO = `
  INSERT INTO VENTA_INVENTARIO 
    (ID_SERVICIO_OTORGADO, ID_INVENTARIO, CANTIDAD, PRECIO_UNITARIO, SUBTOTAL)
  VALUES 
    (:id_servicio_otorgado, :id_inventario, :cantidad, :precio_unitario, :subtotal)
`;

export const INSERT_SERVICIO_FINANCIERO = `
  INSERT INTO SERVICIOS_FINANCIEROS 
    (ID_SERVICIO_OTORGADO, MONTO_SERVICIO, MONTO_INVENTARIO, DESCUENTO, CUOTA_TOTAL, MONTO_PAGADO, METODO_PAGO, YA_APORTO)
  VALUES 
    (:id_servicio_otorgado, :monto_servicio, :monto_inventario, :descuento, :cuota_total, :monto_pagado, :metodo_pago, :ya_aporto)
`;

export const SELECT_CANTIDAD_INVENTARIO = `
  SELECT CANTIDAD
  FROM INVENTARIO
  WHERE ID_INVENTARIO = :id_inventario
`;

export const UPDATE_CANTIDAD_INVENTARIO = `
  UPDATE INVENTARIO
  SET CANTIDAD = CANTIDAD - :cantidad
  WHERE ID_INVENTARIO = :id_inventario
`;

export const INSERT_MOVIMIENTO_INVENTARIO = `
  INSERT INTO MOVIMIENTOS_INVENTARIO
    (ID_INVENTARIO, TIPO_MOVIMIENTO, CANTIDAD, FECHA, CANT_ANTERIOR, CANT_NUEVA, ID_SERVICIO_OTORGADO, ID_USUARIO, MOTIVO)
  VALUES
    (:id_inventario, 'salida', :cantidad, SYSDATE, :cant_anterior, :cant_nueva, :id_servicio_otorgado, :id_usuario, 'Venta Cliente')
`;
