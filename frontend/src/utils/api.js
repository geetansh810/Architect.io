const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const getToken = () => localStorage.getItem('architect_token');

export const api = async (path, options = {}) => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  return res;
};
