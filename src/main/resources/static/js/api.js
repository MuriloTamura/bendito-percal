/**
 * api.js — camada fina sobre fetch(). Sem framework, sem dependência externa.
 *
 * Todas as chamadas usam credentials: 'include' para que o cookie de sessão
 * (JSESSIONID) seja enviado — é assim que o backend sabe quem está logado.
 */

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function apiRequest(method, path, body) {
  const base = window.APP_CONFIG?.apiBaseUrl ?? "";

  const response = await fetch(base + path, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  // 204 No Content — sem corpo para ler
  if (response.status === 204) {
    return null;
  }

  const isJson = (response.headers.get("content-type") || "").includes("application/json");
  const data = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    // O GlobalExceptionHandler do backend devolve { timestamp, message }
    const message = data?.message || `Erro inesperado (HTTP ${response.status})`;
    throw new ApiError(response.status, message);
  }

  return data;
}

const api = {
  get: (path) => apiRequest("GET", path),
  post: (path, body) => apiRequest("POST", path, body),
  patch: (path, body) => apiRequest("PATCH", path, body),
  delete: (path) => apiRequest("DELETE", path),
};
