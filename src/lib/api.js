const API_BASE_URL = window.API_BASE_URL || 'http://localhost:4000';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let errorMessage = `Request failed: ${res.status}`;
    try {
      const json = JSON.parse(text);
      errorMessage = json.message || errorMessage;
    } catch {
      // JSON이 아니면 텍스트 그대로 사용
      if (text) {
        errorMessage = text;
      }
    }
    throw new Error(errorMessage);
  }
  const contentType = res.headers.get('content-type') || '';
  return contentType.includes('application/json') ? res.json() : res.text();
}

export const api = {
  signup: (payload) => request('/auth/signup', { method: 'POST', body: payload }),
  checkNameDuplicate: (name) => request(`/auth/check-name?name=${encodeURIComponent(name)}`),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  me: (token) => request('/auth/me', { token }),
  createReview: (token, payload) => request('/reviews', { method: 'POST', body: payload, token }),
  listProductReviews: (slug) => request(`/products/${encodeURIComponent(slug)}/reviews`),
  listProducts: (category) => request(`/products${category ? `?category=${encodeURIComponent(category)}` : ''}`),
  getProduct: (slug) => request(`/products/${encodeURIComponent(slug)}`),
  adminListUsers: (token) => request('/admin/users', { token }),
  adminBlockUser: (token, userId) => request(`/users/${userId}/block`, { method: 'PATCH', token }),
  adminUnblockUser: (token, userId) => request(`/users/${userId}/unblock`, { method: 'PATCH', token }),
  adminDeleteUser: (token, userId) => request(`/admin/users/${userId}`, { method: 'DELETE', token }),
  adminListReviews: (token) => request('/admin/reviews', { token }),
  adminDeleteReview: (token, reviewId) => request(`/admin/reviews/${reviewId}`, { method: 'DELETE', token }),
  adminListProducts: (token) => request('/admin/products', { token }),
  adminDeleteProduct: (token, productId) => request(`/admin/products/${productId}`, { method: 'DELETE', token }),
  adminToggleProduct: (token, productId, isActive) => request(`/admin/products/${productId}/toggle`, { method: 'PATCH', body: { isActive }, token }),
  // Cart
  getCart: (token) => request('/cart', { token }),
  addToCart: (token, payload) => request('/cart', { method: 'POST', body: payload, token }),
  updateCartItem: (token, cartItemId, payload) => request(`/cart/${cartItemId}`, { method: 'PATCH', body: payload, token }),
  deleteCartItem: (token, cartItemId) => request(`/cart/${cartItemId}`, { method: 'DELETE', token }),
  // Orders
  createOrder: (token) => request('/orders', { method: 'POST', token }),
  getOrders: (token) => request('/orders', { token }),
  // Admin: orders
  adminListOrders: (token) => request('/admin/orders', { token }),
  adminUpdateOrderStatus: (token, orderId, status) => request(`/admin/orders/${orderId}/status`, { method: 'PATCH', body: { status }, token }),
};

export default api;



