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

// `fetch` is resolved per call so environments (and tests) that replace the global are honoured.
export const api = createClient<paths>({ baseUrl: API_BASE, fetch: (req) => globalThis.fetch(req) });
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
const networkError = (cause: unknown) => new ApiError(0, "NETWORK", `Can't reach the API at ${API_URL}`, cause);

/**
 * Runs a typed call. On an expired access token it refreshes once and retries, then unwraps the
 * `{ data, meta }` envelope or throws ApiError. Resolves undefined for empty 204 responses.
 */
export async function request<R extends FetchLike>(fn: () => Promise<R>): Promise<NonNullable<R["data"]>> {
  let res: R;
  try { res = await fn(); } catch (e) { throw networkError(e); }
  if (res.response.status === 401 && isAuthExpiry(res.error) && session.getRefresh()) {
    if (await session.refresh()) {
      try { res = await fn(); } catch (e) { throw networkError(e); }
    }
  }
  if (!res.response.ok) {
    const body = (res.error ?? {}) as ErrorBody;
    throw new ApiError(res.response.status, body.error?.code ?? "HTTP_ERROR", body.error?.message ?? (res.response.statusText || "Request failed"), body.error?.details, body.error?.requestId);
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
