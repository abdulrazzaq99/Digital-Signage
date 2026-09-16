import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, api, request, requestData } from "./client";
import { session } from "./session";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const sentRequest = (call: unknown[]): Request => (call[0] instanceof Request ? call[0] : new Request(call[0] as string, call[1] as RequestInit));

describe("client", () => {
  beforeEach(() => { session.clear(); vi.restoreAllMocks(); });

  it("sends the bearer token and unwraps the envelope", async () => {
    session.setTokens({ accessToken: "tok", refreshToken: "r" });
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(json({ data: [{ id: "s1" }], meta: { page: 1, pageSize: 25, total: 1, totalPages: 1 } }));
    const env = await request(() => api.GET("/screens"));
    expect(env.meta?.total).toBe(1);
    const req = sentRequest(fetchMock.mock.calls[0]);
    expect(req.headers.get("authorization")).toBe("Bearer tok");
    expect(req.url).toBe("http://api.test/api/v1/screens");
  });

  it("throws ApiError carrying the API code", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(json({ error: { code: "LICENSE_LIMIT_REACHED", message: "Limit", requestId: "rq1" } }, 409));
    await expect(requestData(() => api.GET("/screens"))).rejects.toMatchObject({ status: 409, code: "LICENSE_LIMIT_REACHED", requestId: "rq1" } satisfies Partial<ApiError>);
  });

  it("refreshes once on TOKEN_EXPIRED and retries with the new token", async () => {
    session.setTokens({ accessToken: "old", refreshToken: "r1" });
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(json({ error: { code: "TOKEN_EXPIRED", message: "expired" } }, 401))
      .mockResolvedValueOnce(json({ data: { accessToken: "new", refreshToken: "r2" } }))
      .mockResolvedValueOnce(json({ data: { id: "me" } }));
    const me = await requestData(() => api.GET("/auth/me"));
    expect(me).toEqual({ id: "me" });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(sentRequest(fetchMock.mock.calls[2]).headers.get("authorization")).toBe("Bearer new");
  });

  it("does not retry when there is no refresh token", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(json({ error: { code: "UNAUTHORIZED", message: "no" } }, 401));
    await expect(requestData(() => api.GET("/auth/me"))).rejects.toMatchObject({ status: 401, code: "UNAUTHORIZED" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("maps network failures to NETWORK", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(requestData(() => api.GET("/screens"))).rejects.toMatchObject({ status: 0, code: "NETWORK" });
  });

  it("returns undefined for empty 204 responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    await expect(request(() => api.DELETE("/media/{id}", { params: { path: { id: "m1" } } }))).resolves.toBeUndefined();
  });
});
