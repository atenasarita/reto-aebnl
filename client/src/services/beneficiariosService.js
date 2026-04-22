const API_URL = 'http://localhost:3000/api/beneficiarios';

export async function fetchSiguienteFolio(token) {
  const response = await fetch(`${API_URL}/siguiente-folio`, {
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
  const response = await fetch(API_URL, {
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