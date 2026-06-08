/**
 * @jest-environment node
 */

/// <reference types="jest" />

import * as queries from '../../server/src/repositories/beneficiario.queries.ts';
const {
  SELECT_BENEFICIARIO_DETALLE_BASE,
  SELECT_BENEFICIARIOS_WITH_MEMBRESIAS_ENDING_SOON,
  SELECT_BENEFICIARIO_BY_ID,
  SELECT_PADRES_BY_BENEFICIARIO_ID,
  selectTipoEspinasByBeneficiarioIds,
  INSERT_BENEFICIARIO,
  UPDATE_MEMBRESIA_ESTADO,
} = queries;


describe('beneficiariosQueries', () => {
  test('SELECT_BENEFICIARIO_DETALLE_BASE contiene joins principales', () => {
    expect(SELECT_BENEFICIARIO_DETALLE_BASE).toContain('FROM Beneficiario b');
    expect(SELECT_BENEFICIARIO_DETALLE_BASE).toContain('LEFT JOIN Membresias m');
    expect(SELECT_BENEFICIARIO_DETALLE_BASE).toContain('LEFT JOIN Identificadores i');
    expect(SELECT_BENEFICIARIO_DETALLE_BASE).toContain('LEFT JOIN Datos_medicos dm');
    expect(SELECT_BENEFICIARIO_DETALLE_BASE).toContain('LEFT JOIN Direccion d');
  });

  test('SELECT_BENEFICIARIO_BY_ID filtra por id_beneficiario', () => {
    expect(SELECT_BENEFICIARIO_BY_ID).toContain('WHERE b.id_beneficiario = :id_beneficiario');
  });

  test('SELECT_BENEFICIARIOS_WITH_MEMBRESIAS_ENDING_SOON filtra membresías activas próximas a vencer', () => {
    expect(SELECT_BENEFICIARIOS_WITH_MEMBRESIAS_ENDING_SOON).toContain("m.estado = 'activa'");
    expect(SELECT_BENEFICIARIOS_WITH_MEMBRESIAS_ENDING_SOON).toContain('m.fecha_fin BETWEEN SYSDATE AND SYSDATE + 7');
  });

  test('SELECT_PADRES_BY_BENEFICIARIO_ID filtra padres por beneficiario', () => {
    expect(SELECT_PADRES_BY_BENEFICIARIO_ID).toContain('FROM Padres p');
    expect(SELECT_PADRES_BY_BENEFICIARIO_ID).toContain('INNER JOIN Datos_medicos dm');
    expect(SELECT_PADRES_BY_BENEFICIARIO_ID).toContain('WHERE dm.id_beneficiario = :id_beneficiario');
  });

  test('selectTipoEspinasByBeneficiarioIds inserta placeholders en IN', () => {
    const sql = selectTipoEspinasByBeneficiarioIds(':id0, :id1, :id2');

    expect(sql).toContain('FROM Beneficiario_espina be');
    expect(sql).toContain('INNER JOIN Espina_bifida eb');
    expect(sql).toContain('WHERE be.id_beneficiario IN (:id0, :id1, :id2)');
    expect(sql).toContain('ORDER BY be.id_beneficiario, be.id_espina');
  });

  test('INSERT_BENEFICIARIO usa RETURNING id_beneficiario', () => {
    expect(INSERT_BENEFICIARIO).toContain('INSERT INTO Beneficiario');
    expect(INSERT_BENEFICIARIO).toContain('RETURNING id_beneficiario INTO :id_beneficiario');
  });

  test('UPDATE_MEMBRESIA_ESTADO vence membresías activas anteriores a hoy', () => {
    expect(UPDATE_MEMBRESIA_ESTADO).toContain("SET estado = 'vencida'");
    expect(UPDATE_MEMBRESIA_ESTADO).toContain("WHERE estado = 'activa'");
    expect(UPDATE_MEMBRESIA_ESTADO).toContain('fecha_fin < TRUNC(SYSDATE)');
  });
});