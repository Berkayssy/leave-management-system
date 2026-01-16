const API_URL = 'https://leave-management-system-production-5115.up.railway.app/api/v1';

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