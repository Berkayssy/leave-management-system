// frontend/lib/api.js
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api/v1';

export const api = {
  request: async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expired
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
      throw new Error('Unauthorized');
    }

    return response;
  },

  get: (endpoint) => api.request(endpoint),
  
  post: (endpoint, data) => 
    api.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
  }),
  
  patch: (endpoint, data) => 
    api.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
  }),
  delete: (endpoint, data) => 
    api.request(endpoint, {
      method: 'DELETE'
  }),
};