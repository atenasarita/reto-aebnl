import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
jest.unmock('../client/src/utils/dateTime.js');
const { todayDate, nowLocalDateTime } = await import('../client/src/utils/dateTime.js');

describe('dateTime', () => {
  describe('nowLocalDateTime', () => {
    test('devuelve la fecha y hora actual en formato ISO con hora local', () => {
      const result = nowLocalDateTime();

      // Formato esperado: YYYY-MM-DDTHH:MM:SS
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    });

    test('incluye ano, mes, dia, horas, minutos y segundos con padding de dos digitos', () => {
      const result = nowLocalDateTime();
      const parts = result.split('T');
      const datePart = parts[0];
      const timePart = parts[1];

      const [year, month, day] = datePart.split('-');
      const [hours, minutes, seconds] = timePart.split(':');

      expect(year).toHaveLength(4);
      expect(month).toHaveLength(2);
      expect(day).toHaveLength(2);
      expect(hours).toHaveLength(2);
      expect(minutes).toHaveLength(2);
      expect(seconds).toHaveLength(2);
    });

    test('devuelve la hora y fecha actual (no una fecha fija)', () => {
      const time1 = nowLocalDateTime();
      
      // Espera un momento
      const now = new Date();
      const expectedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const [resultDate] = time1.split('T');

      expect(resultDate).toBe(expectedDate);
    });
  });

  describe('todayDate', () => {
    test('devuelve la fecha actual en formato YYYY-MM-DD', () => {
      const result = todayDate();

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('devuelve la fecha actual (no una fecha fija)', () => {
      const result = todayDate();
      const now = new Date();
      const expectedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      expect(result).toBe(expectedDate);
    });

    test('los digitos estan padding a dos caracteres', () => {
      const result = todayDate();
      const parts = result.split('-');

      expect(parts[0]).toHaveLength(4); // year
      expect(parts[1]).toHaveLength(2); // month
      expect(parts[2]).toHaveLength(2); // day
    });
  });
});
