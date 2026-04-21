const API_BASE = "http://localhost:5000/api";

/**
 * Fetch wrapper with automatic JWT headers and JSON parsing.
 */
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("ridebuddy_token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.message || "Something went wrong");
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

/* ─── Auth API ─── */
export const authAPI = {
  signup: (body) =>
    apiFetch("/auth/signup", { method: "POST", body: JSON.stringify(body) }),

  login: (body) =>
    apiFetch("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  getMe: () => apiFetch("/auth/me"),
};

/* ─── Rides API ─── */
export const ridesAPI = {
  search: (params = {}) => {
    const query = new URLSearchParams();
    if (params.from) query.set("from", params.from);
    if (params.to) query.set("to", params.to);
    if (params.date) query.set("date", params.date);
    if (params.seats) query.set("seats", params.seats);
    return apiFetch(`/rides?${query.toString()}`);
  },

  getById: (id) => apiFetch(`/rides/${id}`),

  create: (body) =>
    apiFetch("/rides", { method: "POST", body: JSON.stringify(body) }),

  join: (id) => apiFetch(`/rides/${id}/join`, { method: "POST" }),

  getMyRides: () => apiFetch("/rides/my"),
};

/* ─── Auth Helpers ─── */
export const saveAuth = (token, user) => {
  localStorage.setItem("ridebuddy_token", token);
  localStorage.setItem("ridebuddy_user", JSON.stringify(user));
};

export const getUser = () => {
  const raw = localStorage.getItem("ridebuddy_user");
  return raw ? JSON.parse(raw) : null;
};

export const getToken = () => {
  return localStorage.getItem("ridebuddy_token");
};

export const logout = () => {
  localStorage.removeItem("ridebuddy_token");
  localStorage.removeItem("ridebuddy_user");
};

export const isLoggedIn = () => {
  return !!localStorage.getItem("ridebuddy_token");
};
