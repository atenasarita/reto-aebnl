import oracledb from 'oracledb';
import { OracleConnection } from '../db/oracle';
import { FondoDonacionesRepository } from './fondoDonaciones.repository';
import {
  SELECT_TIPOS_SERVICIO,
  INSERT_SERVICIO_OTORGADO,
  INSERT_VENTA_INVENTARIO,
  INSERT_SERVICIO_FINANCIERO,
  SELECT_CANTIDAD_INVENTARIO,
  UPDATE_CANTIDAD_INVENTARIO,
  INSERT_MOVIMIENTO_INVENTARIO,
  SELECT_FECHAS_ULTIMOS_ESTUDIOS_BY_BENEFICIARIO,
  SELECT_HISTORIAL_SERVICIOS,
  SELECT_CATEGORIAS_CATALOGO,
  INSERT_CATALOGO_SERVICIO
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
  monto_donacion: number;
  id_fondo?: number | null;
  id_donador?: number | null;
  metodo_pago: string;
  ya_aporto: boolean;
  id_usuario: number; 
};

type CantidadRow = {
  CANTIDAD: number;
};

type FechasUltimosEstudiosRow = {
  ID_BENEFICIARIO: number;
  GRAL_ORINA: Date | null;
  ECO_RENAL: Date | null;
  UROTAC: Date | null;
  EST_URODINAMICO: Date | null;
  TAC_CEREBRO: Date | null;
  UROCULTIVO: Date | null;
};

type HistorialRow = {
  ID_SERVICIO_OTORGADO: number;
  BENEFICIARIO:         string;
  SERVICIO:             string;
  CATEGORIA:            string;
  FECHA:                string;
  HORA:                 string;
  MONTO_SERVICIO:       number | null;
  MONTO_INVENTARIO:     number | null;
  DESCUENTO:            number | null;
  CUOTA_TOTAL:          number | null;
  MONTO_PAGADO:         number | null;
  METODO_PAGO:          string | null;
  YA_APORTO:            number | null;
  MONTO_DONACION:       number | null;
};

type MetodoPagoServicioOracle = 'efectivo' | 'tarjeta' | 'donacion';

type CategoriaRow = { CATEGORIA: string };
 
type CrearServicioInput = {
  nombre:    string;
  categoria: string;
  precio:    number;
};

function metodoPagoParaOracle(raw: string): MetodoPagoServicioOracle {
  const s = String(raw ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');

  if (s.includes('tarjeta')) return 'tarjeta';
  if (s === 'efectivo') return 'efectivo';
  if (s === 'transferencia') return 'donacion';
  if (s === 'cheque') return 'donacion';
  if (s === 'donacion') return 'donacion';
  return 'efectivo';
}

export class ServicioRepository {
  private readonly oracleConnection: OracleConnection;
  private readonly fondoRepository: FondoDonacionesRepository;

  constructor(
    oracleConnection: OracleConnection = new OracleConnection(),
    fondoRepository: FondoDonacionesRepository = new FondoDonacionesRepository()
  ) {
    this.oracleConnection = oracleConnection;
    this.fondoRepository = fondoRepository;
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

  async getFechasUltimosEstudios(id_beneficiario: number){
    let connection: oracledb.Connection | undefined;

    try {
      connection = await this.oracleConnection.getConnection();

      const result = await connection.execute(
        SELECT_FECHAS_ULTIMOS_ESTUDIOS_BY_BENEFICIARIO,
        {id_beneficiario},
        {outFormat: oracledb.OUT_FORMAT_OBJECT}
      );

      const rows = (result.rows ?? []) as FechasUltimosEstudiosRow[];

      if(rows.length === 0){
        return {
          idBeneficiario: id_beneficiario,
          controlUrologico: null,
          ecoRenal: null,
          uroTac: null,
          estUrodinamico: null,
          tacCerebro: null,
          urocultivo: null,
        };
      }
      const row = rows[0];

      return {
        idBeneficiario: row.ID_BENEFICIARIO,
        gralOrina: row.GRAL_ORINA,
        ecoRenal: row.ECO_RENAL,
        uroTac: row.UROTAC,
        estUrodinamico: row.EST_URODINAMICO,
        tacCerebro: row.TAC_CEREBRO,
        urocultivo: row.UROCULTIVO,
      };

    } finally {
      if(connection) await connection.close();
    }
  }

  async registrarServicio(input: RegistrarServicioInput) {

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

      const montoDonacion = input.monto_donacion || 0;

      if (montoDonacion > 0) {
        if (!input.id_fondo || !input.id_donador) {
          throw new Error('Debe seleccionar el fondo de donación a utilizar.');
        }

        await this.fondoRepository.registrarEgresoEnTransaccion(connection, {
          monto: montoDonacion,
          id_fondo: input.id_fondo,
          id_donador: input.id_donador,
          id_servicio_otorgado: idServicio,
          id_usuario: input.id_usuario,
          motivo: 'Pago de servicio con fondo de donaciones',
        });
      }

      await connection.execute(
        INSERT_SERVICIO_FINANCIERO,
        {
          id_servicio_otorgado: idServicio,
          monto_servicio:       input.monto_servicio,
          monto_inventario:     input.monto_inventario,
          descuento:            input.descuento || 0,
          cuota_total:          input.cuota_total,
          monto_pagado:         input.monto_pagado,
          monto_donacion:       montoDonacion,
          metodo_pago:          metodoPagoParaOracle(input.metodo_pago),
          ya_aporto:            input.ya_aporto ? 1 : 0,
          id_donador:           montoDonacion > 0 ? input.id_donador : null,
          id_fondo:             montoDonacion > 0 ? input.id_fondo : null,
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

  async getHistorial(limit: number = 20, page: number = 0) {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await this.oracleConnection.getConnection();

      const offset = page * limit;

      const result = await connection.execute(
        SELECT_HISTORIAL_SERVICIOS,
        { limit, offset },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const rows = (result.rows ?? []) as HistorialRow[];

      return {
        data: rows.map((row) => ({
          id:              row.ID_SERVICIO_OTORGADO,
          beneficiario:    row.BENEFICIARIO?.trim() ?? '',
          nombre:          row.SERVICIO,
          categoria:       row.CATEGORIA,
          fecha:           row.FECHA,
          hora:            row.HORA,
          montoServicio:   row.MONTO_SERVICIO   ?? null,
          montoInventario: row.MONTO_INVENTARIO ?? null,
          descuento:       row.DESCUENTO        ?? null,
          cuotaTotal:      row.CUOTA_TOTAL      ?? null,
          montoPagado:     row.MONTO_PAGADO     ?? null,
          metodoPago:      row.METODO_PAGO      ?? null,
          yaAporto:        row.YA_APORTO        ?? null,
          montoDonacion:   row.MONTO_DONACION   ?? null,
        })),
        hasMore: rows.length === limit,
        page,
        limit,
      };

    } finally {
      if (connection) await connection.close();
    }
  }

  async getCategorias() {
    let connection: oracledb.Connection | undefined;
    try {
      connection = await this.oracleConnection.getConnection();
      const result = await connection.execute(
        SELECT_CATEGORIAS_CATALOGO,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const rows = (result.rows ?? []) as CategoriaRow[];
      return rows.map((r) => r.CATEGORIA);
    } finally {
      if (connection) await connection.close();
    }
  }
  
  async crearServicioCatalogo(input: CrearServicioInput) {
    let connection: oracledb.Connection | undefined;
    try {
      connection = await this.oracleConnection.getConnection();
      const result = await connection.execute(
        INSERT_CATALOGO_SERVICIO,
        {
          nombre:               input.nombre.trim(),
          categoria:            input.categoria.trim(),
          precio:               input.precio,
          id_catalogo_servicio: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        }
      );
      const outBinds = result.outBinds as { id_catalogo_servicio: number[] };
      await connection.commit();
      return { id: outBinds.id_catalogo_servicio[0] };
    } catch (err) {
      if (connection) await connection.rollback();
      throw err;
    } finally {
      if (connection) await connection.close();
    }
  }
}

