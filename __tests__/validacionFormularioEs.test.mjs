/**
 * @jest-environment jsdom
 */

import { jest, describe, test, expect } from '@jest/globals';

const {
  mensajeValidacionNativa,
  onInvalidCampoEspanol,
  onInputLimpiarValidacion,
  propsFormularioValidacionEs,
} = await import('../client/src/utils/validacionFormularioEs.js');

// ---------------------------------------------------------------------------
// Helper — builds a plain object shaped like an HTMLInputElement validity state.
// mensajeValidacionNativa only reads properties; no instanceof check needed.
// ---------------------------------------------------------------------------
function fakeInput(validity, extras = {}) {
  return {
    tagName: 'INPUT',
    validity: {
      valueMissing: false,
      rangeUnderflow: false,
      rangeOverflow: false,
      stepMismatch: false,
      typeMismatch: false,
      patternMismatch: false,
      tooLong: false,
      tooShort: false,
      ...validity,
    },
    min: '',
    max: '',
    maxLength: -1,
    minLength: -1,
    ...extras,
  };
}

// ---------------------------------------------------------------------------
// mensajeValidacionNativa
// ---------------------------------------------------------------------------

describe('mensajeValidacionNativa', () => {
  describe('valueMissing', () => {
    test('retorna "Completa este campo." para input', () => {
      expect(mensajeValidacionNativa(fakeInput({ valueMissing: true }))).toBe(
        'Completa este campo.'
      );
    });

    test('retorna "Completa este campo." para textarea', () => {
      expect(
        mensajeValidacionNativa(fakeInput({ valueMissing: true }, { tagName: 'TEXTAREA' }))
      ).toBe('Completa este campo.');
    });

    test('retorna "Selecciona una opción." para select', () => {
      expect(
        mensajeValidacionNativa(fakeInput({ valueMissing: true }, { tagName: 'SELECT' }))
      ).toBe('Selecciona una opción.');
    });
  });

  describe('rangeUnderflow', () => {
    test('incluye el valor min cuando está definido', () => {
      expect(
        mensajeValidacionNativa(fakeInput({ rangeUnderflow: true }, { min: '10' }))
      ).toBe('El valor debe ser mayor o igual a 10.');
    });

    test('usa 0 cuando min está vacío', () => {
      expect(
        mensajeValidacionNativa(fakeInput({ rangeUnderflow: true }, { min: '' }))
      ).toBe('El valor debe ser mayor o igual a 0.');
    });
  });

  describe('rangeOverflow', () => {
    test('incluye el valor max cuando está definido', () => {
      expect(
        mensajeValidacionNativa(fakeInput({ rangeOverflow: true }, { max: '100' }))
      ).toBe('El valor debe ser menor o igual a 100.');
    });

    test('retorna mensaje genérico cuando max está vacío', () => {
      expect(
        mensajeValidacionNativa(fakeInput({ rangeOverflow: true }, { max: '' }))
      ).toBe('El valor es demasiado alto.');
    });
  });

  test('stepMismatch retorna mensaje de número válido', () => {
    expect(mensajeValidacionNativa(fakeInput({ stepMismatch: true }))).toBe(
      'Introduce un número válido.'
    );
  });

  test('typeMismatch retorna mensaje de formato inválido', () => {
    expect(mensajeValidacionNativa(fakeInput({ typeMismatch: true }))).toBe(
      'El formato no es válido.'
    );
  });

  test('patternMismatch retorna mensaje de formato inválido', () => {
    expect(mensajeValidacionNativa(fakeInput({ patternMismatch: true }))).toBe(
      'El formato no es válido.'
    );
  });

  describe('longitud', () => {
    test('tooLong retorna mensaje con maxLength', () => {
      expect(
        mensajeValidacionNativa(fakeInput({ tooLong: true }, { maxLength: 20 }))
      ).toBe('Máximo 20 caracteres.');
    });

    test('tooShort retorna mensaje con minLength', () => {
      expect(
        mensajeValidacionNativa(fakeInput({ tooShort: true }, { minLength: 5 }))
      ).toBe('Mínimo 5 caracteres.');
    });

    test('tooLong con maxLength <= 0 cae al fallback', () => {
      expect(
        mensajeValidacionNativa(fakeInput({ tooLong: true }, { maxLength: -1 }))
      ).toBe('Valor no válido.');
    });

    test('tooShort con minLength = 0 cae al fallback', () => {
      expect(
        mensajeValidacionNativa(fakeInput({ tooShort: true }, { minLength: 0 }))
      ).toBe('Valor no válido.');
    });
  });

  test('retorna "Valor no válido." como fallback cuando no hay error conocido', () => {
    expect(mensajeValidacionNativa(fakeInput({}))).toBe('Valor no válido.');
  });
});

// ---------------------------------------------------------------------------
// onInvalidCampoEspanol
// Uses real DOM elements so instanceof checks inside isValidatableElement pass.
// ---------------------------------------------------------------------------

describe('onInvalidCampoEspanol', () => {
  test('llama a setCustomValidity con el mensaje en un input requerido vacío', () => {
    const input = document.createElement('input');
    input.required = true;
    const spy = jest.spyOn(input, 'setCustomValidity');
    onInvalidCampoEspanol({ target: input });
    expect(spy).toHaveBeenCalledWith('Completa este campo.');
  });

  test('llama a setCustomValidity con "Selecciona una opción." en un select requerido', () => {
    const select = document.createElement('select');
    select.required = true;
    const spy = jest.spyOn(select, 'setCustomValidity');
    onInvalidCampoEspanol({ target: select });
    expect(spy).toHaveBeenCalledWith('Selecciona una opción.');
  });

  test('llama a setCustomValidity en un textarea requerido vacío', () => {
    const textarea = document.createElement('textarea');
    textarea.required = true;
    const spy = jest.spyOn(textarea, 'setCustomValidity');
    onInvalidCampoEspanol({ target: textarea });
    expect(spy).toHaveBeenCalledWith('Completa este campo.');
  });

  test('no hace nada si el target no es un elemento validable', () => {
    const div = document.createElement('div');
    expect(() => onInvalidCampoEspanol({ target: div })).not.toThrow();
  });

  test('no hace nada si el target es null', () => {
    expect(() => onInvalidCampoEspanol({ target: null })).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// onInputLimpiarValidacion
// ---------------------------------------------------------------------------

describe('onInputLimpiarValidacion', () => {
  test('llama a setCustomValidity("") en un input', () => {
    const input = document.createElement('input');
    input.setCustomValidity('error previo');
    const spy = jest.spyOn(input, 'setCustomValidity');
    onInputLimpiarValidacion({ target: input });
    expect(spy).toHaveBeenCalledWith('');
  });

  test('llama a setCustomValidity("") en un select', () => {
    const select = document.createElement('select');
    const spy = jest.spyOn(select, 'setCustomValidity');
    onInputLimpiarValidacion({ target: select });
    expect(spy).toHaveBeenCalledWith('');
  });

  test('llama a setCustomValidity("") en un textarea', () => {
    const textarea = document.createElement('textarea');
    const spy = jest.spyOn(textarea, 'setCustomValidity');
    onInputLimpiarValidacion({ target: textarea });
    expect(spy).toHaveBeenCalledWith('');
  });

  test('no hace nada si el target no es un elemento validable', () => {
    const div = document.createElement('div');
    expect(() => onInputLimpiarValidacion({ target: div })).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// propsFormularioValidacionEs
// ---------------------------------------------------------------------------

describe('propsFormularioValidacionEs', () => {
  test('tiene lang = "es"', () => {
    expect(propsFormularioValidacionEs.lang).toBe('es');
  });

  test('onInvalidCapture apunta a onInvalidCampoEspanol', () => {
    expect(propsFormularioValidacionEs.onInvalidCapture).toBe(onInvalidCampoEspanol);
  });

  test('onInputCapture apunta a onInputLimpiarValidacion', () => {
    expect(propsFormularioValidacionEs.onInputCapture).toBe(onInputLimpiarValidacion);
  });
});
