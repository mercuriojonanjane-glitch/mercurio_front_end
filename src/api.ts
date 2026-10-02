export type Product = { id: number; product_name: string; description: string; price: string; quantity: number; created_at: string }
export type TokenPair = { access_token: string; refresh_token: string; expires_in: number; token_type: string }
export type Session = { user: { id: number; username: string; email: string; role: 'admin' | 'user' | 'moderator' }; tokens: TokenPair }
type ApiPayload<T> = T & { error?: string; message?: string }
const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost/Lab_6/Lava_Back_End/public').replace(/\/+$/, '')

async function readResponse<T>(response: Response): Promise<ApiPayload<T>> {
  let payload: ApiPayload<T>
  try { payload = await response.json() as ApiPayload<T> }
  catch { throw new Error(`The API returned an unreadable response (${response.status}).`) }
  if (!response.ok) throw new Error(payload.error || payload.message || `Request failed (${response.status}).`)
  return payload
}

export async function authRequest(path: string, body: Record<string, unknown>): Promise<Session> {
  let response: Response
  try { response = await fetch(`${baseUrl}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) }) }
  catch { throw new Error('Could not reach the LavaLust API. Check its URL and CORS configuration.') }
  return readResponse<Session>(response)
}

export async function apiRequest<T = unknown>(path: string, session: Session, onSession: (session: Session | null) => void, options: RequestInit & { skipRefresh?: boolean } = {}): Promise<T> {
  const { skipRefresh = false, ...requestOptions } = options
  const execute = (accessToken: string) => fetch(`${baseUrl}${path}`, { ...requestOptions, headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...requestOptions.headers, Authorization: `Bearer ${accessToken}` } })
  let response: Response
  try { response = await execute(session.tokens.access_token) }
  catch { throw new Error('Could not reach the LavaLust API. Check its URL and CORS configuration.') }
  if (response.status === 401 && !skipRefresh) {
    let refreshed: ApiPayload<{ tokens: TokenPair }>
    try {
      const refreshResponse = await fetch(`${baseUrl}/api/auth/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ refresh_token: session.tokens.refresh_token }) })
      refreshed = await readResponse<{ tokens: TokenPair }>(refreshResponse)
    } catch {
      onSession(null)
      throw new Error('Your session expired. Sign in again to continue.')
    }
    const nextSession = { ...session, tokens: refreshed.tokens }
    onSession(nextSession)
    response = await execute(nextSession.tokens.access_token)
  }
  return readResponse<T>(response)
}
