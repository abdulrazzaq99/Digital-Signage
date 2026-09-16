import { beforeEach, describe, expect, it, vi } from "vitest";
import { session } from "./session";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

describe("session", () => {
  beforeEach(() => { session.clear(); vi.restoreAllMocks(); });

  it("stores the refresh token and keeps the access token in memory", () => {
    session.setTokens({ accessToken: "a1", refreshToken: "r1" });
    expect(session.getAccess()).toBe("a1");
    expect(localStorage.getItem("dsp.refresh")).toBe("r1");
  });

  it("refreshes once for concurrent callers", async () => {
    session.setTokens({ accessToken: "old", refreshToken: "r1" });
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(json({ data: { accessToken: "new", refreshToken: "r2" } }));
    const [a, b] = await Promise.all([session.refresh(), session.refresh()]);
    expect(a && b).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(session.getAccess()).toBe("new");
    expect(session.getRefresh()).toBe("r2");
  });

  it("clears everything when the refresh token is rejected", async () => {
    session.setTokens({ accessToken: "old", refreshToken: "r1" });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(json({ error: { code: "TOKEN_REUSED" } }, 401));
    expect(await session.refresh()).toBe(false);
    expect(session.getAccess()).toBeNull();
    expect(session.getRefresh()).toBeNull();
  });

  it("notifies listeners on change", () => {
    const fn = vi.fn();
    const off = session.onChange(fn);
    session.setTokens({ accessToken: "a", refreshToken: "r" });
    off();
    session.clear();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
