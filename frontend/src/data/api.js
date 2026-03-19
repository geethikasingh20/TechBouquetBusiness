const API_BASE = "http://localhost:8080";

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
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
