const API_BASE_URL = 'http://localhost:3000/api';

// Helper for authenticated TaxNova API requests.
export async function authenticatedFetch(path, options = {}) {
  const token = localStorage.getItem('taxnova_token');
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) }
  });
  if (response.status === 401) {
    localStorage.removeItem('taxnova_token');
    localStorage.removeItem('taxnova_user');
  }
  return response;
}
