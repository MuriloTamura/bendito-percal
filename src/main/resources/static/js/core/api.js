class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function apiRequest(method, path, body) {
  const baseUrl = window.APP_CONFIG?.api?.baseUrl || "";
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    credentials: "include",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 204) return null;

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      window.dispatchEvent(new CustomEvent("api:unauthorized"));
    }
    throw new ApiError(
      response.status,
      data?.message || `Não foi possível concluir a operação (HTTP ${response.status}).`,
      data,
    );
  }

  return data;
}

window.api = Object.freeze({
  get: (path) => apiRequest("GET", path),
  post: (path, body) => apiRequest("POST", path, body),
  put: (path, body) => apiRequest("PUT", path, body),
  patch: (path, body) => apiRequest("PATCH", path, body),
  delete: (path) => apiRequest("DELETE", path),
});

window.ApiError = ApiError;
