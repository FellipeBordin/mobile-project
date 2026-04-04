import { API_URL } from "../config/api";
import { getToken } from "./session";

export async function apiFetch(path: string, init: RequestInit = {}) {
  const token = await getToken();

  const headers = new Headers(init.headers ?? {});

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });
}
