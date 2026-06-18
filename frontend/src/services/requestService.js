const API_URL = 'http://localhost:3000/api';

// Create a new service request
export async function createRequest(requestData, token) {
  const response = await fetch(`${API_URL}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(requestData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erreur lors de la création de la demande');
  }

  return data;
}

// Get all requests belonging to the logged-in user
export async function getMyRequests(token) {
  const response = await fetch(`${API_URL}/requests`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erreur lors du chargement des demandes');
  }

  return data;
}

// Get the list of available service types (for the dropdown)
export async function getServiceTypes(token) {
  const response = await fetch(`${API_URL}/service-types`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erreur lors du chargement des types de service');
  }

  return data;
}
