import { describe, test, expect } from '@jest/globals';
import {
  formatPrecioMXN,
  etiquetaCategoriaDesdeApi,
  mapInventarioApiRowToTableRow,
  buildCategoriaFilterOptions,
  filterInventarioTableRows,
} from '../client/src/pages/inventario/inventarioUi.js';

describe('inventarioUi', () => {
  describe('formatPrecioMXN', () => {
    test('formatea montos numéricos en MXN', () => {
      expect(formatPrecioMXN(1234.5)).toBe('$1,234.50');
      expect(formatPrecioMXN('98765.43')).toBe('$98,765.43');
    });

    test('devuelve guion cuando el valor no es un número válido', () => {
      expect(formatPrecioMXN('abc')).toBe('—');
      expect(formatPrecioMXN(undefined)).toBe('—');
    });

    test('null se interpreta como cero', () => {
      expect(formatPrecioMXN(null)).toBe('$0.00');
    });
  });

  describe('etiquetaCategoriaDesdeApi', () => {
    test('usa DESCRIPCION_CATEGORIA cuando está presente y no está vacía', () => {
      expect(etiquetaCategoriaDesdeApi({ ID_CATEGORIA: 3, DESCRIPCION_CATEGORIA: 'Medicinas' })).toBe('Medicinas');
    });

    test('genera etiqueta de categoría cuando DESCRIPCION_CATEGORIA es nula', () => {
      expect(etiquetaCategoriaDesdeApi({ ID_CATEGORIA: 5, DESCRIPCION_CATEGORIA: null })).toBe('Categoría 5');
    });

    test('devuelve guion cuando no hay ID ni descripción', () => {
      expect(etiquetaCategoriaDesdeApi({})).toBe('—');
      expect(etiquetaCategoriaDesdeApi({ DESCRIPCION_CATEGORIA: '   ' })).toBe('—');
    });
  });

  describe('mapInventarioApiRowToTableRow', () => {
    test('transforma una fila de API en formato de tabla', () => {
      const result = mapInventarioApiRowToTableRow({
        ID_INVENTARIO: 10,
        ID_CATEGORIA: 2,
        DESCRIPCION_CATEGORIA: 'Insumos',
        NOMBRE: 'Vendas',
        CLAVE: 'VND-01',
        CANTIDAD: 120,
        UNIDAD_MEDIDA: 'pza',
        PRECIO: '100.5',
      });

      expect(result).toEqual({
        id: '10',
        id_categoria: 2,
        categoria: 'Insumos',
        nombre: 'Vendas',
        clave: 'VND-01',
        cantidad: '120 pza',
        precio: '$100.50',
      });
    });

    test('maneja valores faltantes correctamente', () => {
      const result = mapInventarioApiRowToTableRow({
        ID_INVENTARIO: 11,
        ID_CATEGORIA: null,
        NOMBRE: null,
        CLAVE: null,
        CANTIDAD: null,
        UNIDAD_MEDIDA: null,
        PRECIO: null,
      });

      expect(result).toEqual({
        id: '11',
        id_categoria: null,
        categoria: '—',
        nombre: '',
        clave: '',
        cantidad: '',
        precio: '$0.00',
      });
    });
  });

  describe('buildCategoriaFilterOptions', () => {
    test('construye opciones de filtro ordenadas por id de categoría', () => {
      const filas = [
        { id_categoria: 10, categoria: 'Insumos' },
        { id_categoria: 3, categoria: 'Medicinas' },
        { id_categoria: 10, categoria: 'Insumos' },
      ];

      expect(buildCategoriaFilterOptions(filas)).toEqual([
        { label: 'Todas las categorías', value: '' },
        { label: 'Medicinas', value: '3' },
        { label: 'Insumos', value: '10' },
      ]);
    });

    test('ignora filas sin id_categoria válido', () => {
      const filas = [
        { id_categoria: null, categoria: 'Sin categoría' },
        { id_categoria: 2, categoria: 'Otro' },
      ];

      expect(buildCategoriaFilterOptions(filas)).toEqual([
        { label: 'Todas las categorías', value: '' },
        { label: 'Otro', value: '2' },
      ]);
    });
  });

  describe('filterInventarioTableRows', () => {
    const filas = [
      { id_categoria: 1, nombre: 'Alcohol', clave: 'ALC-01', categoria: 'Limpieza' },
      { id_categoria: 2, nombre: 'Jabón', clave: 'JAB-02', categoria: 'Higiene' },
      { id_categoria: 1, nombre: 'Gel antibacterial', clave: 'GEL-03', categoria: 'Limpieza' },
    ];

    test('filtra por categoriaId cuando se proporciona', () => {
      const resultado = filterInventarioTableRows(filas, { categoriaId: '1', textoBusqueda: '' });
      expect(resultado).toEqual([
        filas[0],
        filas[2],
      ]);
    });

    test('filtra por texto de búsqueda en nombre, clave o categoria', () => {
      const resultado = filterInventarioTableRows(filas, { categoriaId: '', textoBusqueda: 'jabón' });
      expect(resultado).toEqual([filas[1]]);
    });

    test('retorna todas las filas si no hay filtro de texto ni categoría', () => {
      expect(filterInventarioTableRows(filas, { categoriaId: '', textoBusqueda: ' ' })).toEqual(filas);
    });
  });
});
