const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const getToken = () => localStorage.getItem('architect_token');

export const api = async (path, options = {}) => {
  const token = getToken();
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    // Auto-logout on server errors (new code breaks) or auth errors
    if (res.status === 401 || res.status >= 500) {
      window.dispatchEvent(new Event('system-error-logout'));
    }

    return res;
  } catch (error) {
    // Also auto-logout on network/system failures
    window.dispatchEvent(new Event('system-error-logout'));
    throw error;
  }
};
