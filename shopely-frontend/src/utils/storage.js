// Tiny localStorage helpers shared across the demo-data-driven contexts.
// Centralising get/set here keeps JSON.parse/stringify + error handling in one place.

export function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage can throw in private-browsing / quota-exceeded situations —
    // the demo should keep working in-memory even if persistence silently fails.
  }
}

export function generateId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}