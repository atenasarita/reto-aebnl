
/** Item de inventario dentro de un recibo */
export interface ItemInventarioRecibo {
  id_venta_inventario: number;
  id_inventario:       number;
  nombre_articulo:     string;
  cantidad:            number;
  precio_unitario:     number;
  subtotal:            number;
}

/** Información financiera del servicio */
export interface FinancieroRecibo {
  id_servicio_financiero: number;
  monto_servicio:         number;
  monto_inventario:       number;
  descuento:              number;
  cuota_total:            number;
  monto_pagado:           number;
  metodo_pago:            "efectivo" | "tarjeta" | "donacion";
}

/** Recibo completo de endpoint */
export interface ReciboCompleto {
  id_servicio_otorgado: number;
  beneficiario:         string;
  servicio:             string;
  fecha:                string;
  hora:                 string;
  items_inventario:     ItemInventarioRecibo[];
  financiero:           FinancieroRecibo | null;
}

/** Parametros del endpoint GET /api/recibos */
export interface RecibosQuery {
  fecha?: string;
}