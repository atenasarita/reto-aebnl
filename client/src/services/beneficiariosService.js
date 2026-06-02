<<<<<<< HEAD
import { API_URL } from '../utils/config'
=======
const API_URL = import.meta.env.VITE_API_URL;
>>>>>>> 05eb4c4 (vite.url)

export async function fetchSiguienteFolio(token) {
  const response = await fetch(`${API_URL}/api/beneficiarios/siguiente-folio`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || JSON.stringify(data));
  }

  return data.folio;
}

export async function createBeneficiario(payload, token) {
  const response = await fetch(`${API_URL}/api/beneficiarios`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.details?.fieldErrors
        ? JSON.stringify(data.details.fieldErrors)
        : data.message || 'Error al registrar beneficiario'
    );
  }

  return data;
}

export async function fetchPadresBeneficiario(idBeneficiario, token) {
  const response = await fetch(`${API_URL}/api/beneficiarios/${idBeneficiario}/padres`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al obtener historia de los padres');
  }

  return data;
}

export async function updateBeneficiario(idBeneficiario, payload, token) {
  const response = await fetch(`${API_URL}/api/beneficiarios/${idBeneficiario}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al actualizar beneficiario');
  }

  return data;
}