import createClient from "openapi-fetch";
import { API_BASE, API_URL } from "./config";
import type { paths } from "./schema";
import { session } from "./session";
import type { Page } from "./types";

/** Error thrown for any non-2xx API response, carrying the API's machine-readable code. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** A request that hasn't answered in this long fails with TIMEOUT instead of spinning forever. */
export const REQUEST_TIMEOUT_MS = 30_000;

const withTimeout = (signal: AbortSignal | null | undefined) => {
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  return signal && typeof AbortSignal.any === "function" ? AbortSignal.any([signal, timeout]) : timeout;
};

// `fetch` is resolved per call so environments (and tests) that replace the global are honoured.
export const api = createClient<paths>({ baseUrl: API_BASE, fetch: (req) => globalThis.fetch(req, { signal: withTimeout(req.signal) }) });
api.use({
  onRequest({ request }) {
    const token = session.getAccess();
    if (token && !request.headers.has("Authorization")) request.headers.set("Authorization", `Bearer ${token}`);
    return request;
  },
});

type FetchLike = { data?: unknown; error?: unknown; response: Response };
type ErrorBody = { error?: { code?: string; message?: string; details?: unknown; requestId?: string } };

const isAuthExpiry = (error: unknown) => {
  const code = (error as ErrorBody | undefined)?.error?.code;
  return code === "TOKEN_EXPIRED" || code === "UNAUTHORIZED";
};
/** Maps a thrown fetch/parse failure to an ApiError the UI can explain. Caller aborts are re-thrown untouched. */
const transportError = (cause: unknown): ApiError => {
  const name = (cause as { name?: string } | null)?.name;
  if (name === "TimeoutError") return new ApiError(0, "TIMEOUT", "The server took too long to respond. Please try again.", cause);
  if (cause instanceof SyntaxError) return new ApiError(0, "BAD_RESPONSE", "The server sent an unexpected response. Please try again.", cause);
  return new ApiError(0, "NETWORK", `Can't reach the API at ${API_URL}`, cause);
};
const isCallerAbort = (e: unknown) => (e as { name?: string } | null)?.name === "AbortError";
const call = async <R,>(fn: () => Promise<R>): Promise<R> => {
  try {
    return await fn();
  } catch (e) {
    if (isCallerAbort(e)) throw e;
    throw transportError(e);
  }
};

/**
 * Runs a typed call. On an expired access token it refreshes once and retries, then unwraps the
 * `{ data, meta }` envelope or throws ApiError. Resolves undefined for empty 204 responses.
 */
export async function request<R extends FetchLike>(fn: () => Promise<R>): Promise<NonNullable<R["data"]>> {
  let res = await call(fn);
  if (res.response.status === 401 && isAuthExpiry(res.error)) {
    // A session we can't renew is over: tell the app so it returns to the login page.
    if (session.getRefresh() && (await session.refresh())) res = await call(fn);
    else if (session.getAccess() || session.getRefresh()) session.expire();
  }
  if (!res.response.ok) {
    const body = (res.error ?? {}) as ErrorBody;
    const status = res.response.status;
    const fallback = status === 413 ? "That file or request is too large." : status >= 500 ? "The server hit a problem. Please try again." : res.response.statusText || "Request failed";
    throw new ApiError(status, body.error?.code ?? (status >= 500 ? "SERVER_ERROR" : "HTTP_ERROR"), body.error?.message ?? fallback, body.error?.details, body.error?.requestId);
  }
  return res.data as NonNullable<R["data"]>;
}

type Unwrapped<R extends FetchLike> = NonNullable<R["data"]> extends { data: infer D } ? D : never;

/** `request`, returning only the envelope's `data`. */
export async function requestData<R extends FetchLike>(fn: () => Promise<R>): Promise<Unwrapped<R>> {
  const env = (await request(fn)) as unknown as { data: Unwrapped<R> } | undefined;
  return env?.data as Unwrapped<R>;
}

type Items<R extends FetchLike> = NonNullable<R["data"]> extends { data: (infer I)[] } ? I : never;

/** `request` for list endpoints: the envelope typed as a `Page` (meta is absent on unpaginated lists). */
export async function requestPage<R extends FetchLike>(fn: () => Promise<R>): Promise<Page<Items<R>>> {
  return (await request(fn)) as unknown as Page<Items<R>>;
}

/** Super Admin calls target a tenant with this header; customer calls send nothing. */
export const companyHeader = (companyId?: string | null): Record<string, string> => (companyId ? { "X-Company-Id": companyId } : {});
/** Fresh key per user action; the API replays the stored response on retries. Passed as `params.header` because the spec declares it required. */
export const idempotencyKey = () => ({ "idempotency-key": crypto.randomUUID() });
