/**
 * Frontend API Utility wrappers
 * Configured dynamically: point API_BASE_URL to your backend.
 */
const API_BASE_URL = 'http://localhost:8000/api';
const USE_MOCK = true; // Toggle this to false when connecting to the real backend

window.apiLogin = async function(email, password) {
  console.log(`[API] login for ${email}`);
  if (USE_MOCK) return new Promise(r => setTimeout(() => r({ success: true, token: 'mock' }), 800));
  
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
};

window.apiSignup = async function(data) {
  console.log(`[API] signup for ${data.email}`);
  if (USE_MOCK) return new Promise(r => setTimeout(() => r({ success: true }), 800));

  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Signup failed');
  return res.json();
};

window.apiFetchProducts = async function() {
  console.log(`[API] fetching products...`);
  if (USE_MOCK) return new Promise(r => setTimeout(() => r([]), 500));

  const res = await fetch(`${API_BASE_URL}/products`);
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
      body: JSON.stringify({ items: cartItems })
    });
    if (!res.ok) console.warn('[API] Cart sync non-200 response');
    return res.ok;
  } catch (err) {
    console.error('[API] Cart sync network error:', err);
    return false;
  }
};

