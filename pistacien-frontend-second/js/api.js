/**
 * Frontend API Utility wrappers
 * Configured dynamically: point API_BASE_URL to your backend.
 */
const getApiBaseUrl = () => {
  const localHosts = ['localhost', '127.0.0.1'];
  if (localHosts.includes(window.location.hostname) || window.location.hostname.startsWith('192.168.')) {
    return 'http://localhost:5000/api';
  }
  return 'https://pistasien-backend.onrender.com/api';
};

const API_BASE_URL = getApiBaseUrl();
window.API_BASE_URL = API_BASE_URL; // Expose globally for other scripts
const USE_MOCK = false; // Toggle this to false when connecting to the real backend

// Global Premium Toast Notification System
window.showToast = function(message, type = 'info') {
  let style = document.getElementById('toast-styles');
  if (!style) {
    style = document.createElement('style');
    style.id = 'toast-styles';
    style.innerHTML = `
      .custom-toast-container {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        pointer-events: none;
        max-width: 380px;
        width: calc(100% - 4rem);
      }
      .custom-toast {
        padding: 1rem 1.25rem;
        border-radius: 8px;
        background: rgba(26, 26, 20, 0.95);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        color: #f7f6f0;
        font-family: 'Jost', sans-serif;
        font-size: 0.88rem;
        line-height: 1.4;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        transform: translateY(20px);
        opacity: 0;
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
        pointer-events: auto;
        border-left: 4px solid #5bc0de;
      }
      .custom-toast.success {
        border-left-color: #98c1a6; /* Pistachio */
      }
      .custom-toast.error {
        border-left-color: #d9534f; /* Coral Red */
      }
      .custom-toast.warning {
        border-left-color: #f0ad4e; /* Amber Gold */
      }
      .custom-toast.info {
        border-left-color: #5bc0de; /* Info Blue */
      }
      .custom-toast.is-visible {
        transform: translateY(0);
        opacity: 1;
      }
      .custom-toast-icon {
        flex-shrink: 0;
        width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .custom-toast-content {
        flex-grow: 1;
      }
      .custom-toast-close {
        flex-shrink: 0;
        cursor: pointer;
        opacity: 0.5;
        transition: opacity 0.2s ease;
        background: none;
        border: none;
        color: inherit;
        padding: 0;
        font-size: 1.1rem;
        line-height: 1;
      }
      .custom-toast-close:hover {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  }

  let container = document.querySelector('.custom-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'custom-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `custom-toast ${type}`;
  
  let iconHtml = '';
  if (type === 'success') {
    iconHtml = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === 'error') {
    iconHtml = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  } else if (type === 'warning') {
    iconHtml = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
  } else {
    iconHtml = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `
    <div class="custom-toast-icon">${iconHtml}</div>
    <div class="custom-toast-content">${message}</div>
    <button class="custom-toast-close" aria-label="Close">&times;</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('is-visible');
  }, 10);

  const autoRemoveTimer = setTimeout(() => {
    removeToast();
  }, 4000);

  function removeToast() {
    toast.classList.remove('is-visible');
    toast.addEventListener('transitionend', () => {
      toast.remove();
      if (container.children.length === 0) {
        container.remove();
      }
    });
  }

  toast.querySelector('.custom-toast-close').addEventListener('click', () => {
    clearTimeout(autoRemoveTimer);
    removeToast();
  });
};

// Override window.alert with window.showToast
window.alert = function(message) {
  window.showToast(message, 'info');
};

// Persistent Toast system for cross-page redirects
window.showToastNextPage = function(message, type = 'info') {
  sessionStorage.setItem('pendingToastMessage', message);
  sessionStorage.setItem('pendingToastType', type);
};

document.addEventListener("DOMContentLoaded", () => {
  const pendingMessage = sessionStorage.getItem('pendingToastMessage');
  const pendingType = sessionStorage.getItem('pendingToastType') || 'info';
  if (pendingMessage) {
    sessionStorage.removeItem('pendingToastMessage');
    sessionStorage.removeItem('pendingToastType');
    setTimeout(() => {
      window.showToast(pendingMessage, pendingType);
    }, 500); // 500ms delay to allow animations/transitions to settle
  }
});

window.apiLogin = async function(email, password) {
  console.log(`[API] login for ${email}`);
  if (USE_MOCK) return new Promise(r => setTimeout(() => r({ success: true, token: 'mock' }), 800));
  
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include'
  });
  
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || 'Login failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

window.apiSignup = async function(data) {
  console.log(`[API] signup for ${data.email}`);
  if (USE_MOCK) return new Promise(r => setTimeout(() => r({ success: true }), 800));

  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include'
  });
  
  const responseData = await res.json();
  if (!res.ok) {
    const err = new Error(responseData.message || 'Signup failed');
    err.status = res.status;
    err.data = responseData;
    throw err;
  }
  return responseData;
};

window.apiFetchProducts = async function() {
  console.log(`[API] fetching products...`);
  if (USE_MOCK) return new Promise(r => setTimeout(() => r([]), 500));

  const res = await fetch(`${API_BASE_URL}/products`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Fetching products failed');
  return res.json();
};

window.apiSyncCart = async function(cartItems) {
  if (USE_MOCK) {
    console.log(`[API - MOCK] synced cart items count: ${cartItems.length}`);
    return true;
  }
  
  console.log(`[API] syncing cart items count: ${cartItems.length}`);
  try {
    const res = await fetch(`${API_BASE_URL}/cart/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cartItems }),
      credentials: 'include'
    });
    if (!res.ok) console.warn('[API] Cart sync non-200 response');
    return res.ok;
  } catch (err) {
    console.error('[API] Cart sync network error:', err);
    return false;
  }
};

window.apiVerifyEmail = async function(userId, otp) {
  console.log(`[API] verifying email for user ${userId}`);
  if (USE_MOCK) return new Promise(r => setTimeout(() => r({ success: true }), 800));

  const res = await fetch(`${API_BASE_URL}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, otp }),
    credentials: 'include'
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || 'OTP verification failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

window.apiResendOTP = async function(userId) {
  console.log(`[API] resending OTP for user ${userId}`);
  if (USE_MOCK) return new Promise(r => setTimeout(() => r({ success: true }), 800));

  const res = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
    credentials: 'include'
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || 'Resending OTP failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

window.apiFetchCart = async function() {
  console.log(`[API] fetching cart...`);
  if (USE_MOCK) return { success: true, data: { items: [] } };

  const res = await fetch(`${API_BASE_URL}/cart`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || 'Fetching cart failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

window.apiPlaceOrder = async function(address) {
  console.log(`[API] placing order for address: ${address}`);
  if (USE_MOCK) return new Promise(r => setTimeout(() => r({ success: true, data: { id: 'mock-order-id' } }), 800));

  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address }),
    credentials: 'include'
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || 'Order placement failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

window.apiGetProfile = async function() {
  console.log(`[API] fetching user profile...`);
  if (USE_MOCK) return { success: true, data: { name: 'Mock User', email: 'mock@example.com', phone: '1234567890', profile: { address: '123 Mock St', city: 'Mocktown', country: 'Mockland', zipCode: '12345' } } };

  const res = await fetch(`${API_BASE_URL}/profile`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || 'Fetching profile failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

window.apiUpdateProfile = async function(profileData) {
  console.log(`[API] updating user profile...`);
  if (USE_MOCK) return { success: true, data: profileData };

  const res = await fetch(`${API_BASE_URL}/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData),
    credentials: 'include'
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || 'Updating profile failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

window.apiGetOrders = async function() {
  console.log(`[API] fetching order history...`);
  if (USE_MOCK) return { success: true, data: [] };

  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || 'Fetching orders failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

window.apiLogout = async function() {
  console.log(`[API] logging out...`);
  if (USE_MOCK) return { success: true };

  const res = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || 'Logout failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

window.apiCreateProduct = async function(productData) {
  console.log(`[API] creating product...`);
  if (USE_MOCK) return { success: true, data: productData };

  const res = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
    credentials: 'include'
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || 'Creating product failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

window.apiUpdateProduct = async function(productId, productData) {
  console.log(`[API] updating product ${productId}...`);
  if (USE_MOCK) return { success: true, data: productData };

  const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
    credentials: 'include'
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || 'Updating product failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

window.apiDeleteProduct = async function(productId) {
  console.log(`[API] deleting product ${productId}...`);
  if (USE_MOCK) return { success: true };

  const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || 'Deleting product failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

window.apiUploadImage = async function(file) {
  console.log(`[API] uploading image file: ${file.name}...`);
  
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_BASE_URL}/admin/upload`, {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || 'Image upload failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

window.apiAdminGetOrders = async function() {
  console.log(`[API] admin fetching all orders...`);
  if (USE_MOCK) return { success: true, data: [] };

  const res = await fetch(`${API_BASE_URL}/admin/orders`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || 'Fetching orders failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

window.apiAdminGetOrderById = async function(orderId) {
  console.log(`[API] admin fetching order details for ${orderId}...`);
  if (USE_MOCK) return { success: true, data: null };

  const res = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || 'Fetching order details failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

window.apiAdminUpdateOrderStatus = async function(orderId, status, note) {
  console.log(`[API] admin updating order ${orderId} to status ${status}...`);
  if (USE_MOCK) return { success: true };

  const res = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, note }),
    credentials: 'include'
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || 'Updating order status failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

window.apiGetAnalytics = async function() {
  console.log(`[API] admin fetching analytics...`);
  if (USE_MOCK) {
    return {
      success: true,
      data: {
        totalProducts: 0,
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        lowStockAlerts: [],
        recentOrders: []
      }
    };
  }

  const res = await fetch(`${API_BASE_URL}/admin/analytics`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || 'Fetching analytics failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

