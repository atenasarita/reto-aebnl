import oracledb from 'oracledb';
import { OracleConnection } from '../db/oracle';
import {
  SELECT_TIPOS_SERVICIO,
  INSERT_SERVICIO_OTORGADO,
  INSERT_VENTA_INVENTARIO,
  INSERT_SERVICIO_FINANCIERO,
  SELECT_CANTIDAD_INVENTARIO,
  UPDATE_CANTIDAD_INVENTARIO,
  INSERT_MOVIMIENTO_INVENTARIO,
} from './servicios.queries';

type TipoServicioRow = {
  ID_CATALOGO_SERVICIO: number;
  NOMBRE: string;
  CATEGORIA: string;
  PRECIO: number;
};

type InsumoInput = {
  id: number;
  cantidad: number;
  precio: number;
};

type RegistrarServicioInput = {
  id_beneficiario: number;
  id_catalogo_servicio: number;
  fecha: string;
  hora: string;
  id_cita?: number | null;
  cantidad: number;
  notas?: string;
  insumos: InsumoInput[];
  monto_servicio: number;
  monto_inventario: number;
  descuento: number;
  cuota_total: number;
  monto_pagado: number;
  metodo_pago: string;
  ya_aporto: boolean;
  id_usuario: number; // 👈 necesario para MOVIMIENTOS_INVENTARIO
};

type CantidadRow = {
  CANTIDAD: number;
};

export class ServicioRepository {
  private readonly oracleConnection: OracleConnection;

  constructor(oracleConnection: OracleConnection = new OracleConnection()) {
    this.oracleConnection = oracleConnection;
  }

  async getTiposServicio() {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await this.oracleConnection.getConnection();

      const result = await connection.execute(
        SELECT_TIPOS_SERVICIO,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const rows = (result.rows ?? []) as TipoServicioRow[];

      return rows.map((row) => ({
        id: row.ID_CATALOGO_SERVICIO,
        nombre: row.NOMBRE,
        categoria: row.CATEGORIA,
        precio: row.PRECIO,
      }));

    } finally {
      if (connection) await connection.close();
    }
  }

  async registrarServicio(input: RegistrarServicioInput) {
    console.log("INPUT COMPLETO:");
    console.log(JSON.stringify(input, null, 2));

    let connection: oracledb.Connection | undefined;

    try {
      connection = await this.oracleConnection.getConnection();

      // ── 1. Insertar servicio otorgado ──────────────────────────────
      const resultServicio = await connection.execute(
        INSERT_SERVICIO_OTORGADO,
        {
          id_beneficiario:      input.id_beneficiario,
          id_catalogo_servicio: input.id_catalogo_servicio,
          fecha:                input.fecha,
          hora:                 input.hora || '00:00',
          id_cita:              input.id_cita ?? null,
          cantidad:             input.cantidad,
          notas:                input.notas ?? null,
          id_servicio_otorgado: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        }
      );

      const outBinds = resultServicio.outBinds as { id_servicio_otorgado: number[] };
      const idServicio = outBinds.id_servicio_otorgado[0];

      // ── 2. Insumos: venta + descuento inventario + movimiento ──────
      for (const insumo of input.insumos) {

        // 2a. Registrar en VENTA_INVENTARIO
        await connection.execute(
          INSERT_VENTA_INVENTARIO,
          {
            id_servicio_otorgado: idServicio,
            id_inventario:        insumo.id,
            cantidad:             insumo.cantidad,
            precio_unitario:      insumo.precio,
            subtotal:             insumo.precio * insumo.cantidad,
          }
        );

        // 2b. Leer cantidad actual (dentro de la misma transacción)
        const resultCantidad = await connection.execute(
          SELECT_CANTIDAD_INVENTARIO,
          { id_inventario: insumo.id },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const rows = resultCantidad.rows as CantidadRow[];

        if (!rows || rows.length === 0) {
          throw new Error(`Insumo ID ${insumo.id} no encontrado en inventario`);
        }

        const cantAnterior = rows[0].CANTIDAD;
        const cantNueva    = cantAnterior - insumo.cantidad;

        if (cantNueva < 0) {
          throw new Error(
            `Stock insuficiente para insumo ID ${insumo.id}. ` +
            `Disponible: ${cantAnterior}, solicitado: ${insumo.cantidad}`
          );
        }

        // 2c. Descontar del inventario
        await connection.execute(
          UPDATE_CANTIDAD_INVENTARIO,
          { cantidad: insumo.cantidad, id_inventario: insumo.id }
        );

        // 2d. Registrar movimiento de salida
        await connection.execute(
          INSERT_MOVIMIENTO_INVENTARIO,
          {
            id_inventario:        insumo.id,
            cantidad:             insumo.cantidad,
            cant_anterior:        cantAnterior,
            cant_nueva:           cantNueva,
            id_servicio_otorgado: idServicio,
            id_usuario:           input.id_usuario,
          }
        );
      }

      // ── 3. Insertar registro financiero ────────────────────────────
      await connection.execute(
        INSERT_SERVICIO_FINANCIERO,
        {
          id_servicio_otorgado: idServicio,
          monto_servicio:       input.monto_servicio,
          monto_inventario:     input.monto_inventario,
          descuento:            input.descuento || 0,
          cuota_total:          input.cuota_total,
          monto_pagado:         input.monto_pagado,
          metodo_pago:          input.metodo_pago,
          ya_aporto:            input.ya_aporto ? 1 : 0,
        }
      );

      await connection.commit();
      return { ok: true, id_servicio_otorgado: idServicio };

    } catch (err) {
      if (connection) await connection.rollback();
      throw err;
    } finally {
      if (connection) await connection.close();
    }
  }
}