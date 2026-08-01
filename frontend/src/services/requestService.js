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


// Get a single request by its ID
export async function getRequestById(requestId, token) {
  const response = await fetch(`${API_URL}/requests/${requestId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erreur lors du chargement de la demande');
  }

  return data;
}

// Update an existing request
export async function updateRequest(requestId, requestData, token) {
  const response = await fetch(`${API_URL}/requests/${requestId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(requestData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erreur lors de la mise à jour de la demande');
  }

  return data;
}

// === BLOCK: DELETE A REQUEST — START === //
export async function deleteRequest(requestId, token) {
  const response = await fetch(`${API_URL}/requests/${requestId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erreur lors de la suppression de la demande');
  }

  return data;
}
// === BLOCK: DELETE A REQUEST — END === //
// === BLOCK: RESTORE A DELETED REQUEST — START === //
export async function restoreRequest(requestId, token) {
  const response = await fetch(`${API_URL}/requests/${requestId}/restore`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erreur lors de la restauration de la demande');
  }

  return data;
}
// === BLOCK: RESTORE A DELETED REQUEST — END === //