const API_BASE = import.meta.env.VITE_API_BASE || "";
const PRODUCTS_CACHE_KEY = "techbouquet_products_cache";
const PRODUCTS_CACHE_TTL_MS = 5 * 60 * 1000;
let productsFetchPromise = null;

export async function apiFetch(path, options = {}) {
  const { headers = {}, ...rest } = options;
  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Request failed");
  }

  if (response.status === 204) return null;
  return response.json();
}

export async function loginApi(payload) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function registerApi(payload) {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function verifyEmailApi(token) {
  return apiFetch("/api/auth/verify-email", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function fetchProfile(token) {
  return apiFetch("/api/profile/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function fetchProducts() {
  return apiFetch("/api/products");
}

export function readProductsCache() {
  try {
    const raw = localStorage.getItem(PRODUCTS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.items || !parsed?.ts) return null;
    if (Date.now() - parsed.ts > PRODUCTS_CACHE_TTL_MS) return null;
    return parsed.items;
  } catch {
    return null;
  }
}

export function writeProductsCache(items) {
  localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify({ ts: Date.now(), items }));
}

export async function fetchProductsCached() {
  const cached = readProductsCache();
  if (cached) return { items: cached, cached: true };
  if (productsFetchPromise) return productsFetchPromise;

  productsFetchPromise = (async () => {
    const items = await fetchProducts();
    writeProductsCache(items);
    return { items, cached: false };
  })();

  try {
    return await productsFetchPromise;
  } finally {
    productsFetchPromise = null;
  }
}

export async function fetchProductById(id) {
  return apiFetch(`/api/products/${id}`);
}

export async function searchProducts(query) {
  return apiFetch(`/api/products/search?q=${encodeURIComponent(query)}`);
}

export async function fetchCart(token) {
  return apiFetch("/api/cart", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function addCartItem(token, payload) {
  return apiFetch("/api/cart/items", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
}

export async function updateCartItem(token, itemId, quantity) {
  return apiFetch(`/api/cart/items/${itemId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ quantity })
  });
}

export async function removeCartItem(token, itemId) {
  return apiFetch(`/api/cart/items/${itemId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function clearCartApi(token) {
  return apiFetch("/api/cart/clear", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
