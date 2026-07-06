import api from "./api";

export async function login(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  return data; // expected shape: { user, token }
}

export async function register(name, email, password) {
  const { data } = await api.post("/auth/register", { name, email, password });
  return data; // expected shape: { user, token }
}

export async function getCurrentUser() {
  const { data } = await api.get("/auth/me");
  return data;
}

export async function updateProfile(updates) {
  const { data } = await api.put("/auth/profile", updates);
  return data;
}

export async function changePassword(currentPassword, newPassword) {
  const { data } = await api.put("/auth/password", { currentPassword, newPassword });
  return data;
}