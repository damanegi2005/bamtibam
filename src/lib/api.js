const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
<<<<<<< HEAD
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }
  const contentType = res.headers.get('content-type') || '';
  return contentType.includes('application/json') ? res.json() : res.text();
=======
    credentials: 'include'
  });
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    let payload = null;
    if (isJson) {
      payload = await res.json().catch(() => null);
      if (payload?.message) message = payload.message;
    } else {
      const text = await res.text().catch(() => '');
      if (text) message = text;
    }
    const error = new Error(message);
    error.status = res.status;
    if (payload?.detail) error.detail = payload.detail;
    throw error;
  }

  return isJson ? res.json() : res.text();
>>>>>>> 626638b (feat: secure auth flow and admin dashboard integration)
}

export const api = {
  signup: (payload) => request('/auth/signup', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  me: (token) => request('/auth/me', { token }),
  createPost: (token, payload) => request('/posts', { method: 'POST', body: payload, token }),
  listPosts: () => request('/posts'),
  createReview: (token, payload) => request('/reviews', { method: 'POST', body: payload, token }),
  listProductReviews: (slug) => request(`/products/${encodeURIComponent(slug)}/reviews`),
  listProducts: (category) => request(`/products${category ? `?category=${encodeURIComponent(category)}` : ''}`),
  getProduct: (slug) => request(`/products/${encodeURIComponent(slug)}`),
<<<<<<< HEAD
=======
  admin: {
    listUsers: (token) => request('/admin/users', { token }),
    setUserBlocked: (token, userId, isBlocked) =>
      request(`/admin/users/${userId}/block`, {
        method: 'PATCH',
        token,
        body: { isBlocked }
      }),
    setUserRole: (token, userId, role) =>
      request(`/admin/users/${userId}/role`, {
        method: 'PATCH',
        token,
        body: { role }
      }),
    listProducts: (token) => request('/admin/products', { token }),
    setProductStatus: (token, productId, isActive) =>
      request(`/admin/products/${productId}/status`, {
        method: 'PATCH',
        token,
        body: { isActive }
      }),
    listReviews: (token) => request('/admin/reviews', { token }),
    deleteReview: (token, reviewId) =>
      request(`/admin/reviews/${reviewId}`, { method: 'DELETE', token }),
    listPosts: (token) => request('/admin/posts', { token }),
    setPostStatus: (token, postId, isActive) =>
      request(`/admin/posts/${postId}/status`, {
        method: 'PATCH',
        token,
        body: { isActive }
      })
  }
>>>>>>> 626638b (feat: secure auth flow and admin dashboard integration)
};

export default api;



