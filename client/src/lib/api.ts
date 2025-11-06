const API_BASE = "/api/trpc";

export async function apiCall(procedure: string, input?: any, token?: string | null) {
  const url = `${API_BASE}/${procedure}`;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ input }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erro desconhecido" }));
    throw new Error(error.message || `HTTP error ${response.status}`);
  }
  
  const data = await response.json();
  return data.result?.data;
}
