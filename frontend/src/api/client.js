const API_BASE_URL = "http://localhost:3000/api";

function getToken() {
  return localStorage.getItem("uno_token");
}

async function request(path, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(data?.error || "Erro na requisição");
  }

  return data;
}

export const api = {
  get(path) {
    return request(path, { method: "GET" });
  },
  post(path, body = {}) {
    return request(path, {
      method: "POST",
      body: JSON.stringify(body)
    });
  },
  put(path, body = {}) {
    return request(path, {
      method: "PUT",
      body: JSON.stringify(body)
    });
  },
  delete(path) {
    return request(path, { method: "DELETE" });
  }
};

export { API_BASE_URL };