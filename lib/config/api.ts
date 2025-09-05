export const API_CONFIG = {
  // FastAPI service URL - update this based on your deployment
  FASTAPI_URL: process.env.FASTAPI_URL || "http://localhost:8000",

  // Timeout for API calls (in milliseconds)
  TIMEOUT: 30000,

  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
}

export async function callFastAPI(
  endpoint: string,
  data: any,
  authHeader?: string | null,
  retries = API_CONFIG.MAX_RETRIES,
): Promise<any> {
  const url = `${API_CONFIG.FASTAPI_URL}${endpoint}`

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT)

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (authHeader) {
      headers["Authorization"] = authHeader
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`FastAPI error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`FastAPI call failed (${retries} retries left):`, error)

    if (retries > 0 && error instanceof Error && !error.message.includes("aborted")) {
      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, API_CONFIG.RETRY_DELAY))
      return callFastAPI(endpoint, data, authHeader, retries - 1)
    }

    throw error
  }
}

export async function callFastAPIGet(
  endpoint: string,
  authHeader?: string | null,
  retries = API_CONFIG.MAX_RETRIES,
): Promise<any> {
  const url = `${API_CONFIG.FASTAPI_URL}${endpoint}`

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT)

    const headers: Record<string, string> = {}

    if (authHeader) {
      headers["Authorization"] = authHeader
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`FastAPI error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`FastAPI GET call failed (${retries} retries left):`, error)

    if (retries > 0 && error instanceof Error && !error.message.includes("aborted")) {
      await new Promise((resolve) => setTimeout(resolve, API_CONFIG.RETRY_DELAY))
      return callFastAPIGet(endpoint, authHeader, retries - 1)
    }

    throw error
  }
}
